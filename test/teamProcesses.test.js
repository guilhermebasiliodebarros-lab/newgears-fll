import assert from 'node:assert/strict';
import { buildRotationSchedule, defaultPlanning, validatePlanning, validDate, sessionEntries } from '../src/utils/teamProcesses.js';
import { buildWeeklyDeliveries } from '../src/utils/weeklyReports.js';
import { applyRotation, undoRotation, saveAttendance, transitionSeason } from '../src/services/teamProcesses.js';
import { changeTaskStage, updateTaskPeople } from '../src/services/taskWorkflow.js';

// In-memory transaction adapter: discard all writes on failure and reject reads after writes.
export function memoryStore(initial) {
  const records = new Map(Object.entries(structuredClone(initial)));
  let sequence = 0; let failBatch = false; let failArchiveCommit = false;
  const ref = (path) => ({ path, id: path.split('/').at(-1), parent: { id: path.split('/').at(-2) } });
  const snapshot = (reference) => ({ id: reference.id, ref: reference, exists: () => records.has(reference.path), data: () => structuredClone(records.get(reference.path)) });
  const mutation = (writes) => ({
    set: (reference, data, options) => writes.push({ reference, data, merge: options?.merge }),
    update: (reference, data) => writes.push({ reference, data, merge: true, requireExisting: true }),
  });
  const commit = (writes) => {
    if (writes.some((write) => write.requireExisting && !records.has(write.reference.path))) throw new Error('Missing document');
    writes.forEach(({ reference, data, merge }) => {
      const previous = records.get(reference.path) || {};
      const resolved = Object.fromEntries(Object.entries(data).map(([key, value]) => [key,
        value?.testTransform === 'arrayRemove' ? (previous[key] || []).filter((item) => !value.values.includes(item))
          : value?.testTransform === 'increment' ? (previous[key] || 0) + value.value : value,
      ]));
      records.set(reference.path, structuredClone(merge ? { ...previous, ...resolved } : resolved));
    });
  };
  const store = {
    collection: (_db, ...parts) => ref(parts.join('/')),
    collectionGroup: (_db, name) => ({ group: name }),
    doc: (first, ...parts) => ref(first?.path ? `${first.path}/${parts.join('/') || `auto-${++sequence}`}` : parts.join('/')),
    arrayRemove: (...values) => ({ testTransform: 'arrayRemove', values }),
    increment: (value) => ({ testTransform: 'increment', value }),
    updateDoc: async (reference, data) => commit([{ reference, data, merge: true, requireExisting: true }]),
    getDocs: async (source) => ({ docs: [...records.keys()].filter((path) => source.group ? path.split('/').at(-2) === source.group : path.split('/').slice(0, -1).join('/') === source.path).map((path) => snapshot(ref(path))) }),
    runTransaction: async (_db, action) => {
      const writes = []; const transaction = { ...mutation(writes), get: async (reference) => { assert.equal(writes.length, 0, 'All reads must precede transaction writes'); return snapshot(reference); } };
      const result = await action(transaction);
      if (failArchiveCommit && writes.some((write) => write.reference.path.startsWith('teamSeasons/'))) { failArchiveCommit = false; throw new Error('Archive commit interrupted'); }
      commit(writes); return result;
    },
    writeBatch: () => { const writes = []; return { ...mutation(writes), commit: async () => { if (failBatch) { failBatch = false; throw new Error('Connection interrupted'); } commit(writes); } }; },
  };
  return { store, records, failNextBatch: () => { failBatch = true; }, failNextArchiveCommit: () => { failArchiveCommit = true; } };
}

