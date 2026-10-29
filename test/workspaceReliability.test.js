import assert from 'node:assert/strict';
import { normalizeTaskRecord, normalizeKanbanTasks, normalizeEventRecord, recordDate, recordDay } from '../src/utils/workspaceRecords.js';
import { createBrowserStorage } from '../src/utils/browserStorage.js';
import { buildRotationSchedule, resolvePlanningConfig, taskParticipants } from '../src/utils/teamProcesses.js';
import { getAgendaRelativeLabel, parseAgendaDate } from '../src/utils/agenda.js';

export async function runWorkspaceReliabilityTests() {
  const roster = [{ id: 'a', name: 'Ana', status: 'active' }];
  const original = {
    id: 't1', status: 'review', text: 'Validar a garra', author: 'Ana',
    participants: [{ id: 'a', name: 'Ana' }], gearReward: 20,
    gearRewardPaidAt: '2026-10-29T12:00:00Z', gearRewardReceipt: { a: 20 },
    createdAt: '2026-10-29T12:00:00.000Z', dueDate: '2026-10-30',
  };
  const normalized = normalizeTaskRecord(original);
  assert.equal(normalized.text, original.text);
  assert.equal(normalized.status, original.status);
  assert.equal(normalized.gearReward, original.gearReward);
  assert.equal(normalized.gearRewardPaidAt, original.gearRewardPaidAt);
  assert.equal(normalized.gearRewardReceipt, original.gearRewardReceipt);
  assert.deepEqual(normalized.participants, original.participants);
  assert.equal(normalized.dueDate, original.dueDate);
  assert.equal(original.block, undefined, 'normalizing must not mutate database data');

  const malformed = normalizeTaskRecord({ id: 'old', author: { name: 'Ana' }, participants: [null, { id: 'a' }, 'Ana'], history: 'old', blockHistory: {}, evidence: { text: 'old' }, block: { reason: { text: 'old' } }, dueDate: { seconds: 1793275200 }, createdAt: { seconds: 1793275200 }, gearReward: {} });
  assert.equal(typeof malformed.text, 'string');
  assert.equal(typeof malformed.author, 'string');
  assert.equal(typeof malformed.dueDate, 'string');
  assert.equal(malformed.createdAt, '2026-10-29T12:00:00.000Z');
  assert.deepEqual(malformed.history, []);
  assert.deepEqual(malformed.blockHistory, []);
  assert.equal(malformed.block.reason, '');
  assert.equal(malformed.evidence, '');
  assert.equal(malformed.gearReward, 0);
  assert.deepEqual(taskParticipants(malformed, roster), [{ id: 'a', name: 'Ana' }]);
  assert.deepEqual(taskParticipants({ participants: [null, { name: 'Desconhecido' }] }, roster), [{ id: '', name: 'Desconhecido' }], 'do not invent participant IDs for rewards');
  assert.deepEqual(taskParticipants({ author: { name: 'Ana' } }, roster), []);
  assert.deepEqual(normalizeKanbanTasks(null), []);
  assert.equal(normalizeKanbanTasks([null, 'old', original]).length, 1);

  for (const invalid of ['', '2026-02-31', '2026-13-01', 'invalid', {}, null]) {
    assert.equal(recordDay(invalid), '');
    assert.equal(parseAgendaDate(invalid), null);
    assert.equal(getAgendaRelativeLabel(invalid, new Date()), 'Data não definida');
  }
  assert.equal(recordDay('2028-02-29'), '2028-02-29');
  assert.equal(recordDay('2026-10-29T23:59:00-03:00'), '2026-10-29');
  assert.equal(recordDate({ toDate: () => new Date('2026-10-29T12:00:00Z') }).toISOString(), '2026-10-29T12:00:00.000Z');
  assert.equal(recordDate({ toDate: () => { throw Error('invalid timestamp'); } }), null);
  const event = normalizeEventRecord({ date: {}, time: 14, title: {}, description: [] });
  assert.equal(event.date, '');
  assert.equal(event.time, '');
  assert.equal(typeof event.title, 'string');

  const planning = resolvePlanningConfig({ startDate: '2026-02-31', totalWeeks: Infinity, trainingDays: 'Monday', pauseWeeks: {}, participantIds: null, captainIds: {}, traineeIds: 'a' }, roster);
  assert.doesNotThrow(() => buildRotationSchedule(roster, planning));
  assert.equal(buildRotationSchedule(roster, planning).length, 36);
  assert.deepEqual(planning.trainingDays, [1, 3]);
  assert.deepEqual(planning.participantIds, ['a']);
  const validPlanning = { ...planning, trainingDays: [2, 4], pauseWeeks: ['2026-11-02'], totalWeeks: 3, participantIds: [], captainIds: ['a'], traineeIds: [] };
  assert.deepEqual(resolvePlanningConfig(validPlanning, roster), validPlanning, 'preserve intentional empty lists');

  const saved = new Map([['old', 'value']]);
  let blocked = false;
  let failures = 0;
  const storage = createBrowserStorage(() => {
    if (blocked) throw Error('Storage blocked');
    return { getItem: (key) => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value), removeItem: (key) => saved.delete(key) };
  }, () => { failures++; });
  storage.setItem('theme', 'gold');
  assert.equal(saved.get('theme'), 'gold');
  blocked = true;
  assert.equal(storage.getItem('missing'), null);
  assert.doesNotThrow(() => storage.setItem('theme', 'classic'));
  assert.equal(storage.getItem('theme'), 'classic');
  storage.removeItem('old');
  blocked = false;
  assert.equal(storage.getItem('old'), null, 'failed removals must not resurrect old session values');
  assert.equal(storage.getItem('theme'), 'classic');
  storage.setItem('theme', 'gold');
  assert.equal(storage.getItem('theme'), 'gold');
  assert.ok(failures >= 3);
  const quota = createBrowserStorage(() => ({ setItem: () => { throw Error('QuotaExceededError'); } }));
  assert.doesNotThrow(() => quota.setItem('session', 'current'));
  assert.equal(quota.getItem('session'), 'current');
}
