import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { buildEvaluationCalendar, formatEvaluationDate, getFinalSprintTournamentRanking, getFinalSprintEvaluationWeek, getWeeklyEvaluationHistory, normalizeEvaluationDraft, normalizeEvaluationRecords, parseEvaluationRating, WEEKLY_EVALUATION_CRITERIA } from '../src/utils/finalSprintEvaluations.js';
import { normalizeWorkspaceRecord } from '../src/utils/workspaceRecords.js';
import { sessionEntries } from '../src/utils/teamProcesses.js';

export async function runEvaluationReliabilityTests() {
  const ratings = Object.fromEntries(WEEKLY_EVALUATION_CRITERIA.map(({ id }) => [id, 4]));
  const old = { id: 'z-old', type: 'weekly', studentId: 'a', weekId: '2026-10-19', status: 'complete', ratings, total: 20, updatedAt: '2026-10-20T12:00:00Z' };
  const latest = { ...old, id: 'a-new', total: 25, ratings: Object.fromEntries(WEEKLY_EVALUATION_CRITERIA.map(({ id }) => [id, 5])), updatedAt: { seconds: 1793275200 } };
  const input = [latest, old];
  const before = structuredClone(input);
  const normalized = normalizeEvaluationRecords(input);
  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].id, latest.id, 'choose the latest update instead of the last document in the snapshot');
  assert.equal(getFinalSprintTournamentRanking({ students: [{ id: 'a' }], evaluations: input })[0].values.weekly, 25, 'duplicate copies must not count twice in ranking');
  assert.equal(getWeeklyEvaluationHistory(input, 'a')[0].total, 25);
  assert.deepEqual(input, before, 'reading and resolving duplicates must not rewrite historical grades');
  assert.equal(normalizeEvaluationRecords([{ ...old, weekId: '2026-10-20' }, latest]).length, 1, 'dates from the same week represent one evaluation');

  const invalid = normalizeEvaluationRecords([null, 'old', { type: 'other' }, { ...old, ratings: { commitment: {} }, total: {}, improvement: {}, strengths: [], updatedAt: {}, presentedAt: 'bad' }])[0];
  assert.equal(invalid.status, 'draft', 'an unusable grade must not mark an evaluation complete');
  assert.equal(invalid.total, null);
  assert.equal(invalid.improvement, '');
  assert.equal(invalid.updatedAt, '');
  assert.equal(invalid.ratings.commitment, null);
  const pending = buildEvaluationCalendar({ students: [{ id: 'a' }], evaluations: [invalid], startDate: old.weekId, referenceDate: new Date('2026-10-23T12:00:00') });
  assert.equal(pending[0].pending.length, 1);
  for (const value of [true, false, {}, [], '', ' ', -1, 6, NaN]) assert.equal(parseEvaluationRating(value), null);
  assert.equal(parseEvaluationRating('0'), 0);
  assert.equal(parseEvaluationRating(5), 5);
  assert.equal(formatEvaluationDate({ seconds: 1793275200 }), '29/10/2026');
  for (const value of ['bad', '2026-02-31', {}]) assert.equal(formatEvaluationDate(value), 'Data não registrada');
  assert.equal(normalizeEvaluationDraft('weekly', { improvement: {}, ratings: null }).improvement, '');
  assert.equal(normalizeEvaluationDraft('report', { score: '8,', note: 'Rascunho' }).score, '8,', 'keep unfinished input for the user to finish');
  assert.equal(normalizeEvaluationDraft('weekly', null), null);

  const students = Array.from({ length: 20 }, (_, index) => ({ id: String(index), name: `Aluno ${index}` }));
  const evaluations = Array.from({ length: 600 }, (_, index) => ({ ...old, id: String(index), studentId: String(index % 20), weekId: getFinalSprintEvaluationWeek(-Math.floor(index / 20), new Date('2026-10-29T12:00:00')).id }));
  const started = performance.now();
  const calendar = buildEvaluationCalendar({ students, evaluations, startDate: '2026-02-22', referenceDate: new Date('2026-10-29T12:00:00') });
  const elapsed = Math.round(performance.now() - started);
  assert.equal(calendar.length, 37);
  assert.equal(calendar.filter((week) => week.completeCount === 20).length, 30);
  assert.equal(calendar[0].pending.length, 0);
  console.log(`  calendário: 600 registros, ${calendar.length} semanas, ${elapsed} ms`);

  const rounds = [{ estimatedTime: '20', totalPoints: '30', missions: {} }, { estimatedTime: '30' }].map((item) => normalizeWorkspaceRecord('rounds', item));
  assert.equal(rounds.reduce((total, item) => total + item.estimatedTime, 0), 50, 'numeric strings must not concatenate in totals');
  assert.deepEqual(rounds[0].missions, []);
  assert.equal(normalizeWorkspaceRecord('logbook', { text: {}, tags: [null, '#robo'], date: { seconds: 1793275200 } }).text, '');
  assert.equal(normalizeWorkspaceRecord('prototypeIterations', { feedback: {} }).feedback, '');
  assert.equal(normalizeWorkspaceRecord('missions', {}).code, '');
  assert.deepEqual(sessionEntries({ entries: { a: { status: 'present', note: {} }, b: null, c: { status: 'unknown' } } }), { a: { status: 'present', note: '' } });
  assert.doesNotThrow(() => sessionEntries({ presentIds: {}, absentIds: null }));
}