export async function runTeamProcessesTests() {
  const students = Array.from({ length: 10 }, (_, index) => ({ id: `s${index}`, name: `Student ${index}`, status: index === 9 ? 'inactive' : 'active' }));
  const config = { ...defaultPlanning(students), startDate: '2027-01-04', totalWeeks: 3, pauseWeeks: ['2027-01-11'], captainIds: ['s0'], traineeIds: ['s7', 's8'], participantIds: ['s1', 's2', 's3', 's4', 's5', 's6'] };
  const schedule = buildRotationSchedule(students, validatePlanning(config, students));
  assert.deepEqual(schedule.map((week) => week.startDate), ['2027-01-04', '2027-01-18', '2027-01-25']);
  for (const week of schedule) { const ids = Object.values(week.assignments).flat().map((student) => student.id); assert.equal(ids.length, 9); assert.equal(new Set(ids).size, 9); assert.ok(week.assignments['Gestão'].some((student) => student.id === 's0')); }
  assert.throws(() => validatePlanning({ ...config, participantIds: ['s0'] }, students));
  assert.equal(validDate('2027-02-30'), false); assert.equal(validDate('2027-99-99'), false);
  assert.equal(sessionEntries({ presentIds: ['a'], absentIds: ['b'] }).a.status, 'present');

  const initial = { 'settings/workspace_season': { activeSeasonId: 'season' }, 'students/a': { name: 'A', status: 'active', station: 'Gestão', xp: 40, totalClasses: 10, attendedClasses: 8, submission: { text: 'Keep this work' } }, 'students/b': { name: 'B', status: 'active', station: 'Inovação', totalClasses: 10, attendedClasses: 10 } };
  const memory = memoryStore(initial); const context = { db: {}, store: memory.store, seasonId: 'season', actor: 'Coach' };
  const week = { weekName: 'Semana 1', startDate: '2027-01-04', assignments: { Engenharia: [{ id: 'a' }], 'Gestão': [{ id: 'b' }] } };
  await applyRotation({ ...context, week });
  assert.deepEqual(memory.records.get('students/a').submission, initial['students/a'].submission);
  await assert.rejects(applyRotation({ ...context, week }), /já foi aplicada/);
  await undoRotation({ ...context, applicationId: 'season__2027-01-04' });
  assert.equal(memory.records.get('students/a').station, 'Gestão');
  await applyRotation({ ...context, week });
  await applyRotation({ ...context, week: { ...week, startDate: '2027-01-11' } });
  await assert.rejects(undoRotation({ ...context, applicationId: 'season__2027-01-04' }), /mudou depois/);

  const date = '2027-01-04';
  await saveAttendance({ ...context, date, entries: { a: { status: 'present', note: '' }, b: { status: 'late', note: 'Bus' } } });
  await saveAttendance({ ...context, date, entries: { a: { status: 'present', note: '' }, b: { status: 'late', note: 'Bus' } } });
  assert.equal(memory.records.get('students/a').totalClasses, 11);
  assert.equal(memory.records.get('students/b').lateClasses, 1);
  await saveAttendance({ ...context, date, entries: { a: { status: 'excused', note: 'Medical appointment' } } });
  assert.equal(memory.records.get('students/a').totalClasses, 10); assert.equal(memory.records.get('students/a').attendedClasses, 8);
  const beforeFailure = structuredClone(memory.records.get('students/a'));
  await assert.rejects(saveAttendance({ ...context, date, entries: { a: { status: 'absent', note: '' }, missing: { status: 'present', note: '' } } }));
  assert.deepEqual(memory.records.get('students/a'), beforeFailure);
  await assert.rejects(saveAttendance({ ...context, date, entries: { a: { status: 'excused', note: '' } } }), /motivos/);
  memory.records.set('attendanceSessions/2027-01-05', { date: '2027-01-05', presentIds: ['a'], absentIds: ['b'] });
  const previousTotal = memory.records.get('students/a').totalClasses;
  await saveAttendance({ ...context, date: '2027-01-05', existingId: '2027-01-05', entries: { a: { status: 'present', note: '' }, b: { status: 'absent', note: '' } } });
  assert.equal(memory.records.get('students/a').totalClasses, previousTotal, 'Correcting a legacy session must not add a class');

  memory.records.set('tasks/t', { status: 'doing', author: 'A', createdBy: 'Coach', participants: [{ id: 'a', name: 'A' }], seasonId: 'season', createdAt: new Date().toISOString() });
  await updateTaskPeople({ ...context, id: 't', mode: 'join', person: { id: 'b', name: 'B' }, students: [] });
  assert.equal(memory.records.get('tasks/t').createdBy, 'Coach'); assert.equal(memory.records.get('tasks/t').participants.length, 2);
  await assert.rejects(changeTaskStage({ ...context, id: 't', status: 'review', expectedStatus: 'doing' }), /Descreva/);
  await changeTaskStage({ ...context, id: 't', status: 'review', expectedStatus: 'doing', details: { evidence: 'Tested the new sensor' } });
  await assert.rejects(changeTaskStage({ ...context, id: 't', status: 'done', expectedStatus: 'review' }), /técnico/);
  await assert.rejects(changeTaskStage({ ...context, id: 't', isAdmin: true, status: 'doing', expectedStatus: 'review' }), /motivo/);
  await changeTaskStage({ ...context, id: 't', isAdmin: true, status: 'doing', expectedStatus: 'review', details: { feedback: 'Retest under bright light' } });
  assert.equal(memory.records.get('tasks/t').feedback, 'Retest under bright light');
  await assert.rejects(changeTaskStage({ ...context, id: 't', isAdmin: true, status: 'done', expectedStatus: 'review' }), /mudou/);

  const delivery = buildWeeklyDeliveries({ students: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'new', joinedAt: '2027-02-01' }], reports: [{ studentId: 'a', weekStart: '2027-01-04' }], weekStart: '2027-01-04', dueDay: 5, today: '2027-01-09', exemptions: { b: { reason: 'Away' } } });
  assert.deepEqual(delivery.map((row) => row.status), ['Entregue', 'Dispensado', 'Atrasado']);
  assert.equal(delivery[0].dueDate, '2027-01-08');

  const options = { currentName: 'Old season', nextName: 'Next season', studentIds: ['a'], startDate: '2027-01-04', carryTasks: true, carryEvents: false };
  memory.records.set('tasks/dependency', { status: 'doing', seasonId: 'season' });
  memory.records.get('tasks/t').block = { dependencyId: 'dependency', category: 'dependency', reason: 'Waiting for dependency', helpFromId: 'b' };
  memory.failNextBatch();
  await assert.rejects(transitionSeason({ ...context, options, weeklyStats: {}, planningConfig: config, reportCount: 0 }), /Connection interrupted/);
  assert.equal(memory.records.get('settings/workspace_season').activeSeasonId, 'season');
  memory.failNextArchiveCommit();
  await assert.rejects(transitionSeason({ ...context, options, weeklyStats: {}, planningConfig: config, reportCount: 0 }), /Archive commit interrupted/);
  const lockedId = memory.records.get('settings/workspace_season').transitionLock.nextSeasonId;
  assert.ok(memory.records.has(`tasks/${lockedId}__t`), 'The carry-over exists before the final commit failure');
  const next = await transitionSeason({ ...context, options, weeklyStats: {}, planningConfig: config, reportCount: 0 });
  assert.equal(next.id, lockedId); assert.equal([...memory.records.keys()].filter((path) => path.startsWith('tasks/') && path.endsWith('__t')).length, 1);
  assert.equal(memory.records.get('settings/workspace_season').activeSeasonId, next.id);
  assert.equal(memory.records.get('settings/workspace_season').transitionLock, null);
  assert.equal(memory.records.get('students/b').status, 'inactive');
  assert.equal(memory.records.get('students/a').xp, 40);
  assert.equal(memory.records.get('students/a').submission, null);
  assert.equal(memory.records.get('teamSeasons/season/students/a').submission.text, 'Keep this work');
  assert.equal(memory.records.get(`tasks/${next.id}__t`).seasonId, next.id);
  assert.equal(memory.records.get(`tasks/${next.id}__t`).block.dependencyId, `${next.id}__dependency`);
  assert.equal(memory.records.get(`tasks/${next.id}__t`).participants.length, 1);
  assert.equal(memory.records.get(`tasks/${next.id}__t`).block.helpFromId, '');
  assert.equal(memory.records.get('tasks/t').seasonId, 'season');
  await assert.rejects(applyRotation({ ...context, week }), /temporada mudou/);
}
