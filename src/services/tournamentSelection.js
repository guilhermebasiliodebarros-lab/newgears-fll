import { arrayRemove, doc, increment, runTransaction, updateDoc, writeBatch } from 'firebase/firestore';
import { assertActiveSeason } from './teamProcesses.js';

const adapter = { arrayRemove, doc, increment, runTransaction, updateDoc, writeBatch };
export const tournamentDraftId = (seasonId) => encodeURIComponent(seasonId);
const selectionId = (seasonId, studentId) => encodeURIComponent(`${seasonId}__selection__${studentId}__`);
const idsOf = (values = []) => [...new Set(values.map(String))].sort();
const initialIds = (selections) => idsOf(selections.filter((item) => item.selectedForTournament === true).map((item) => item.studentId));

export const tournamentSelectionError = (error) => {
  const code = `${error?.code || ''}`;
  const message = `${error?.message || ''}`;
  if (code.includes('resource-exhausted') || /quota exceeded/i.test(message)) return 'O Firebase atingiu o limite de uso e recusou esta operação. A alteração não foi confirmada. Tente novamente quando a cota do banco estiver disponível.';
  if (code.includes('permission-denied')) return 'O Firebase recusou a permissão para alterar a lista. As regras da coleção de preparação precisam permitir o acesso do técnico.';
  if (code.includes('unavailable') || code.includes('failed-precondition')) return 'Não foi possível confirmar a alteração no Firebase. Confira a conexão e tente novamente.';
  return message || 'Não foi possível salvar a lista. Tente novamente.';
};

export async function saveTournamentCandidate({ db, seasonId, studentId, selected, selections = [], expectedRevision = 0, knownDraft, actor, store = adapter }) {
  selections = selections.filter((item) => (item.seasonId || 'legacy') === seasonId);
  // Removing a known candidate cannot increase the roster. An atomic field
  // transform preserves edits from other coaches and needs no database reads.
  if (!selected && knownDraft?.seasonId === seasonId && Array.isArray(knownDraft.studentIds)) {
    const updatedAt = new Date().toISOString();
    await store.updateDoc(store.doc(db, 'finalSprintTournamentDrafts', tournamentDraftId(seasonId)), {
      studentIds: store.arrayRemove(String(studentId)), revision: store.increment(1), updatedAt, updatedBy: actor,
    });
    return { ...knownDraft, studentIds: knownDraft.studentIds.filter((id) => String(id) !== String(studentId)), revision: (knownDraft.revision || 0) + 1, updatedAt, updatedBy: actor };
  }
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const reference = store.doc(db, 'finalSprintTournamentDrafts', tournamentDraftId(seasonId));
    const snapshot = await transaction.get(reference);
    const draft = snapshot.data();
    if ((draft?.revision || 0) !== expectedRevision) throw new Error('A lista mudou em outro acesso. Confira os nomes atualizados e tente novamente.');
    const studentSnapshot = await transaction.get(store.doc(db, 'students', String(studentId)));
    if (selected && (!studentSnapshot.exists() || studentSnapshot.data().status === 'inactive')) throw new Error('Este aluno não está ativo na equipe.');
    const previous = draft?.studentIds || initialIds(selections);
    const studentIds = idsOf(selected ? [...previous, studentId] : previous.filter((id) => String(id) !== String(studentId)));
    if (studentIds.length > 6) throw new Error('O limite de seis alunos selecionados já foi atingido.');
    const next = { seasonId, studentIds, revision: expectedRevision + 1, updatedAt: new Date().toISOString(), updatedBy: actor };
    transaction.set(reference, next, { merge: true });
    return { ...draft, ...next };
  });
}

export async function publishTournamentSelection({ db, seasonId, selections = [], expectedRevision = 0, expectedStudentIds = [], knownDraft, actor, store = adapter }) {
  selections = selections.filter((item) => (item.seasonId || 'legacy') === seasonId);
  // Withdrawing known invitations only removes these IDs, even if another
  // coach edits the draft meanwhile. Keep the writes atomic without reads.
  const withdrawing = idsOf([...(knownDraft?.publishedStudentIds || []), ...initialIds(selections)]);
  if (!expectedStudentIds.length && knownDraft?.seasonId === seasonId && Array.isArray(knownDraft.studentIds) && !knownDraft.studentIds.length && withdrawing.length) {
    const batch = store.writeBatch(db);
    const publishedAt = new Date().toISOString();
    for (const id of withdrawing) {
      const recordId = selections.find((item) => String(item.studentId) === id)?.id || selectionId(seasonId, id);
      batch.update(store.doc(db, 'finalSprintSelectionScores', recordId), { selectedForTournament: false, selectedAt: null, publishedAt, publishedBy: actor, updatedAt: publishedAt });
    }
    batch.update(store.doc(db, 'finalSprintTournamentDrafts', tournamentDraftId(seasonId)), {
      studentIds: store.arrayRemove(...withdrawing), publishedStudentIds: store.arrayRemove(...withdrawing), revision: store.increment(1), publishedAt, publishedBy: actor,
    });
    await batch.commit();
    return { ...knownDraft, studentIds: [], publishedStudentIds: [], revision: (knownDraft.revision || 0) + 1, publishedAt, publishedBy: actor };
  }
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const reference = store.doc(db, 'finalSprintTournamentDrafts', tournamentDraftId(seasonId));
    const snapshot = await transaction.get(reference);
    const draft = snapshot.data();
    const studentIds = idsOf(draft?.studentIds || initialIds(selections));
    if ((draft?.revision || 0) !== expectedRevision || JSON.stringify(studentIds) !== JSON.stringify(idsOf(expectedStudentIds))) throw new Error('A lista mudou durante a revisão. Confira os nomes antes de divulgar.');
    const previousIds = idsOf([...(draft?.publishedStudentIds || []), ...initialIds(selections)]);
    if ((!studentIds.length && !previousIds.length) || studentIds.length > 6) throw new Error('Escolha até seis integrantes para divulgar a convocação.');
    const students = await Promise.all(studentIds.map((id) => transaction.get(store.doc(db, 'students', id))));
    if (students.some((item) => !item.exists() || item.data().status === 'inactive')) throw new Error('Há aluno inativo na lista. Revise os integrantes antes de divulgar.');
    const allIds = idsOf([...studentIds, ...previousIds]);
    const references = allIds.map((id) => store.doc(db, 'finalSprintSelectionScores', selections.find((item) => String(item.studentId) === id)?.id || selectionId(seasonId, id)));
    const existing = await Promise.all(references.map((ref) => transaction.get(ref)));
    const publishedAt = new Date().toISOString();
    allIds.forEach((id, index) => {
      const previous = existing[index].data() || {};
      const selected = studentIds.includes(id);
      const student = students[studentIds.indexOf(id)]?.data();
      transaction.set(references[index], {
        seasonId, studentId: id, studentName: student?.name || previous.studentName || 'Aluno',
        selectedForTournament: selected,
        selectedAt: selected ? (previous.selectedForTournament === true ? previous.selectedAt || previous.createdAt || publishedAt : publishedAt) : null,
        publishedAt, publishedBy: actor, updatedAt: publishedAt, createdAt: previous.createdAt || publishedAt,
      }, { merge: true });
    });
    const next = { seasonId, studentIds, publishedStudentIds: studentIds, publishedAt, publishedBy: actor, revision: expectedRevision + 1 };
    transaction.set(reference, next, { merge: true });
    return { ...draft, ...next };
  });
}
