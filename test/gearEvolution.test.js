import assert from 'node:assert/strict';
import { memoryStore } from './teamProcesses.test.js';
import { buildGearHistoryPlan, gearContributionTip, gearEvolution } from '../src/utils/gearEvolution.js';
import { newGearProfile } from '../src/utils/gearShop.js';
import { creditGearHistory, reconcileGearHistory } from '../src/services/gearHistory.js';
import { purchaseGearItem, rewardGearContribution } from '../src/services/gearShop.js';

export async function runGearEvolutionTests() {
  const students = [{ id: 'a', name: 'Mariana' }, { id: 'b', name: 'João' }, { id: 'c', name: 'Joao' }, { id: 'archived', name: 'Antigo', status: 'inactive' }];
  const data = {
    'students/a': students[0], 'students/b': students[1], 'students/c': students[2], 'students/archived': students[3],
    'codeSnippets/legacy': { title: 'Sensor', author: ' MARIANA ' },
    'codeSnippets/ambiguous': { title: 'Ambíguo', author: 'Joao' },
    'codeSnippets/foreign': { title: 'Outro autor', createdByStudentId: 'b', author: 'Mariana' },
    'experts/legacy': { name: 'Pesquisadora' },
    'robotVersions/unassigned': { version: 'V1' },
    'prototypeIterations/one': { improvement: 'Base estável', authorId: 'a' },
    'students/a/logbook/one': { text: 'Aprendemos a testar.' },
    'score_history/one': { date: '2026-10-12', author: 'Mariana' },
    'activityLogs/created': { action: 'registrou um especialista', title: 'Pesquisadora', actorId: 'a', actorType: 'student' },
    'activityLogs/edited': { action: 'atualizou uma versao do robo', title: 'V1', actorId: 'a', actorType: 'student' },
  };
  const memory = memoryStore(data);
  const store = { ...memory.store, setDoc: (reference, value) => memory.store.runTransaction({}, async (transaction) => transaction.set(reference, value)) };
  const context = { db: {}, user: { type: 'admin' }, store };
  const summary = await reconcileGearHistory(context);
  assert.equal(summary.total, 6, 'Only records with unambiguous authorship are recognized');
  assert.equal(summary.unresolved.length, 2, 'Duplicate names and an edit-only activity cannot claim a record');
  const account = memory.records.get('studentGearProfiles/a');
  assert.equal(account.balance, 40 + 12 + 20 + 15 + 5 + 6);
  assert.equal(account.growthPoints, 58);
  assert.deepEqual(account.contributionCounts, { code: 1, expert: 1, prototype: 1, logbook: 1, test: 1 });
  assert.equal(account.dayEarned, 0, 'Retroactive recognition does not consume today’s coin allowance');
  assert.equal(memory.records.get('students/a').xp, undefined, 'Growth and retroactive Gears never alter XP');
  assert.equal(memory.records.get('studentGearProfiles/b').contributionCounts.code, 1, 'An explicit ID takes precedence over a legacy author name');
  const beforeRepeat = structuredClone(memory.records.get('studentGearProfiles/a'));
  const repeated = await reconcileGearHistory(context);
  assert.equal(repeated.coins, 0); assert.equal(repeated.points, 0);
  assert.deepEqual(memory.records.get('studentGearProfiles/a'), beforeRepeat, 'Repeating the migration is idempotent');
  await assert.rejects(reconcileGearHistory({ ...context, user: { type: 'student', studentId: 'a' } }), /Somente o técnico/);

  memory.records.set('codeSnippets/already-paid', { title: 'Existente', createdByStudentId: 'a' });
  memory.records.set('studentGearRewards/a__code__already-paid', { studentId: 'a', type: 'code', sourceId: 'already-paid', sourcePath: 'codeSnippets/already-paid', coins: 0, day: '2026-10-20' });
  const migration = await creditGearHistory({ ...context, students, candidate: { studentId: 'a', type: 'code', sourceId: 'already-paid', attribution: { kind: 'id' } } });
  assert.equal(migration.coins, 12); assert.equal(migration.points, 12, 'A formerly capped receipt receives only its missing coins and evolution');
  assert.equal(memory.records.get('studentGearProfiles/a').balance, beforeRepeat.balance + 12);
  assert.equal(memory.records.get('studentGearRewards/a__code__already-paid').coins, 12);
  assert.equal(memory.records.get('studentGearRewards/a__code__already-paid').coinsBeforeUncap, 0, 'The correction preserves the original amount for audit');
  assert.equal((await creditGearHistory({ ...context, students, candidate: { studentId: 'a', type: 'code', sourceId: 'already-paid', attribution: { kind: 'id' } } })).duplicate, true);
  memory.records.set('codeSnippets/changed-owner', { title: 'Mudou', createdByStudentId: 'b' });
  await assert.rejects(creditGearHistory({ ...context, students, candidate: { studentId: 'a', type: 'code', sourceId: 'changed-owner', attribution: { kind: 'id' } } }), /autoria/);

  const capped = { ...newGearProfile('a'), rewardDay: '2026-10-28', rewardDayIndex: Math.floor((new Date('2026-10-28T15:00:00Z').getTime() - 10800000) / 86400000), dayEarned: 60 };
  memory.records.set('studentGearProfiles/a', capped);
  memory.records.set('codeSnippets/capped', { title: 'Mesmo com limite', createdByStudentId: 'a' });
  const reward = await rewardGearContribution({ ...context, user: { type: 'student', studentId: 'a' }, studentId: 'a', type: 'code', sourceId: 'capped', referenceDate: new Date('2026-10-28T15:00:00Z') });
  assert.equal(reward.coins, 12);
  assert.equal(memory.records.get('studentGearProfiles/a').growthPoints, 12, 'An old daily counter no longer reduces coins or growth');
  const evolution = gearEvolution({ growthPoints: 105, contributionCounts: { code: 1, expert: 2, prototype: 2, contact: 1, logbook: 3 } });
  assert.equal(evolution.level, 3); assert.equal(evolution.total, 9);
  assert.equal(evolution.milestones.find((item) => item.id === 'expert').achieved, true);
  assert.equal(gearEvolution({ growthPoints: 400 }).next, undefined);
  const rich = { ...newGearProfile('a'), growthPoints: 105, balance: 150, earned: 150 };
  memory.records.set('studentGearProfiles/a', rich);
  await purchaseGearItem({ ...context, user: { type: 'student', studentId: 'a' }, studentId: 'a', itemId: 'skin-solar' });
  assert.equal(memory.records.get('studentGearProfiles/a').growthPoints, 105, 'Purchases never reduce growth');
  assert.notEqual(gearContributionTip('prototype', {}), gearContributionTip('prototype', { result: 'Um resultado de teste bem documentado', nextStep: 'Comparar a próxima versão amanhã' }));
  assert.match(gearContributionTip('expert', {}), /descoberta/);
  assert.match(gearContributionTip('test', {}), /aprenderam/);
  const ambiguous = buildGearHistoryPlan({ students, records: { experts: [{ id: '1', name: 'Nome' }, { id: '2', name: 'Nome' }] }, activities: [{ id: 'creation', title: 'Nome', actorId: 'a', action: 'registrou um especialista' }] });
  assert.equal(ambiguous.candidates.length, 0, 'The same interview title cannot attribute multiple legacy sources');
}
