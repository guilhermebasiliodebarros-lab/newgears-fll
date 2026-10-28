import assert from 'node:assert/strict';
import { memoryStore } from './teamProcesses.test.js';
import { saveTeamCheckIn } from '../src/services/teamCheckIn.js';
import { rewardGearContribution } from '../src/services/gearShop.js';
import { reconcileGearHistory } from '../src/services/gearHistory.js';
import { gearReceiptId, validGearCheckIn } from '../src/utils/gearShop.js';

export async function runGearCheckInTests() {
  const memory = memoryStore({ 'students/a': { name: 'Mariana', xp: 12, status: 'active' }, 'students/b': { name: 'João', xp: 7, status: 'active' } });
  const store = { ...memory.store, query: (source) => source, where: (...values) => values, setDoc: (reference, value) => memory.store.runTransaction({}, async (transaction) => transaction.set(reference, value)) };
  const context = { db: {}, user: { type: 'student', studentId: 'a' }, studentId: 'a', store };
  const first = await saveTeamCheckIn({ ...context, date: '2026-10-28', level: 25 });
  assert.equal(first.xp, 14);
  assert.equal(first.sourceId, 'a__2026-10-28');
  assert.equal(first.record.createdByStudentId, 'a');
  assert.equal((await saveTeamCheckIn({ ...context, date: '2026-10-28', level: 100 })).duplicate, true);
  assert.equal(memory.records.get('students/a').xp, 14, 'A repeat cannot award XP twice');
  assert.equal((await rewardGearContribution({ ...context, type: 'checkin', sourceId: first.sourceId })).coins, 5);
  assert.equal((await rewardGearContribution({ ...context, type: 'checkin', sourceId: first.sourceId })).duplicate, true);
  memory.records.set('dailyMoods/random-duplicate', { studentId: 'a', date: '2026-10-28', level: 100 });
  assert.equal((await rewardGearContribution({ ...context, type: 'checkin', sourceId: 'random-duplicate' })).duplicate, true, 'Check-in receipts are unique per student/date even for legacy random document IDs');
  assert.equal(memory.records.get('studentGearProfiles/a').balance, 45);
  await assert.rejects(saveTeamCheckIn({ ...context, user: { type: 'student', studentId: 'b' }, date: '2026-10-28', level: 75 }), /seu perfil/);
  await assert.rejects(saveTeamCheckIn({ ...context, date: '2026-02-30', level: 75 }), /opções/);
  assert.equal(validGearCheckIn({ date: '2026-10-28', level: 0 }), false);
  await assert.rejects(rewardGearContribution({ ...context, studentId: 'b', user: { type: 'student', studentId: 'b' }, type: 'checkin', sourceId: first.sourceId }), /seu nome/);

  memory.records.set('dailyMoods/old-low', { studentId: 'a', studentName: 'Mariana', date: '2026-09-01', level: 25 });
  memory.records.set('dailyMoods/old-low-copy', { studentId: 'a', date: '2026-09-01', level: 75 });
  memory.records.set('dailyMoods/old-high', { studentId: 'b', date: '2026-09-01', level: 100 });
  memory.records.set('codeSnippets/capped', { title: 'Programa antigo', createdByStudentId: 'a' });
  memory.records.set('studentGearRewards/a__code__capped', { studentId: 'a', type: 'code', sourceId: 'capped', sourcePath: 'codeSnippets/capped', coins: 7, growthPoints: 12 });
  const before = memory.records.get('studentGearProfiles/a');
  memory.records.set('studentGearProfiles/a', { ...before, growthPoints: before.growthPoints + 12, contributionCounts: { ...before.contributionCounts, code: 1 } });
  const result = await reconcileGearHistory({ ...context, user: { type: 'admin' } });
  assert.equal(result.checkins, 2);
  assert.equal(result.coins, 15, 'Two historical check-ins + 5 missing Gears from an old partial reward');
  assert.equal(result.points, 10, 'Completing an old coin amount never duplicates evolution');
  assert.equal(memory.records.get('students/a').xp, 14, 'Retroactive check-ins do not award XP again');
  assert.equal(memory.records.get('studentGearRewards/a__code__capped').coinsBeforeUncap, 7);
  assert.equal(memory.records.get('studentGearProfiles/a').contributionCounts.code, 1);
  const repeated = await reconcileGearHistory({ ...context, user: { type: 'admin' } });
  assert.equal(repeated.coins, 0); assert.equal(repeated.points, 0);
  assert.equal(gearReceiptId('a', 'checkin', 'anything', { date: '2026-09-01', level: 25 }), 'a__checkin__2026-09-01');
  assert.equal(memory.records.get('studentGearProfiles/a').contributionCounts.checkin, 2, 'Multiple same-day source docs count as one participation');
}
