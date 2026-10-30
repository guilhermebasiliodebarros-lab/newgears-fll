import assert from 'node:assert/strict';
import { memoryStore } from './teamProcesses.test.js';
import { adjustStudentXp, undoStudentXp, reviewLeaderPenalty, saveSchoolGrades, claimEnglishReward, changeStudentBadge } from '../src/services/studentXp.js';
import { legacySessionIdentity } from '../src/utils/legacySession.js';
import { applyOfficialCode, deleteRobotRound, saveEvaluation, clearTrainingHistory } from '../src/services/workspaceMutations.js';
import { validateInlineFile } from '../src/utils/inlineMedia.js';
import { planAuthMigration } from '../src/utils/authMigration.js';
import { studentAttendanceStats, studentLevel } from '../src/utils/studentMetrics.js';

function optimisticStore(initial) {
  const memory = memoryStore(initial); const versions = new Map(); let interrupt = false;
  const store = { ...memory.store, deleteField: () => ({ auditDeleteField: true }), runTransaction: async (_db, action) => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const reads = new Map(); const writes = [];
      const value = await action({
        get: async (ref) => { assert.equal(writes.length, 0); reads.set(ref.path, versions.get(ref.path) || 0); return { id: ref.id, exists: () => memory.records.has(ref.path), data: () => structuredClone(memory.records.get(ref.path)) }; },
        set: (ref, data, options) => writes.push({ ref, data, merge: options?.merge }),
        update: (ref, data) => writes.push({ ref, data, merge: true, existing: true }),
        delete: (ref) => writes.push({ ref, remove: true }),
      });
      if ([...reads].some(([key, version]) => (versions.get(key) || 0) !== version)) continue;
      if (interrupt) { interrupt = false; throw Error('Simulated connection failure before commit'); }
      assert.ok(!writes.some((write) => write.existing && !memory.records.has(write.ref.path)));
      for (const write of writes) {
        if (write.remove) memory.records.delete(write.ref.path);
        else {
          const next = write.merge ? { ...memory.records.get(write.ref.path), ...write.data } : { ...write.data };
          for (const [key, value] of Object.entries(next)) if (value?.auditDeleteField) delete next[key];
          memory.records.set(write.ref.path, structuredClone(next));
        }
        versions.set(write.ref.path, (versions.get(write.ref.path) || 0) + 1);
      }
      return value;
    }
    throw Error('Too much contention');
  } };
  return { ...memory, store, interrupt: () => { interrupt = true; } };
}

