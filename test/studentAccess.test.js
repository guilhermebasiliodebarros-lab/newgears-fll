import assert from 'node:assert/strict';
import { setStudentAccess } from '../src/services/studentAccess.js';
import { memoryStore } from './teamProcesses.test.js';

export async function runStudentAccessTests() {
  const original = {
    name: 'Aluno', username: 'aluno', password: 'existing-password', email: 'aluno@example.com',
    xp: 510, grades: { math: 9 }, attendance: { present: 12 }, badges: ['research'],
    submission: { status: 'approved', text: 'Entrega anterior' }, station: 'Engenharia',
  };
  const history = {
    'students/a/logbook/entry': { text: 'Pesquisa', createdAt: '2026-10-01' },
    'weeklyReports/report': { studentId: 'a', userId: 'auth-a', filePath: 'reports/original.pdf' },
    'weeklyReportMembers/auth-a': { studentId: 'a', role: 'student', active: true },
    'weeklyEvaluations/evaluation': { studentId: 'a', score: 4 },
    'studentGearProfiles/a': { coins: 200 },
    'tasks/task': { participants: [{ id: 'a', name: 'Aluno' }], status: 'done' },
  };
  const memory = memoryStore({ 'students/a': original, ...history });
  const options = { db: {}, user: { type: 'admin', uid: 'coach' }, actor: 'Técnico', studentId: 'a', seasonId: 'current', store: memory.store };

  await assert.rejects(setStudentAccess({ ...options, user: { type: 'student' }, active: false }), /Apenas o técnico/);
  await assert.rejects(setStudentAccess({ ...options, studentId: 'missing', active: false }), /não foi encontrado/);
  await assert.rejects(setStudentAccess({ ...options, studentId: '../a', active: false }), /Confira/);
  await assert.rejects(setStudentAccess({ ...options, active: 'false' }), /Confira/);
  assert.deepEqual(memory.records.get('students/a'), original, 'invalid requests leave the account intact');

  await setStudentAccess({ ...options, active: false });
  const inactive = memory.records.get('students/a');
  assert.equal(inactive.status, 'inactive');
  assert.equal(inactive.archivedBy, 'Técnico');
  assert.ok(Number.isFinite(Date.parse(inactive.archivedAt)));
  for (const [key, value] of Object.entries(original)) assert.deepEqual(inactive[key], value, `${key} is preserved`);
  for (const [path, data] of Object.entries(history)) assert.deepEqual(memory.records.get(path), data, `${path} is preserved`);
  const logs = () => [...memory.records].filter(([path]) => path.startsWith('activityLogs/')).map(([, data]) => data);
  assert.equal(logs().length, 1);
  assert.equal(logs()[0].entityId, 'a');
  assert.equal(logs()[0].actorId, 'coach');
  assert.equal(logs()[0].seasonId, 'current');
  assert.match(logs()[0].action, /inativou/);
  await setStudentAccess({ ...options, active: false });
  assert.equal(logs().length, 1, 'retrying an inactivation must not toggle access or duplicate its history');
  assert.equal(memory.records.get('students/a').archivedAt, inactive.archivedAt);

  // A failed audit write must also discard the access change.
  const deniedStore = { ...memory.store, runTransaction: (db, callback) => memory.store.runTransaction(db, (transaction) => callback({ ...transaction, set: () => { throw Error('Permission denied'); } })) };
  await assert.rejects(setStudentAccess({ ...options, store: deniedStore, active: true }), /Permission denied/);
  assert.equal(memory.records.get('students/a').status, 'inactive');
  await setStudentAccess({ ...options, active: true });
  const restored = memory.records.get('students/a');
  assert.deepEqual(restored, { ...original, status: 'active', archivedAt: null, archivedBy: null });
  for (const [path, data] of Object.entries(history)) assert.deepEqual(memory.records.get(path), data);
  assert.equal(logs().length, 2);
  assert.match(logs()[1].action, /reativou/);
  await setStudentAccess({ ...options, active: true });
  assert.equal(logs().length, 2);
}
