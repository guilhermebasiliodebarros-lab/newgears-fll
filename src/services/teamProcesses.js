import { collection, collectionGroup, doc, getDocs, runTransaction, writeBatch } from 'firebase/firestore';
import { attendanceContribution, isActiveStudent, sessionEntries, SEASON_COLLECTIONS, defaultPlanning, validDate, ATTENDANCE_LABELS } from '../utils/teamProcesses.js';
import { DEFAULT_PROJECT_SUMMARY, PROJECT_MAIN_DOC_ID } from '../utils/projectSummary.js';
const firestoreAdapter = { collection, collectionGroup, doc, getDocs, runTransaction, writeBatch };

export async function assertActiveSeason(transaction, db, seasonId, store = firestoreAdapter) {
  const { doc } = store;
  const settings = await transaction.get(doc(db, 'settings', 'workspace_season'));
  const data = settings.data() || {};
  if (data.transitionLock) throw new Error('A temporada está sendo encerrada. Aguarde a conclusão.');
  if ((data.activeSeasonId || 'legacy') !== seasonId) throw new Error('A temporada mudou. Atualize a página antes de continuar.');
  return data;
}

export async function applyRotation({ db, seasonId, week, actor, store = firestoreAdapter }) {
  const { doc, runTransaction } = store;
  const ref = doc(db, 'rotationApplications', `${seasonId}__${week.startDate}`);
  return runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const previous = await transaction.get(ref);
    if (previous.exists() && previous.data().status === 'applied') throw new Error('Esta semana já foi aplicada. Desfaça a aplicação antes de alterar a distribuição.');
    const assignments = Object.entries(week.assignments).flatMap(([station, members]) => members.map((student) => ({ studentId: student.id, station })));
    if (!assignments.length || new Set(assignments.map((item) => item.studentId)).size !== assignments.length) throw new Error('Confira a escala: há integrantes repetidos ou nenhuma pessoa escalada.');
    const snapshots = await Promise.all(assignments.map((item) => transaction.get(doc(db, 'students', item.studentId))));
    const entries = assignments.map((item, index) => {
      const student = snapshots[index].data();
      if (!student || !isActiveStudent(student)) throw new Error('Um integrante da escala está inativo. Atualize o planejamento.');
      return { ...item, name: student.name, previousStation: student.station || null, previousRotationId: student.rotationApplicationId || null };
    });
    entries.forEach((item) => transaction.update(doc(db, 'students', item.studentId), { station: item.station, rotationApplicationId: ref.id }));
    transaction.set(ref, { seasonId, weekName: week.weekName, startDate: week.startDate, entries, status: 'applied', appliedAt: new Date().toISOString(), appliedBy: actor });
  });
}

export async function undoRotation({ db, applicationId, seasonId, actor, store = firestoreAdapter }) {
  const { doc, runTransaction } = store;
  return runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const ref = doc(db, 'rotationApplications', applicationId);
    const snapshot = await transaction.get(ref);
    const application = snapshot.data();
    if (!application || application.status !== 'applied' || application.seasonId !== seasonId) throw new Error('Esta aplicação não está mais disponível para desfazer.');
    const students = await Promise.all(application.entries.map((entry) => transaction.get(doc(db, 'students', entry.studentId))));
    if (students.some((student, index) => !student.exists() || !isActiveStudent(student.data()) || student.data().station !== application.entries[index].station || student.data().rotationApplicationId !== applicationId)) throw new Error('A equipe mudou depois da aplicação. Confira as estações antes de desfazer.');
    application.entries.forEach((entry) => transaction.update(doc(db, 'students', entry.studentId), { station: entry.previousStation, rotationApplicationId: entry.previousRotationId || null }));
    transaction.update(ref, { status: 'undone', undoneAt: new Date().toISOString(), undoneBy: actor });
  });
}

