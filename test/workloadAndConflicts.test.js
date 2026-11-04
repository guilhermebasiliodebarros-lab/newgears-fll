import assert from 'node:assert/strict';
import { memoryStore } from './teamProcesses.test.js';
import { buildWorkload, parseEffortMinutes } from '../src/utils/workload.js';
import { compareRecordVersions, resolveRecordVersions, sameValue } from '../src/utils/recordConflicts.js';
import { saveTaskDetails, saveWeeklyCapacity } from '../src/services/taskEditing.js';
import { saveEvaluation } from '../src/services/workspaceMutations.js';
import { onboardingKey, readOnboarding, writeOnboardingStep } from '../src/utils/memberOnboarding.js';
import { reportEditConflict, reportEditSnapshot } from '../src/utils/reportEditing.js';

export async function runWorkloadAndConflictsTests() {
  const alice = { id: 'a', name: 'Alice', weeklyCapacityMinutes: 45 };
  const bob = { id: 'b', name: 'Bob' };
  const inactive = { id: 'c', name: 'Carol', status: 'inactive' };
  const task = { id: 't', text: 'Sensor', estimatedMinutes: 120, dueDate: '2026-11-04', priority: 'normal', participants: [alice, bob], status: 'doing', seasonId: 'legacy' };
  const workload = buildWorkload({ students: [alice, bob, inactive], today: '2026-11-04', tasks: [task,
    { ...task, id: 'review', status: 'review', estimatedMinutes: 600 },
    { ...task, id: 'unknown', participants: [alice], estimatedMinutes: null, dueDate: '', block: { reason: 'Ajuda' } },
    { ...task, id: 'future', dueDate: '2026-12-01' },
    { ...task, id: 'done', status: 'done' },
    { ...task, id: 'former', participants: [inactive] },
  ] });
  assert.equal(workload.rows.length, 2);
  assert.equal(workload.rows[0].estimatedMinutes, 60, 'shared effort is divided without counting reviews or finished work');
  assert.equal(workload.rows[0].overCapacity, true);
  assert.equal(workload.rows[0].unestimated, 1);
  assert.equal(workload.rows[0].withoutDeadline, 1);
  assert.equal(workload.rows[0].blocked, 1);
  assert.equal(workload.rows[0].inReview, 1);
  assert.equal(workload.rows[1].capacity, null, 'missing availability must not imply zero or a guessed capacity');
  assert.equal(workload.unassigned[0].id, 'former');
  assert.equal(parseEffortMinutes(''), null);
  assert.throws(() => parseEffortMinutes(-1));
  assert.throws(() => parseEffortMinutes(4.5));

  const memory = memoryStore({ 'students/a': alice, 'tasks/t': task });
  const options = { db: {}, user: { type: 'admin', name: 'Técnico' }, id: 't', expected: task, changes: { ...task, text: 'Meu texto' }, store: memory.store };
  const remote = { ...task, text: 'Texto de outro técnico', priority: 'alta' };
  memory.records.set('tasks/t', remote);
  let failure;
  await assert.rejects(saveTaskDetails(options), (error) => { failure = error; return error.code === 'record-conflict'; });
  assert.equal(memory.records.get('tasks/t').text, remote.text);
  assert.ok(compareRecordVersions(failure.conflict).find((row) => row.field === 'text').needsChoice);
  assert.throws(() => resolveRecordVersions(failure.conflict), /Escolha/);
  const merged = resolveRecordVersions(failure.conflict, { text: 'mine' });
  assert.equal(merged.text, 'Meu texto');
  assert.equal(merged.priority, 'alta', 'an untouched local field keeps the other editor’s change');
  await saveTaskDetails({ ...options, expected: failure.conflict.current, changes: merged });
  assert.equal(memory.records.get('tasks/t').text, 'Meu texto');
  assert.equal(memory.records.get('tasks/t').priority, 'alta');
  assert.deepEqual(memory.records.get('tasks/t').participants, task.participants);
  await assert.rejects(saveTaskDetails({ ...options, user: { type: 'student' } }), /Apenas o técnico/);
  await assert.rejects(saveTaskDetails({ ...options, expected: memory.records.get('tasks/t'), changes: { ...task, estimatedMinutes: 2500 } }), /2.400/);
  await saveWeeklyCapacity({ db: {}, user: options.user, studentId: 'a', minutes: 90, expected: 45, store: memory.store });
  await assert.rejects(saveWeeklyCapacity({ db: {}, user: options.user, studentId: 'a', minutes: 120, expected: 45, store: memory.store }), (error) => error.code === 'record-conflict');
  assert.equal(memory.records.get('students/a').weeklyCapacityMinutes, 90);
  assert.equal(sameValue({ b: 2, a: 1 }, { a: 1, b: 2 }), true);

  const evaluation = { id: 'evaluation', type: 'weekly', studentId: 'a', seasonId: 'legacy', strengths: 'Original', improvement: 'Praticar', ratings: { effort: 3 }, updatedAt: '2026-11-04T10:00:00Z', revision: 1 };
  const currentEvaluation = { ...evaluation, strengths: 'Outro registro', revision: 2 };
  memory.records.set('finalSprintEvaluations/evaluation', currentEvaluation);
  await assert.rejects(saveEvaluation({ db: {}, user: options.user, id: 'evaluation', evaluation: { ...evaluation, improvement: 'Meu próximo passo' }, expected: evaluation, store: memory.store }), (error) => {
    assert.equal(error.code, 'record-conflict'); assert.equal(error.currentRecord.revision, 2);
    assert.equal(error.conflict.current.strengths, 'Outro registro'); return true;
  });
  assert.deepEqual(memory.records.get('finalSprintEvaluations/evaluation'), currentEvaluation);

  const storage = new Map(); const adapter = { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  const key = onboardingKey('a', 'season');
  writeOnboardingStep(adapter, key, 'station', true);
  writeOnboardingStep(adapter, key, 'tasks', true);
  assert.deepEqual(readOnboarding(adapter, key).completed, ['station', 'tasks']);
  assert.deepEqual(readOnboarding(adapter, onboardingKey('b', 'season')).completed, []);
  assert.deepEqual(readOnboarding(adapter, onboardingKey('a', 'next-season')).completed, []);
  writeOnboardingStep(adapter, key, 'station', false);
  assert.deepEqual(readOnboarding(adapter, key).completed, ['tasks']);
  assert.throws(() => writeOnboardingStep(adapter, key, 'unknown', true));

  const baseReport = reportEditSnapshot({ title: 'Original', revision: 1, fileName: 'original.pdf', fileSize: 20, fileRevision: 1 });
  const reportConflict = reportEditConflict(baseReport, { title: 'Outro título', revision: 2, fileName: 'outro.pdf', fileSize: 40, fileRevision: 2 }, { ...baseReport, title: 'Meu título' }, { name: 'meu.pdf', size: 30 });
  assert.equal(compareRecordVersions(reportConflict).find((row) => row.field === 'document').needsChoice, true);
  assert.equal(resolveRecordVersions(reportConflict, { title: 'mine', document: 'current' }).document.fileName, 'outro.pdf');
}
