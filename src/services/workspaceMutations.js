import { doc, runTransaction } from 'firebase/firestore';
import { assertActiveSeason } from './teamProcesses.js';
import { recordDate } from '../utils/workspaceRecords.js';

const adapter = { doc, runTransaction };
const requireMember = (user) => { if (!['admin', 'student'].includes(user?.type)) throw Error('Entre na sua conta antes de alterar os dados.'); };

export async function clearTrainingHistory({ db, user, seasonId = 'legacy', ids, store = adapter }) {
  if (user?.type !== 'admin') throw Error('Apenas o técnico pode limpar o histórico.');
  const unique = [...new Set(ids)];
  if (unique.length > 450) throw Error('Há muitos registros. Exporte o histórico e selecione uma saída por vez.');
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId || 'legacy', store);
    const refs = unique.map((id) => store.doc(db, 'score_history', id));
    const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
    snapshots.forEach((snapshot, index) => {
      if (snapshot.exists() && (!snapshot.data().seasonId || snapshot.data().seasonId === (seasonId || 'legacy'))) transaction.delete(refs[index]);
    });
  });
}

export async function saveEvaluation({ db, user, id, evaluation, expected, store = adapter }) {
  if (user?.type !== 'admin') throw Error('Apenas o técnico pode avaliar.');
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, evaluation.seasonId, store);
    const ref = store.doc(db, 'finalSprintEvaluations', id);
    const snapshot = await transaction.get(ref);
    const previous = snapshot.data();
    const revision = (record) => recordDate(record?.updatedAt)?.toISOString() || record?.updatedAt || null;
    const counter = (record) => Number.isSafeInteger(record?.revision) ? record.revision : 0;
    if (snapshot.exists() !== Boolean(expected) || revision(previous) !== revision(expected) || counter(previous) !== counter(expected)) throw Error('Esta avaliação mudou em outro acesso. Confira os dados atuais antes de salvar. Seu rascunho foi mantido.');
    if (previous && (previous.studentId !== evaluation.studentId || previous.type !== evaluation.type || (previous.seasonId || 'legacy') !== evaluation.seasonId)) throw Error('A avaliação não corresponde a este integrante e temporada.');
    // Replace only the evaluation fields, including the complete ratings map.
    const next = { ...evaluation, revision: counter(previous) + 1 };
    transaction.set(ref, next, { mergeFields: Object.keys(next) });
    return next;
  });
}

export async function deleteRobotRound({ db, user, seasonId, id, store = adapter }) {
  seasonId ||= 'legacy';
  requireMember(user);
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const ref = store.doc(db, 'rounds', id); const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) return;
    if (snapshot.data().seasonId && snapshot.data().seasonId !== seasonId) throw Error('Esta saída pertence a outra temporada.');
    // Training results and trajectories remain as historical evidence.
    transaction.delete(ref);
  });
}

export async function applyOfficialCode({ db, user, seasonId, id, knownIds, store = adapter }) {
  seasonId ||= 'legacy';
  if (user?.type !== 'admin') throw Error('Apenas o técnico pode definir o programa oficial.');
  return store.runTransaction(db, async (transaction) => {
    const workspace = await assertActiveSeason(transaction, db, seasonId, store);
    const ids = [...new Set([...knownIds, id, workspace.officialCodeId].filter(Boolean))];
    if (ids.length > 450) throw Error('Há muitos programas para atualizar de uma vez. Revise o arquivo de códigos com o técnico.');
    const refs = ids.map((key) => store.doc(db, 'codeSnippets', key));
    const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
    const chosen = snapshots.find((snapshot) => snapshot.id === id);
    if (!chosen?.exists() || (chosen.data().seasonId && chosen.data().seasonId !== seasonId)) throw Error('O programa foi removido ou pertence a outra temporada.');
    snapshots.forEach((snapshot, index) => {
      if (snapshot.exists() && (!snapshot.data().seasonId || snapshot.data().seasonId === seasonId) && snapshot.data().applied !== (snapshot.id === id)) transaction.update(refs[index], { applied: snapshot.id === id });
    });
    // The season document serializes selections made with different cached lists.
    transaction.update(store.doc(db, 'settings', 'workspace_season'), { officialCodeId: id });
  });
}
