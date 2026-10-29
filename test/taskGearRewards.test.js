import assert from 'node:assert/strict';
import { memoryStore } from './teamProcesses.test.js';
import { changeTaskStage } from '../src/services/taskWorkflow.js';
import { setTaskGearReward, validateTaskGearReward } from '../src/services/taskGearRewards.js';
import { subscribeGearGrants } from '../src/services/gearGrants.js';
import { gearProfile } from '../src/utils/gearShop.js';

export async function runTaskGearRewardsTests() {
  for (const value of [-1, 0.5, '20', NaN, 10001]) assert.throws(() => validateTaskGearReward(value));
  for (const value of [0, 20, 10000]) assert.equal(validateTaskGearReward(value), value);
  const admin = { type: 'admin', uid: 'coach', name: 'Coach' };
  const account = { ...gearProfile('a'), balance: 200, earned: 245, spent: 45, refundCount: 1, growthPoints: 100, contributionCounts: { code: 3 } };
  const initial = {
    'settings/workspace_season': { activeSeasonId: 'current' },
    'students/a': { name: 'Ana', status: 'active', xp: 100 },
    'students/b': { name: 'Bruno' },
    'students/c': { name: 'Caio', status: 'active' },
    'students/inactive': { status: 'inactive' },
    'studentGearProfiles/a': account,
    'tasks/t1': { text: 'Testar a garra', status: 'review', seasonId: 'current', gearReward: 0, evidence: 'Testamos dez vezes.', participants: [{ id: 'a', name: 'Ana' }, { id: 'b', name: 'Bruno' }, { id: 'c', name: 'Caio' }] },
  };
  const memory = memoryStore(initial);
  const context = { db: {}, id: 't1', seasonId: 'current', store: memory.store };
  const configure = (changes = {}) => setTaskGearReward({ ...context, user: admin, expectedCoins: 0, coins: 25, ...changes });
  const approve = (changes = {}) => changeTaskStage({ ...context, status: 'done', expectedStatus: 'review', expectedGearReward: 25, isAdmin: true, actor: admin.name, actorId: admin.uid, ...changes });
  await assert.rejects(configure({ user: { type: 'student' } }), /Somente/);
  await configure();
  await assert.rejects(configure({ coins: 30 }), /Outro/);
  await assert.rejects(approve({ expectedGearReward: 0 }), /recompensa mudou/);
  await assert.rejects(approve({ isAdmin: false }), /técnico/);
  const beforeFailure = structuredClone([...memory.records]);
  const interrupted = { ...memory.store, runTransaction: (_db, action) => memory.store.runTransaction(_db, async (transaction) => { await action(transaction); throw new Error('Interrupted'); }) };
  await assert.rejects(approve({ store: interrupted }), /Interrupted/);
  assert.deepEqual([...memory.records], beforeFailure, 'Approval, every wallet and receipts roll back together');
  const result = await approve();
  assert.deepEqual(result, { rewardedStudents: 3, coinsPerStudent: 25 });
  assert.equal(memory.records.get('tasks/t1').status, 'done');
  assert.deepEqual(memory.records.get('tasks/t1').gearRewardPaidStudentIds, ['a', 'b', 'c']);
  assert.equal(memory.records.get('tasks/t1').gearRewardPaidBy, 'coach');
  for (const id of ['a', 'b', 'c']) {
    const wallet = memory.records.get(`studentGearProfiles/${id}`);
    assert.equal(wallet.balance, id === 'a' ? 225 : 65);
    assert.equal(wallet.earned, wallet.balance + wallet.spent);
    const receipt = memory.records.get(`studentGearProfiles/${id}/taskGrants/t1`);
    assert.equal(receipt.coins, 25); assert.equal(receipt.actorId, 'coach'); assert.equal(receipt.seasonId, 'current');
    assert.equal(receipt.createdAt, memory.records.get('tasks/t1').gearRewardPaidAt);
  }
  for (const field of ['spent', 'owned', 'equipped', 'growthPoints', 'contributionCounts', 'refundCount', 'rewardDay', 'dayCounts', 'refundableItems']) assert.deepEqual(memory.records.get('studentGearProfiles/a')[field], account[field]);
  assert.deepEqual(memory.records.get('students/a'), initial['students/a'], 'No XP or grades are changed');
  await assert.rejects(configure({ expectedCoins: 25 }), /concluída|paga/);
  const walletBeforeReopen = structuredClone(memory.records.get('studentGearProfiles/a'));
  await approve({ status: 'review', expectedStatus: 'done', details: { evidence: 'Reaberta para conferir.' } });
  assert.equal(memory.records.get('tasks/t1').evidence, initial['tasks/t1'].evidence, 'Reopening preserves submitted evidence');
  await assert.rejects(configure({ expectedCoins: 25 }), /paga/);
  assert.deepEqual(await approve(), { rewardedStudents: 0, coinsPerStudent: 0 });
  assert.deepEqual(memory.records.get('studentGearProfiles/a'), walletBeforeReopen, 'Reapproval never pays twice');

  for (const participants of [[], [{ name: 'Sem cadastro' }], [{ id: '../invalid' }], [{ id: 'a' }, { id: 'inactive' }], [{ id: 'a' }, { id: 'missing' }], ['a', 'b', 'c', 'inactive'].map((id) => ({ id }))]) {
    const invalid = memoryStore({ ...initial, 'tasks/t1': { ...initial['tasks/t1'], participants, gearReward: 25 } });
    const before = structuredClone([...invalid.records]);
    await assert.rejects(approve({ store: invalid.store }));
    assert.deepEqual([...invalid.records], before, 'An invalid recipient prevents all payouts and task approval');
  }
  for (const task of [{ participants: [{ id: 'a' }, { id: 'a' }] }, { participants: undefined, assigneeId: 'a' }, { participants: [], assigneeId: 'a' }]) {
    const single = memoryStore({ ...initial, 'tasks/t1': { ...initial['tasks/t1'], ...task, gearReward: 25 } });
    assert.equal((await approve({ store: single.store })).rewardedStudents, 1);
    assert.equal(single.records.get('studentGearProfiles/a').balance, 225);
  }
  const duplicate = memoryStore({ ...initial, 'tasks/t1': { ...initial['tasks/t1'], gearReward: 25 }, 'studentGearProfiles/a/taskGrants/t1': { coins: 25 } });
  await assert.rejects(approve({ store: duplicate.store }), /recibo/);
  assert.equal(duplicate.records.get('tasks/t1').status, 'review');
  const free = memoryStore(initial);
  assert.deepEqual(await approve({ store: free.store }), { rewardedStudents: 0, coinsPerStudent: 0 });
  assert.equal(free.records.has('studentGearProfiles/b'), false);
  const locked = memoryStore({ ...initial, 'settings/workspace_season': { activeSeasonId: 'current', transitionLock: {} } });
  await assert.rejects(configure({ store: locked.store }), /encerrada/);
  await assert.rejects(approve({ store: locked.store }), /encerrada/);
  await assert.rejects(configure({ seasonId: 'old' }), /temporada mudou/);

  const listeners = []; let rows; let stopped = 0;
  const subscriptionStore = { collection: (_db, ...parts) => parts, query: (...parts) => parts, orderBy: () => null, limit: () => null, onSnapshot: (_query, callback) => { listeners.push(callback); return () => { stopped++; }; } };
  const stop = subscribeGearGrants({ db: {}, user: admin, studentId: 'a', includeTasks: true, onData: (value) => { rows = value; }, store: subscriptionStore });
  listeners[0]({ docs: [{ id: 'x', data: () => ({ studentId: 'a', coins: 5, createdAt: '2026-10-28' }) }] });
  assert.equal(rows, undefined, 'Wait for both histories to avoid flicker');
  listeners[1]({ docs: [{ id: 'x', data: () => ({ studentId: 'a', coins: 25, createdAt: '2026-10-29' }) }, { id: 'foreign', data: () => ({ studentId: 'b', coins: 500 }) }] });
  assert.deepEqual(rows.map((entry) => entry.source), ['kanban', 'manual']);
  assert.equal(new Set(rows.map((entry) => entry.id)).size, 2);
  stop(); assert.equal(stopped, 2);
}
