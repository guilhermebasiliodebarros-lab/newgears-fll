import assert from 'node:assert/strict';
import { memoryStore } from './teamProcesses.test.js';
import { grantStudentGears, subscribeGearGrants } from '../src/services/gearGrants.js';
import { GEAR_GRANT_MAX, validateGearGrant } from '../src/utils/gearGrants.js';
import { gearProfile } from '../src/utils/gearShop.js';

export async function runGearGrantsTests() {
  const valid = { studentId: 'a', coins: 25, reason: 'Concluiu os testes da garra.', grantId: 'grant-1', seasonId: 'current' };
  assert.equal(validateGearGrant({ ...valid, reason: '  Concluiu os testes da garra.  ' }).reason, valid.reason);
  for (const changes of [{ coins: 0 }, { coins: -1 }, { coins: 0.5 }, { coins: '25' }, { coins: NaN }, { coins: GEAR_GRANT_MAX + 1 }, { reason: '' }, { reason: 'a' }, { reason: 'x'.repeat(501) }, { studentId: '../private' }, { grantId: 'x/y' }, { seasonId: '' }]) assert.throws(() => validateGearGrant({ ...valid, ...changes }));

  const account = { ...gearProfile('a'), balance: 200, earned: 245, spent: 45, growthPoints: 100, refundCount: 1, contributionCounts: { code: 3 }, owned: [...gearProfile('a').owned, 'accessory-visor'], refundableItems: ['accessory-visor'] };
  const memory = memoryStore({ 'settings/workspace_season': { activeSeasonId: 'current' }, 'students/a': { name: 'Ana', status: 'active', xp: 321, grades: { math: 10 } }, 'students/b': { name: 'Bruno', status: 'active' }, 'students/inactive': { status: 'inactive' }, 'studentGearProfiles/a': account });
  const admin = { type: 'admin', uid: 'coach', name: 'Técnico' };
  const context = { db: {}, user: admin, store: memory.store, ...valid };
  const originalStudent = structuredClone(memory.records.get('students/a'));
  const result = await grantStudentGears(context);
  assert.equal(result.coins, 25); assert.equal(result.balance, 225);
  const next = memory.records.get('studentGearProfiles/a');
  assert.equal(next.balance, 225); assert.equal(next.earned, 270); assert.equal(next.earned, next.spent + next.balance);
  for (const field of ['spent', 'growthPoints', 'contributionCounts', 'owned', 'equipped', 'refundCount', 'refundableItems', 'rewardDay', 'dayCounts']) assert.deepEqual(next[field], account[field]);
  assert.deepEqual(memory.records.get('students/a'), originalStudent, 'Granting Gears never edits grades, XP or the student record');
  assert.equal(memory.records.has('studentGearProfiles/b'), false);
  const receipt = memory.records.get('studentGearProfiles/a/manualGrants/grant-1');
  assert.equal(receipt.reason, valid.reason); assert.equal(receipt.actorId, admin.uid); assert.equal(receipt.seasonId, 'current');
  assert.doesNotMatch(JSON.stringify(receipt), /grades|math|xp/);
  const saved = structuredClone([...memory.records]);
  assert.equal((await grantStudentGears(context)).duplicate, true);
  assert.deepEqual([...memory.records], saved, 'Retrying a confirmed submission never credits the same grant twice');
  for (const changes of [{ coins: 40 }, { reason: 'Outra tarefa concluída.' }, { user: { ...admin, uid: 'other-coach' } }]) await assert.rejects(grantStudentGears({ ...context, ...changes }), /outros dados/);
  await assert.rejects(grantStudentGears({ ...context, user: { type: 'student', studentId: 'a' } }), /Somente o técnico/);
  await assert.rejects(grantStudentGears({ ...context, user: null }), /Somente o técnico/);
  await assert.rejects(grantStudentGears({ ...context, studentId: 'inactive', grantId: 'inactive-grant' }), /aluno ativo/);
  await assert.rejects(grantStudentGears({ ...context, studentId: 'missing', grantId: 'missing-grant' }), /aluno ativo/);
  await assert.rejects(grantStudentGears({ ...context, seasonId: 'old', grantId: 'old-grant' }), /temporada mudou/);
  const interrupted = { ...memory.store, runTransaction: (_db, operation) => memory.store.runTransaction(_db, async (transaction) => { await operation(transaction); throw new Error('Network failed'); }) };
  const beforeFailure = structuredClone([...memory.records]);
  await assert.rejects(grantStudentGears({ ...context, grantId: 'failed-grant', store: interrupted }), /Network failed/);
  assert.deepEqual([...memory.records], beforeFailure, 'Wallet and receipt are never partially written');
  const fresh = await grantStudentGears({ ...context, studentId: 'b', grantId: 'new-wallet', coins: 10 });
  assert.equal(fresh.balance, 50, 'The initial wallet receives welcome Gears once plus the granted amount');
  await grantStudentGears({ ...context, studentId: 'b', grantId: 'second-task', coins: 5 });
  assert.equal(memory.records.get('studentGearProfiles/b').balance, 55);
  memory.records.get('studentGearProfiles/a').balance = Number.MAX_SAFE_INTEGER;
  memory.records.get('studentGearProfiles/a').spent = 0;
  memory.records.get('studentGearProfiles/a').earned = Number.MAX_SAFE_INTEGER;
  await assert.rejects(grantStudentGears({ ...context, grantId: 'overflow' }), /acima do limite/);
  memory.records.set('settings/workspace_season', { activeSeasonId: 'current', transitionLock: {} });
  await assert.rejects(grantStudentGears({ ...context, grantId: 'locked' }), /encerrada/);

  let path; let constraints; let listener; let rows;
  const subscriptionStore = { collection: (_db, ...parts) => { path = parts; return parts; }, orderBy: (...args) => ['orderBy', ...args], limit: (count) => ['limit', count], query: (...args) => { constraints = args; return args; }, onSnapshot: (_query, callback) => { listener = callback; return () => {}; } };
  subscribeGearGrants({ db: {}, user: { type: 'student', studentId: 'a' }, studentId: 'a', onData: (value) => { rows = value; }, onError: () => {}, store: subscriptionStore });
  assert.deepEqual(path, ['studentGearProfiles', 'a', 'manualGrants']);
  assert.deepEqual(constraints.slice(1), [['orderBy', 'createdAt', 'desc'], ['limit', 10]]);
  listener({ docs: [{ id: 'g1', data: () => ({ studentId: 'a', coins: 25 }) }, { id: 'foreign', data: () => ({ studentId: 'b', coins: 500 }) }] });
  assert.deepEqual(rows.map((entry) => entry.id), ['g1']);
  assert.throws(() => subscribeGearGrants({ user: { type: 'student', studentId: 'a' }, studentId: 'b', store: subscriptionStore }), /próprias concessões/);
}
