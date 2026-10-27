import assert from 'node:assert/strict';
import { buildEvaluationCalendar, getWeeklyEvaluationHistory, getFinalSprintEvaluationWeek, getFinalSprintEvaluationWeekForDate, getStudentTournamentSelection, WEEKLY_EVALUATION_CRITERIA } from '../src/utils/finalSprintEvaluations.js';
import { publishTournamentSelection, saveTournamentCandidate, tournamentSelectionError } from '../src/services/tournamentSelection.js';
import { memoryStore } from './teamProcesses.test.js';

export async function runFinalSprintEvaluationsTests() {
  const today = new Date(2026, 9, 26, 12);
  assert.equal(getFinalSprintEvaluationWeek(0, today).id, '2026-10-26');
  const previous = getFinalSprintEvaluationWeekForDate('2026-10-23', today);
  assert.equal(previous.id, '2026-10-19', 'A date in the previous week must save against that Monday');
  assert.equal(previous.endDate, '2026-10-23');
  assert.equal(previous.isCurrent, false);
  assert.equal(getFinalSprintEvaluationWeekForDate('2026-10-25', today).id, previous.id, 'Sunday still belongs to the previous week');
  assert.equal(getFinalSprintEvaluationWeekForDate('2026-10-30', today).isCurrent, true);
  assert.equal(getFinalSprintEvaluationWeekForDate('2025-12-31', today).id, '2025-12-29', 'Weeks older than twelve weeks remain available');
  assert.equal(getFinalSprintEvaluationWeekForDate('2027-01-01', today).id, '2026-12-28');
  assert.equal(getFinalSprintEvaluationWeekForDate('2024-02-29', today).id, '2024-02-26');
  for (const invalid of ['', undefined, '2026-02-30', '2026-13-01', '23/10/2026']) {
    assert.equal(getFinalSprintEvaluationWeekForDate(invalid, today), null);
  }

  const selected = { studentId: 'a', seasonId: 'current', selectedForTournament: true };
  const selections = [{ studentId: 'a', seasonId: 'old', selectedForTournament: true }, selected, { studentId: 'b', seasonId: 'current', selectedForTournament: false }];
  const context = { user: { type: 'student', studentId: 'a' }, studentId: 'a', selections, seasonId: 'current' };
  assert.equal(getStudentTournamentSelection(context), selected);
  assert.equal(getStudentTournamentSelection({ ...context, studentId: 'b' }), null, 'Previewing another student must not show their invitation');
  assert.equal(getStudentTournamentSelection({ ...context, user: { type: 'admin', studentId: 'a' } }), null);
  assert.equal(getStudentTournamentSelection({ ...context, seasonId: 'next' }), null, 'Old seasons must not trigger an invitation');
  assert.equal(getStudentTournamentSelection({ ...context, user: null }), null);
  assert.equal(getStudentTournamentSelection({ ...context, user: { type: 'student', studentId: 'b' }, studentId: 'b' }), null, 'Unselected students must not be notified');
  assert.equal(getStudentTournamentSelection({ ...context, selections: [{ ...selected, selectedForTournament: false }] }), null, 'Removing a selection removes the invitation');
  assert.equal(getStudentTournamentSelection({ ...context, user: { type: 'student', data: { id: 'a' } } }), selected, 'Legacy login snapshots remain supported');

  const ratings = (score) => Object.fromEntries(WEEKLY_EVALUATION_CRITERIA.map(({ id }) => [id, score]));
  const evaluation = (studentId, weekId, score, extra = {}) => ({ studentId, weekId, type: 'weekly', status: 'complete', ratings: ratings(score), ...extra });
  const evaluations = [evaluation('a', '2026-10-05', 1), evaluation('a', '2026-10-19', 3, { updatedAt: '2026-10-23' }), evaluation('a', '2026-10-19', 2, { updatedAt: '2026-10-22' }), evaluation('b', '2026-10-19', 5), evaluation('a', '2026-10-26', 4, { status: 'draft' }), evaluation('a', '2026-10-12', 8), evaluation('a', '2026-02-30', 1)];
  const history = getWeeklyEvaluationHistory(evaluations, 'a');
  assert.deepEqual(history.map((item) => [item.weekId, item.total]), [['2026-10-05', 5], ['2026-10-19', 15]], 'Charts exclude incomplete or invalid grades, other students and duplicate weeks');
  assert.equal(getWeeklyEvaluationHistory([evaluation('a', '2026-10-19', 0)], 'a')[0].total, 0, 'A real zero remains a grade');
  const calendar = buildEvaluationCalendar({ students: [{ id: 'a', name: 'Ana' }, { id: 'b', name: 'Bruno', joinedAt: '2026-10-12' }, { id: 'c', status: 'inactive' }], evaluations, startDate: '2026-10-05', pauseWeeks: ['2026-10-12'], referenceDate: today });
  assert.deepEqual(calendar.map((item) => item.id), ['2026-10-26', '2026-10-19', '2026-10-12', '2026-10-05']);
  assert.equal(calendar[0].pending.length, 2, 'Drafts do not count as completed evaluations');
  assert.equal(calendar[1].status, 'complete');
  assert.equal(calendar[2].status, 'paused');
  assert.equal(calendar[2].pending.length, 0);
  assert.equal(calendar[3].total, 1, 'Do not expect evaluations before a student joined');

  const officialRef = 'finalSprintSelectionScores/old-a';
  const memory = memoryStore({ 'settings/workspace_season': { activeSeasonId: 'current' }, 'students/a': { name: 'Ana', status: 'active' }, 'students/b': { name: 'Bruno', status: 'active' }, [officialRef]: { ...selected, studentName: 'Ana', reportScore: 9, selectedAt: 'before' } });
  const tournament = { db: {}, seasonId: 'current', store: memory.store, actor: 'Coach', selections: [{ ...memory.records.get(officialRef), id: 'old-a' }] };
  let draft = await saveTournamentCandidate({ ...tournament, studentId: 'b', selected: true });
  assert.deepEqual(draft.studentIds, ['a', 'b']);
  assert.equal(memory.records.has('finalSprintSelectionScores/current__selection__b__'), false, 'Preparing a list must not publish a student notice');
  draft = await saveTournamentCandidate({ ...tournament, studentId: 'a', selected: false, expectedRevision: draft.revision });
  assert.equal(memory.records.get(officialRef).selectedForTournament, true, 'The current official invitation survives changes to the private draft');
  await assert.rejects(publishTournamentSelection({ ...tournament, expectedRevision: draft.revision - 1, expectedStudentIds: ['b'] }), /mudou/);
  await assert.rejects(publishTournamentSelection({ ...tournament, expectedRevision: draft.revision, expectedStudentIds: ['a'] }), /mudou/);
  const published = await publishTournamentSelection({ ...tournament, expectedRevision: draft.revision, expectedStudentIds: ['b'] });
  assert.deepEqual(published.publishedStudentIds, ['b']);
  assert.equal(memory.records.get(officialRef).selectedForTournament, false);
  assert.equal(memory.records.get(officialRef).reportScore, 9, 'Publishing must preserve existing report grades');
  const bRef = 'finalSprintSelectionScores/current__selection__b__';
  assert.equal(memory.records.get(bRef).selectedForTournament, true);
  assert.equal(memory.records.get(bRef).publishedAt, memory.records.get(officialRef).publishedAt, 'All official participants change in the same publication');
  const beforeFailure = structuredClone([...memory.records]);
  const interrupted = { ...memory.store, runTransaction: (_db, action) => memory.store.runTransaction(_db, async (transaction) => { await action(transaction); throw new Error('Connection interrupted'); }) };
  await assert.rejects(publishTournamentSelection({ ...tournament, store: interrupted, expectedRevision: published.revision, expectedStudentIds: ['b'] }), /interrupted/);
  assert.deepEqual([...memory.records], beforeFailure, 'An interrupted publication must not leave a partial official roster');
  memory.records.get('students/b').status = 'inactive';
  await assert.rejects(publishTournamentSelection({ ...tournament, expectedRevision: published.revision, expectedStudentIds: ['b'] }), /inativo/);
  memory.records.get('students/b').status = 'active';
  const emptyDraft = await saveTournamentCandidate({ ...tournament, expectedRevision: published.revision, studentId: 'b', selected: false });
  const withdrawn = await publishTournamentSelection({ ...tournament, expectedRevision: emptyDraft.revision, expectedStudentIds: [] });
  assert.deepEqual(withdrawn.publishedStudentIds, []);
  assert.equal(memory.records.get(bRef).selectedForTournament, false, 'Confirming an empty roster can withdraw all official invitations');
  memory.records.get('settings/workspace_season').transitionLock = { started: true };
  await assert.rejects(saveTournamentCandidate({ ...tournament, expectedRevision: withdrawn.revision, studentId: 'a', selected: true }), /encerrada/);

  const six = memoryStore({ 'settings/workspace_season': { activeSeasonId: 'current' }, 'students/seventh': { status: 'active' }, 'finalSprintTournamentDrafts/current': { revision: 1, studentIds: ['1', '2', '3', '4', '5', '6'] } });
  await assert.rejects(saveTournamentCandidate({ ...tournament, store: six.store, expectedRevision: 1, studentId: 'seventh', selected: true }), /seis/);

  const knownDraft = { seasonId: 'current', studentIds: ['a'], publishedStudentIds: ['a'], revision: 2 };
  const quota = memoryStore({
    'finalSprintTournamentDrafts/current': knownDraft,
    'finalSprintSelectionScores/test-a': { seasonId: 'current', studentId: 'a', selectedForTournament: true, reportScore: 9 },
  });
  const noReads = { ...quota.store, runTransaction: async () => { throw new Error('Quota exceeded.'); } };
  const removing = { db: {}, seasonId: 'current', actor: 'Coach', store: noReads, selections: [{ id: 'test-a', seasonId: 'current', studentId: 'a', selectedForTournament: true }] };
  // Another coach adds B after this browser received the draft. Removing A must preserve B.
  quota.records.get('finalSprintTournamentDrafts/current').studentIds.push('b');
  quota.records.get('finalSprintTournamentDrafts/current').revision = 3;
  const removed = await saveTournamentCandidate({ ...removing, knownDraft: structuredClone(knownDraft), studentId: 'a', selected: false });
  assert.deepEqual(quota.records.get('finalSprintTournamentDrafts/current').studentIds, ['b'], 'Atomic removal preserves candidates concurrently added by another coach');
  assert.equal(quota.records.get('finalSprintTournamentDrafts/current').revision, 4);
  assert.equal(quota.records.get('finalSprintSelectionScores/test-a').selectedForTournament, true, 'Removing a draft still requires confirming the official withdrawal');
  const emptyKnownDraft = { ...removed, studentIds: [], publishedStudentIds: ['a'] };
  quota.failNextBatch();
  await assert.rejects(publishTournamentSelection({ ...removing, knownDraft: emptyKnownDraft, expectedStudentIds: [] }), /interrupted/);
  assert.equal(quota.records.get('finalSprintSelectionScores/test-a').selectedForTournament, true, 'A rejected withdrawal must not claim or partially save success');
  await publishTournamentSelection({ ...removing, knownDraft: emptyKnownDraft, expectedStudentIds: [] });
  assert.equal(quota.records.get('finalSprintSelectionScores/test-a').selectedForTournament, false, 'The last test invitation can be withdrawn even when reads are exhausted');
  assert.equal(quota.records.get('finalSprintSelectionScores/test-a').reportScore, 9);
  assert.deepEqual(quota.records.get('finalSprintTournamentDrafts/current').studentIds, ['b'], 'Withdrawing the known invitation must not erase another coach’s new draft');
  assert.match(tournamentSelectionError({ code: 'resource-exhausted', message: 'Quota exceeded.' }), /limite de uso/);
  assert.match(tournamentSelectionError({ code: 'permission-denied' }), /permissão/);
}
