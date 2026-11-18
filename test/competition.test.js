import assert from 'node:assert/strict';
import { competitionDraftKey, competitionReadiness, competitionReliability, competitionReport, competitionSchedule, competitionUrl, newCompetitionPlan, readCompetitionDraft, validateCompetitionPlan, validCompetitionDateTime } from '../src/utils/competition.js';
import { saveCompetitionWorkspace, subscribeCompetitionWorkspace } from '../src/services/competitionWorkspace.js';
import { countdownState } from '../src/utils/countdown.js';
import { SEASON_COLLECTIONS } from '../src/utils/teamProcesses.js';
import { memoryStore } from './teamProcesses.test.js';

export async function runCompetitionTests() {
  const plan = newCompetitionPlan();
  assert.equal(plan.event.matchSeconds, null, 'a future competition never inherits an assumed round length');
  assert.equal(plan.event.program, '');
  assert.deepEqual(validateCompetitionPlan(plan), plan);
  plan.pit[0].checked = true;
  assert.equal(newCompetitionPlan().pit[0].checked, false, 'season templates do not share mutable rows');
  plan.event.program = 'Desafio escolar de robótica 2027';
  plan.event.matchSeconds = 180;
  plan.criteria[0] = { ...plan.criteria[0], status: 'done', weight: 3, evidence: 'Robô validado em três testes consecutivos.' };
  assert.deepEqual(competitionReadiness(plan), { percentage: 50, complete: 1, total: 4, pitChecked: 1, pitTotal: 6 });
  assert.equal(competitionReadiness({ ...plan, criteria: [] }).percentage, null, 'an empty rubric does not claim 100% readiness');
  assert.throws(() => validateCompetitionPlan({ ...plan, criteria: [{ ...plan.criteria[0], evidence: '' }] }), /evidência/);
  assert.equal(competitionReadiness({ ...plan, criteria: [{ ...plan.criteria[0], evidence: '' }] }).percentage, 0, 'readiness also refuses a completed criterion without evidence');
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'https://user:password@example.com', '/relative']) {
    assert.equal(competitionUrl(url), '');
    assert.throws(() => validateCompetitionPlan({ ...plan, event: { ...plan.event, rulebookUrl: url } }));
  }
  assert.equal(competitionUrl('https://example.com/regulamento'), 'https://example.com/regulamento');
  assert.equal(validCompetitionDateTime('2027-02-30T08:00'), false);
  assert.equal(validCompetitionDateTime('2027-02-28T24:00'), false);
  assert.equal(validCompetitionDateTime('2027-02-28T08:00'), true);
  for (const change of [{ event: { ...plan.event, date: '2027-02-30' } }, { event: { ...plan.event, matchSeconds: -5 } }, { event: { ...plan.event, matchSeconds: '' } }, { pit: [plan.pit[0], plan.pit[0]] }, { criteria: [{ ...plan.criteria[0], weight: 0 }] }, { schedule: [{ id: 'slot', title: 'Round', type: 'round', at: 'invalid', owner: '', location: '' }] }]) assert.throws(() => validateCompetitionPlan({ ...plan, ...change }));

  const slots = [{ id: 'later', title: 'Segundo round', at: '2027-03-02T11:00' }, { id: 'past', title: 'Inspeção', at: '2027-03-02T08:00' }, { id: 'next', title: 'Apresentação', at: '2027-03-02T10:00' }];
  const copy = structuredClone(slots);
  const timetable = competitionSchedule(slots, new Date('2027-03-02T09:00').getTime());
  assert.equal(timetable.next.id, 'next');
  assert.deepEqual(timetable.sorted.map((item) => item.id), ['past', 'next', 'later']);
  assert.deepEqual(slots, copy, 'the team schedule is never sorted in place');
  assert.equal(competitionSchedule(slots, new Date('2027-03-03T09:00').getTime()).next, null);

  const runs = Array.from({ length: 12 }, (_, index) => ({ id: `${index}`, practiceType: 'full_round', score: index * 10, time: 150 + index, date: `2027-03-${String(index + 1).padStart(2, '0')}T10:00:00Z`, robotVersionId: index % 2 ? 'v2' : 'v1' }));
  const metrics = competitionReliability([...runs, { ...runs[0], id: 'exit', practiceType: 'exit_practice', score: 999 }, { ...runs[0], id: 'missing-time', time: '' }, { ...runs[0], id: 'invalid-date', date: '' }, { ...runs[0], id: 'partial', roundId: 'saida-1' }], 155);
  assert.equal(metrics.count, 10);
  assert.equal(metrics.median, 65);
  assert.equal(metrics.best, 110);
  assert.equal(metrics.within, 4);
  assert.equal(competitionReliability(runs).within, null);
  assert.equal(competitionReliability(runs, 180, 'v1').count, 6);
  assert.equal(competitionReliability([]).median, null);

  const now = new Date('2026-11-18T12:00').getTime();
  assert.equal(countdownState('', now).status, 'unset');
  assert.equal(countdownState('invalid', now).status, 'unset');
  assert.equal(countdownState('2027-02-30T08:00', now).status, 'unset');
  assert.equal(countdownState('2026-11-17T08:00', now).status, 'past');
  assert.equal(countdownState('2026-11-18T08:00', now).label, 'É hoje');
  assert.equal(countdownState('2026-11-19T12:00', now).units.dias, 1);

  const draft = { version: 1, baseRevision: 2, mutationId: 'mutation-1', plan };
  assert.deepEqual(readCompetitionDraft(JSON.stringify(draft)), draft);
  assert.equal(readCompetitionDraft('{invalid'), null);
  assert.equal(readCompetitionDraft(JSON.stringify({ ...draft, baseRevision: -1 })), null);
  assert.notEqual(competitionDraftKey('ana:2026'), competitionDraftKey('bob:2026'));
  assert.notEqual(competitionDraftKey('ana:2026'), competitionDraftKey('ana:2027'));
  assert.match(competitionReport(plan, { draft: true }), /RASCUNHO LOCAL/);
  assert.match(competitionReport(plan), /não representa nota oficial/);
  assert.match(competitionReport(plan), /CHECKLIST DO PIT/);
  assert.ok(SEASON_COLLECTIONS.includes('competitionWorkspaces'), 'the new workspace participates in season archives and backups');

  const memory = memoryStore({ 'settings/workspace_season': { activeSeasonId: 'current' } });
  const context = { db: {}, user: { type: 'admin', uid: 'coach' }, seasonId: 'current', plan, expectedRevision: 0, mutationId: 'save-1', store: memory.store };
  const first = await saveCompetitionWorkspace(context);
  assert.equal(first.revision, 1);
  assert.equal((await saveCompetitionWorkspace(context)).revision, 1, 'a lost-response retry is idempotent');
  memory.records.set('competitionWorkspaces/current', { ...first, plan: Object.fromEntries(Object.entries(first.plan).reverse()) });
  assert.equal((await saveCompetitionWorkspace(context)).revision, 1, 'Firestore map key ordering does not break an idempotent retry');
  const second = await saveCompetitionWorkspace({ ...context, plan: { ...plan, event: { ...plan.event, name: 'Torneio de robótica da escola' } }, expectedRevision: 1, mutationId: 'save-2' });
  assert.equal(second.revision, 2);
  assert.equal(second.createdAt, first.createdAt);
  const saved = structuredClone([...memory.records]);
  await assert.rejects(saveCompetitionWorkspace({ ...context, mutationId: 'stale' }), /mudou/);
  await assert.rejects(saveCompetitionWorkspace({ ...context, user: { type: 'student', uid: 'student' }, expectedRevision: 2 }), /Somente o técnico/);
  await assert.rejects(saveCompetitionWorkspace({ ...context, seasonId: 'archived' }), /temporada mudou/);
  assert.deepEqual([...memory.records], saved, 'conflicts, another season and student writes cannot partially overwrite the plan');
  memory.records.set('settings/workspace_season', { activeSeasonId: 'current', transitionLock: { startedAt: 'now' } });
  await assert.rejects(saveCompetitionWorkspace({ ...context, expectedRevision: 2, mutationId: 'locked' }), /encerrada/);

  let result; let failure; let unsubscribed = false;
  const subscribeStore = { ...memory.store, onSnapshot: (_ref, deliver) => { deliver({ exists: () => true, data: () => ({ ...second, seasonId: 'other' }) }); return () => { unsubscribed = true; }; } };
  const unsubscribe = subscribeCompetitionWorkspace({ db: {}, seasonId: 'current', store: subscribeStore, onData: (record) => { result = record; }, onError: (error) => { failure = error; } });
  assert.equal(result, undefined, 'a mismatched subscription never displays another season');
  assert.match(failure.message, /outra temporada/);
  unsubscribe(); assert.equal(unsubscribed, true);
}