export async function runAuditCorrectionsTests() {
  const state = optimisticStore({ 'settings/workspace_season': { activeSeasonId: 'current' }, 'students/a': { name: 'Test', xp: 100, status: 'active' } });
  const base = { db: {}, user: { type: 'admin', name: 'Coach' }, seasonId: 'current', studentId: 'a', source: 'manual_reward', store: state.store };
  await Promise.all([adjustStudentXp({ ...base, operationId: 'first', amount: 10 }), adjustStudentXp({ ...base, operationId: 'second', amount: 20 })]);
  assert.equal(state.records.get('students/a').xp, 130, 'optimistic retries preserve simultaneous XP changes');
  assert.equal((await adjustStudentXp({ ...base, operationId: 'first', amount: 10 })).duplicate, true);
  await assert.rejects(adjustStudentXp({ ...base, operationId: 'first', amount: 30 }), /outro registro/);
  await undoStudentXp({ ...base, recordId: 'first' });
  assert.equal(state.records.get('students/a').xp, 120, 'undo compensates only its original gain');
  await undoStudentXp({ ...base, recordId: 'first' });
  assert.equal(state.records.get('students/a').xp, 120, 'undo is idempotent');
  await adjustStudentXp({ ...base, operationId: 'penalty', amount: -5, source: 'penalty', notifyStudent: true, reason: 'Test reason' });
  await undoStudentXp({ ...base, recordId: 'penalty' });
  assert.equal(state.records.get('students/a').xp, 120);
  assert.equal(state.records.get('students/a').xpLossNotifications.length, 0);
  assert.ok(state.records.get('xpLossRecords/penalty').undoneAt, 'undo retains an auditable record instead of deleting history');
  const beforeFailure = structuredClone([...state.records]); state.interrupt();
  await assert.rejects(adjustStudentXp({ ...base, operationId: 'interrupted', amount: -10, notifyStudent: true, reason: 'Test' }), /connection failure/);
  assert.deepEqual([...state.records], beforeFailure);
  await assert.rejects(adjustStudentXp({ ...base, approval: true, expectedSubmission: { text: 'old' }, amount: 10 }), /entrega mudou/);
  assert.throws(() => adjustStudentXp({ ...base, user: { type: 'student' }, amount: 10 }), /técnico/);
  await saveSchoolGrades({ ...base, stageId: 'etapa1', grades: { Matematica: 10 }, expectedGrades: {} });
  assert.equal(state.records.get('students/a').xp, 130);
  await assert.rejects(saveSchoolGrades({ ...base, stageId: 'etapa1', grades: { Matematica: 8 }, expectedGrades: {} }), /notas mudaram/);
  await saveSchoolGrades({ ...base, stageId: 'etapa2', grades: { Matematica: 9 }, expectedGrades: {} });
  assert.equal(state.records.get('students/a').xp, 137, 'another school stage preserves the first and the current XP');
  state.records.set('leaderPenaltyRequests/p1', { seasonId: 'current', studentId: 'a', status: 'pending', amount: -10, reason: 'Test penalty', evidenceImage: 'fixture' });
  await reviewLeaderPenalty({ ...base, id: 'p1', approved: true });
  assert.equal(state.records.get('students/a').xp, 127);
  state.records.set('students/a', { ...state.records.get('students/a'), englishChallengeUnlocked: true });
  const rewards = await Promise.allSettled([claimEnglishReward(base), claimEnglishReward(base)]);
  assert.equal(rewards.filter((item) => item.status === 'fulfilled').length, 1, 'concurrent redemption rewards English once');
  assert.equal(state.records.get('students/a').xp, 147);
  const badge = await changeStudentBadge({ ...base, badgeId: 'test', badgeName: 'Test', bonus: 5, removing: false });
  await changeStudentBadge({ ...base, badgeId: 'other', badgeName: 'Other', bonus: 7, removing: false });
  await adjustStudentXp({ ...base, amount: 10 });
  await undoStudentXp({ ...base, recordId: badge.recordId });
  assert.equal(state.records.get('students/a').xp, 164, 'undo badge preserves other rewards');
  assert.deepEqual(state.records.get('students/a').badges, ['other']);
  const second = await changeStudentBadge({ ...base, badgeId: 'test', badgeName: 'Test', bonus: 5, removing: false });
  await changeStudentBadge({ ...base, badgeId: 'test', badgeName: 'Test', bonus: 5, removing: true });
  await assert.rejects(undoStudentXp({ ...base, recordId: second.recordId }), /conquista mudou/);
  assert.deepEqual(legacySessionIdentity({ type: 'student', data: { id: 'a', name: 'Example', password: 'private', schoolGrades: {}, xp: 500 }, accessToken: 'secret' }), { type: 'student', data: { id: 'a', name: 'Example' } });
  assert.equal(state.records.get('leaderPenaltyRequests/p1').status, 'approved');
  assert.equal(state.records.get('leaderPenaltyRequests/p1').evidenceImage, undefined);
  await assert.rejects(reviewLeaderPenalty({ ...base, id: 'p1', approved: true }), /já foi revisada/);
  assert.equal(state.records.get('students/a').xp, 164);
  state.records.set('rounds/r1', { seasonId: 'current' }); state.records.set('strategies/r1', { keep: true }); state.records.set('score_history/s1', { roundId: 'r1' });
  await deleteRobotRound({ ...base, id: 'r1' });
  assert.equal(state.records.has('rounds/r1'), false); assert.ok(state.records.has('strategies/r1')); assert.ok(state.records.has('score_history/s1'));
  state.records.set('codeSnippets/c1', { seasonId: 'current', applied: true }); state.records.set('codeSnippets/c2', { seasonId: 'current', applied: false });
  state.interrupt(); await assert.rejects(applyOfficialCode({ ...base, id: 'c2', knownIds: ['c1', 'c2'] }));
  assert.equal(state.records.get('codeSnippets/c1').applied, true); assert.equal(state.records.get('codeSnippets/c2').applied, false);
  await applyOfficialCode({ ...base, id: 'c2', knownIds: ['c1', 'c2'] });
  assert.equal(state.records.get('codeSnippets/c1').applied, false); assert.equal(state.records.get('codeSnippets/c2').applied, true);
  state.records.set('codeSnippets/c3', { seasonId: 'current', applied: false });
  await Promise.all([applyOfficialCode({ ...base, id: 'c1', knownIds: ['c1'] }), applyOfficialCode({ ...base, id: 'c3', knownIds: ['c3'] })]);
  const applied = ['c1', 'c2', 'c3'].filter((id) => state.records.get(`codeSnippets/${id}`).applied);
  assert.equal(applied.length, 1, 'season pointer serializes choices made with different cached lists');
  assert.equal(state.records.get('settings/workspace_season').officialCodeId, applied[0]);
  await saveSchoolGrades({ ...base, stageId: 'etapa1', grades: { Matematica: 10, Portugues: 9 }, expectedGrades: { Matematica: 10 } });
  await saveSchoolGrades({ ...base, stageId: 'etapa1', grades: { Matematica: 10, Portugues: 9 }, expectedGrades: { Portugues: 9, Matematica: 10 } });
  const evaluation = { studentId: 'a', type: 'weekly', seasonId: 'current', updatedAt: 'first', ratings: { test: 5 } };
  const savedEvaluation = await saveEvaluation({ ...base, id: 'e1', evaluation });
  const updates = await Promise.allSettled([
    saveEvaluation({ ...base, id: 'e1', evaluation: { ...evaluation, ratings: { test: 3 } }, expected: savedEvaluation }),
    saveEvaluation({ ...base, id: 'e1', evaluation: { ...evaluation, ratings: { test: 4 } }, expected: savedEvaluation }),
  ]);
  assert.equal(updates.filter((result) => result.status === 'fulfilled').length, 1, 'stale evaluation never overwrites another save');
  state.records.set('score_history/current', { seasonId: 'current', score: 200 });
  state.records.set('score_history/old', { seasonId: 'archived', score: 300 });
  state.records.set('score_history/legacy', { score: 100 });
  await assert.rejects(clearTrainingHistory({ ...base, user: { type: 'student' }, ids: ['current'] }), /técnico/);
  state.interrupt();
  await assert.rejects(clearTrainingHistory({ ...base, ids: ['current', 'old', 'legacy'] }), /connection failure/);
  assert.ok(state.records.has('score_history/current'));
  await clearTrainingHistory({ ...base, ids: ['current', 'old', 'legacy'] });
  assert.ok(state.records.has('score_history/old'), 'clearing training never removes an explicitly archived season');
  assert.equal(state.records.has('score_history/current'), false);
  assert.equal(state.records.has('score_history/legacy'), false);
  state.records.get('settings/workspace_season').transitionLock = { id: 'closing' };
  await assert.rejects(saveEvaluation({ ...base, id: 'e2', evaluation }), /encerrada/);
  assert.throws(() => validateInlineFile({ type: 'image/svg+xml', size: 100 }), /foto/);
  assert.throws(() => validateInlineFile({ type: 'image/jpeg', size: 11 * 1024 * 1024 }), /10 MB/);
  assert.throws(() => validateInlineFile({ type: 'application/pdf', size: 600 * 1024 }, { allowPdf: true }), /500 KB/);
  assert.equal(validateInlineFile({ type: 'image/png', size: 1000 }), 'image');
  const plan = planAuthMigration({ students: [{ id: 'a', name: 'Test', password: 'private' }] });
  assert.equal(plan.entries[0].action, 'confirm-email');
  assert.equal(plan.readyToActivate, false);
  assert.equal(JSON.stringify(plan).includes('private'), false);
  assert.throws(() => planAuthMigration({ students: [{ id: 'a', email: 'same@example.com' }, { id: 'b', email: 'same@example.com' }] }), /endereços/);
  const linked = planAuthMigration({ students: [{ id: 'a', email: 'student@example.com' }], accounts: [{ studentId: 'a', uid: 'auth-a' }] });
  assert.equal(linked.entries[0].member.data.role, 'student');
  assert.equal(linked.entries[0].member.path, 'weeklyReportMembers/auth-a');
  const levels = [{ min: 0, max: 999, name: 'first' }, { min: 1000, max: 5000, name: 'last' }];
  assert.equal(studentLevel(-5, levels).name, 'first'); assert.equal(studentLevel(6000, levels).name, 'last');
  assert.deepEqual(studentAttendanceStats({ totalClasses: 0, attendedClasses: 0 }), { percent: 0, absences: 0 });
}