export async function saveAttendance({ db, seasonId, date, entries, existingId, actor, store = firestoreAdapter }) {
  const { doc, runTransaction } = store;
  if (!validDate(date)) throw new Error('Informe uma data válida para a chamada.');
  if (Object.values(entries).some((entry) => !Object.hasOwn(ATTENDANCE_LABELS, entry.status) || typeof entry.note !== 'string' || entry.note.length > 300 || (entry.status === 'excused' && !entry.note.trim()))) throw new Error('Confira as presenças e os motivos das faltas justificadas.');
  const ref = doc(db, 'attendanceSessions', existingId || `${seasonId}__${date}`);
  return runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const snapshot = await transaction.get(ref);
    const previous = snapshot.data();
    if (previous?.seasonId && previous.seasonId !== seasonId) throw new Error('Esta chamada pertence a outra temporada.');
    if (previous?.date && previous.date !== date) throw new Error('A data da chamada mudou. Abra novamente a data desejada.');
    const previousEntries = sessionEntries(previous);
    const nextEntries = { ...previousEntries, ...entries };
    const ids = Object.keys(nextEntries);
    const students = await Promise.all(ids.map((id) => transaction.get(doc(db, 'students', id))));
    ids.forEach((id, index) => {
      const student = students[index].data();
      if (!student) throw new Error('Um integrante da chamada não foi encontrado. Atualize a página.');
      const before = attendanceContribution(previousEntries[id]);
      const after = attendanceContribution(nextEntries[id]);
      const total = Math.max(0, (Number(student.totalClasses) || 0) + after.total - before.total);
      transaction.update(doc(db, 'students', id), {
        totalClasses: total,
        attendedClasses: Math.min(total, Math.max(0, (Number(student.attendedClasses) || 0) + after.attended - before.attended)),
        lateClasses: Math.max(0, (Number(student.lateClasses) || 0) + after.late - before.late),
        excusedClasses: Math.max(0, (Number(student.excusedClasses) || 0) + after.excused - before.excused),
      });
    });
    transaction.set(ref, { date, seasonId, entries: nextEntries, presentIds: ids.filter((id) => ['present', 'late'].includes(nextEntries[id].status)), absentIds: ids.filter((id) => nextEntries[id].status === 'absent'), studentCount: ids.length, createdAt: previous?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), updatedBy: actor });
  });
}

