import assert from 'node:assert/strict';
import { memoryStore } from './teamProcesses.test.js';
import { setStudentAccess } from '../src/services/studentAccess.js';
import { belongsToStudent, openStudentTasks, participantSignature, taskMatchesAttention, completedEvidenceTasks, parseLinkedTaskIds, taskEvidenceText } from '../src/utils/workflowImprovements.js';

export async function runWorkflowImprovementsTests() {
  const alice = { id: 'a', name: 'Alice' };
  const bob = { id: 'b', name: 'Bob' };
  const task = { id: 't', text: 'Testar sensores', seasonId: 'season', status: 'doing', createdBy: 'Autora original', participants: [alice, bob], author: 'Alice, Bob', dueDate: '2026-11-04' };
  assert.ok(belongsToStudent(task, alice));
  assert.equal(belongsToStudent(task, { id: 'different', name: 'Alice' }), false, 'IDs take precedence over equal names');
  assert.equal(openStudentTasks([task, { ...task, status: 'done' }], alice).length, 1);
  assert.equal(taskMatchesAttention(task, 'urgent', '2026-11-04'), true);
  assert.equal(taskMatchesAttention(task, 'urgent', '2026-11-03'), false);
  assert.equal(taskMatchesAttention({ ...task, status: 'done' }, 'urgent', '2026-11-05'), false);
  assert.equal(taskMatchesAttention({ ...task, block: { reason: 'Material' } }, 'blocked'), true);
  assert.equal(taskMatchesAttention({ ...task, block: { resolvedAt: '2026-11-04' } }, 'blocked'), false);
  assert.equal(taskMatchesAttention({ ...task, status: 'review' }, 'review'), true);
  assert.equal(taskMatchesAttention(task, 'mine', '', bob), true);
  assert.deepEqual(completedEvidenceTasks([task, { ...task, status: 'done' }], alice).map((item) => item.id), ['t']);
  assert.equal(completedEvidenceTasks([{ ...task, status: 'done' }], { id: 'c' }).length, 0);
  assert.match(taskEvidenceText({ ...task, evidence: '10 testes corretos', evidenceUrl: 'javascript:alert(1)' }), /10 testes corretos/);
  assert.doesNotMatch(taskEvidenceText({ ...task, evidenceUrl: 'javascript:alert(1)' }), /javascript/);
  assert.deepEqual(parseLinkedTaskIds('["t","t"]'), ['t']);
  assert.throws(() => parseLinkedTaskIds('["../x"]'));
  assert.throws(() => parseLinkedTaskIds('{"id":"t"}'));
  assert.throws(() => parseLinkedTaskIds(Array.from({ length: 31 }, (_, index) => `t${index}`)));

  const initial = { 'students/a': alice, 'students/b': bob, 'students/c': { name: 'Carol' }, 'tasks/t': task, 'settings/workspace_season': { activeSeasonId: 'season', planningConfig: { participantIds: ['a', 'b'], captainIds: [], traineeIds: ['c'], startDate: '2026-10-01' } } };
  const assignment = { taskId: 't', replacementId: 'c', expectedStatus: 'doing', expectedParticipants: participantSignature(task) };
  const options = { db: {}, user: { type: 'admin', name: 'Técnico' }, studentId: 'a', active: false, seasonId: 'season', handoff: { removeFromPlanning: true, tasks: [assignment] } };
  const memory = memoryStore(initial);
  await setStudentAccess({ ...options, store: memory.store });
  assert.equal(memory.records.get('students/a').status, 'inactive');
  assert.deepEqual(memory.records.get('tasks/t').participants, [bob, { id: 'c', name: 'Carol' }]);
  assert.equal(memory.records.get('tasks/t').createdBy, 'Autora original');
  assert.deepEqual(memory.records.get('settings/workspace_season').planningConfig.participantIds, ['b']);
  assert.equal(memory.records.get('settings/workspace_season').planningConfig.startDate, '2026-10-01');
  assert.equal(memory.records.get('tasks/t').peopleHistory[0].action, 'student-inactivated');

  for (const mutation of [
    (records) => records.set('tasks/t', { ...task, status: 'review' }),
    (records) => records.set('tasks/t', { ...task, participants: [alice] }),
    (records) => records.set('students/c', { name: 'Carol', status: 'inactive' }),
    (records) => records.set('settings/workspace_season', { activeSeasonId: 'another-season' }),
  ]) {
    const failed = memoryStore(initial); mutation(failed.records);
    const before = structuredClone([...failed.records]);
    await assert.rejects(setStudentAccess({ ...options, store: failed.store }));
    assert.deepEqual([...failed.records], before, 'a stale handoff must leave access, tasks and planning intact');
  }
  const denied = memoryStore(initial);
  const deniedStore = { ...denied.store, runTransaction: (db, action) => denied.store.runTransaction(db, (transaction) => action({ ...transaction, set: () => { throw Error('Audit write denied'); } })) };
  await assert.rejects(setStudentAccess({ ...options, store: deniedStore }), /Audit write denied/);
  assert.deepEqual([...denied.records], Object.entries(initial));
  const remove = memoryStore(initial);
  await setStudentAccess({ ...options, handoff: { tasks: [{ ...assignment, replacementId: '' }] }, store: remove.store });
  assert.deepEqual(remove.records.get('tasks/t').participants, [bob]);
  assert.deepEqual(remove.records.get('settings/workspace_season'), initial['settings/workspace_season']);
}