// The persisted lock and deterministic carry-over IDs allow a failed transition to resume.
export async function transitionSeason({ db, seasonId, options, actor, weeklyStats, planningConfig, reportCount, store = firestoreAdapter }) {
  const { collection, collectionGroup, doc, getDocs, runTransaction, writeBatch } = store;
  const settingsRef = doc(db, 'settings', 'workspace_season');
  const proposedId = doc(collection(db, 'teamSeasons')).id;
  const lock = await runTransaction(db, async (transaction) => {
    const settings = await transaction.get(settingsRef); const current = settings.data() || {};
    if ((current.activeSeasonId || 'legacy') !== seasonId) throw new Error('A temporada já mudou. Atualize a página.');
    if (current.transitionLock) return current.transitionLock;
    const value = { nextSeasonId: proposedId, seasonId, options, actor, startedAt: new Date().toISOString() };
    transaction.set(settingsRef, { transitionLock: value }, { merge: true });
    return value;
  });
  const selected = new Set(lock.options.studentIds);
  const collections = SEASON_COLLECTIONS;
  const snapshots = await Promise.all(collections.map((name) => getDocs(name === 'logbook' ? collectionGroup(db, name) : collection(db, name))));
  const roster = await getDocs(collection(db, 'students'));
  const chosen = roster.docs.filter((item) => selected.has(item.id)).map((item) => ({ ...item.data(), id: item.id, status: 'active' }));
  if (chosen.length !== selected.size || !chosen.length) throw new Error('Confira os integrantes da próxima temporada antes de continuar.');
  const belongs = (item) => !item.data().seasonId || item.data().seasonId === seasonId;
  const records = snapshots.flatMap((snapshot) => snapshot.docs.filter(belongs));
  const counts = Object.fromEntries(collections.map((name, index) => [name, snapshots[index].docs.filter(belongs).length]));
  counts.weeklyReports = reportCount;
  for (let offset = 0; offset < records.length; offset += 400) {
    const batch = writeBatch(db);
    records.slice(offset, offset + 400).forEach((item) => batch.update(item.ref, { seasonId }));
    await batch.commit();
  }
  const copies = records.filter((item) => (item.ref.parent.id === 'tasks' && lock.options.carryTasks && item.data().status !== 'done') || (item.ref.parent.id === 'events' && lock.options.carryEvents && !['concluido', 'concluida', 'concluído', 'done', 'cancelado', 'complete'].includes(item.data().status)));
  const copiedTasks = new Map(copies.filter((item) => item.ref.parent.id === 'tasks').map((item) => [item.id, `${lock.nextSeasonId}__${item.id}`]));
  for (let offset = 0; offset < copies.length; offset += 400) {
    const batch = writeBatch(db);
    copies.slice(offset, offset + 400).forEach((item) => {
      const data = item.data();
      if (item.ref.parent.id === 'tasks') {
        if (Array.isArray(data.participants)) {
          data.participants = data.participants.filter((person) => selected.has(person.id));
          data.author = data.participants.map((person) => person.name).join(', ') || null;
          data.assigneeId = data.participants[0]?.id || '';
        }
        if (data.block?.dependencyId) {
          const oldId = data.block.dependencyId; const newId = copiedTasks.get(oldId) || '';
          data.block = { ...data.block, dependencyId: newId, previousDependencyId: oldId, category: newId ? data.block.category : 'other', reason: newId ? data.block.reason : `${data.block.reason} — Confira a dependência da temporada anterior antes de liberar.` };
        }
        if (data.block?.helpFromId && !selected.has(data.block.helpFromId)) data.block = { ...data.block, helpFromId: '' };
      }
      batch.set(doc(db, item.ref.parent.id, `${lock.nextSeasonId}__${item.id}`), { ...data, seasonId: lock.nextSeasonId, carriedFromSeasonId: seasonId, carriedFromId: item.id, carriedAt: lock.startedAt });
    });
    await batch.commit();
  }
  const now = new Date().toISOString();
  const captainIds = (planningConfig.captainIds || []).filter((id) => selected.has(id));
  const traineeIds = (planningConfig.traineeIds || []).filter((id) => selected.has(id));
  const nextPlanning = { ...defaultPlanning(chosen), startDate: lock.options.startDate, captainIds, traineeIds, participantIds: chosen.map((student) => student.id).filter((id) => !captainIds.includes(id) && !traineeIds.includes(id)), trainingDays: planningConfig.trainingDays, reportDueDay: planningConfig.reportDueDay };
  await runTransaction(db, async (transaction) => {
    const settings = await transaction.get(settingsRef);
    if (settings.data()?.transitionLock?.nextSeasonId !== lock.nextSeasonId || (settings.data()?.activeSeasonId || 'legacy') !== seasonId) throw new Error('A temporada mudou durante o encerramento. Atualize a página.');
    const currentRoster = await Promise.all(roster.docs.map((item) => transaction.get(item.ref)));
    const projectRef = doc(db, 'project', PROJECT_MAIN_DOC_ID);
    const project = await transaction.get(projectRef);
    const workspaceSettings = await Promise.all(['weekly_missions', 'rubric_innovation', 'rubric_robot_design'].map((name) => transaction.get(doc(db, 'settings', name))));
    const snapshot = currentRoster.filter((item) => item.exists()).map((item) => {
      const student = item.data();
      return { id: item.id, name: student.name || 'Aluno', turma: student.turma || '', specialty: student.specialty || '', station: student.station || '', status: student.status || 'active', xp: Number(student.xp) || 0, badges: student.badges || [], totalClasses: student.totalClasses || 0, attendedClasses: student.attendedClasses || 0 };
    });
    transaction.set(doc(db, 'teamSeasons', seasonId), { name: lock.options.currentName, status: 'archived', closedAt: now, recordCounts: counts, teamSnapshot: snapshot, weeklyStatsSnapshot: weeklyStats, planningConfig, nextSeasonId: lock.nextSeasonId }, { merge: true });
    transaction.set(doc(db, 'teamSeasons', lock.nextSeasonId), { name: lock.options.nextName, status: 'active', startedAt: now, previousSeasonId: seasonId, createdBy: actor, recordCounts: {} });
    transaction.set(settingsRef, { activeSeason: 'rotation', activeSeasonId: lock.nextSeasonId, activeSeasonName: lock.options.nextName, startedAt: now, planningConfig: nextPlanning, transitionLock: null }, { merge: true });
    transaction.set(doc(db, 'settings', 'team_stats'), { successfulWeekIds: [], successfulWeeks: 0 });
    if (project.exists()) transaction.set(doc(db, 'teamSeasons', seasonId, 'workspace', 'project'), { seasonId, title: 'Projeto de inovação', data: project.data() });
    workspaceSettings.filter((item) => item.exists()).forEach((item) => transaction.set(doc(db, 'teamSeasons', seasonId, 'workspace', item.id), { seasonId, title: ({ weekly_missions: 'Metas da semana', rubric_innovation: 'Rubrica de inovação', rubric_robot_design: 'Rubrica de design do robô' })[item.id], data: item.data() }));
    if (lock.options.carryProject === false) transaction.set(projectRef, { ...DEFAULT_PROJECT_SUMMARY, updatedAt: now });
    currentRoster.filter((item) => item.exists()).forEach((item) => transaction.set(doc(db, 'teamSeasons', seasonId, 'students', item.id), { name: item.data().name || 'Aluno', submission: item.data().submission || null, seasonId }));
    currentRoster.filter((item) => item.exists()).forEach((item) => transaction.update(item.ref, selected.has(item.id) ? { status: 'active', archivedAt: null, archivedBy: null, submission: null } : { status: 'inactive', archivedAt: item.data().archivedAt || now, archivedBy: actor }));
  });
  return { id: lock.nextSeasonId, name: lock.options.nextName };
}
