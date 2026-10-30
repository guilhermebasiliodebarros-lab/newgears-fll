import assert from 'node:assert/strict';
import { giroLocalAdvice, giroPersonalTasks, giroProgressReaction, giroProgressSnapshot } from '../src/utils/giroCompanion.js';
import { giroExpression } from '../src/utils/gearWorkshop.js';

export function runGiroCompanionTests() {
  const student = { id: 'a', name: 'Ana', xp: 100, badges: [] };
  const tasks = [{ id: 'mine', status: 'doing', participants: [{ id: 'a', name: 'Ana' }] }, { id: 'other', status: 'todo', participants: [{ id: 'b', name: 'Ana' }] }];
  const context = { student, technical: false, tasks, today: '2026-10-30' };
  const initial = giroProgressSnapshot(context);
  assert.deepEqual(giroPersonalTasks(tasks, student).map((task) => task.id), ['mine'], 'same names do not cross student IDs');
  assert.deepEqual(giroPersonalTasks(tasks, null), []);
  assert.equal(giroPersonalTasks(tasks, null, true).length, 2);
  assert.equal(giroProgressReaction(null, initial), null, 'loading the page never earns a reaction');
  assert.equal(giroProgressReaction(initial, initial), null);
  assert.equal(giroProgressReaction(initial, giroProgressSnapshot({ ...context, student: { ...student, xp: 90 } })), null, 'XP loss is not celebrated');
  const added = giroProgressSnapshot({ ...context, tasks: [...tasks, { id: 'old', status: 'done', author: 'Ana' }] });
  assert.equal(giroProgressReaction(initial, added), null, 'loading an old completed task is not a new completion');
  assert.equal(giroProgressReaction(initial, giroProgressSnapshot({ ...context, tasks: [...tasks, { id: 'constructor', status: 'done', author: 'Ana' }] })), null, 'record IDs cannot be mistaken for inherited object properties');
  assert.equal(giroProgressReaction(initial, giroProgressSnapshot({ ...context, student: { ...student, id: 'b', xp: 500 } })), null, 'changing identity resets the baseline');
  const earned = giroProgressSnapshot({ ...context, student: { ...student, xp: 125 } });
  assert.equal(giroProgressReaction(initial, earned).xp, 25);
  const finished = giroProgressSnapshot({ ...context, tasks: tasks.map((task) => ({ ...task, status: 'done' })) });
  const completion = giroProgressReaction(initial, finished);
  assert.equal(completion.kind, 'task');
  assert.match(completion.message, /Uma tarefa/);
  const badge = giroProgressSnapshot({ ...context, student: { ...student, badges: ['badge', 'badge'], xp: 125 } });
  assert.equal(giroProgressReaction(initial, badge).kind, 'achievement');
  assert.match(giroProgressReaction(initial, badge).message, /Uma conquista/);
  assert.equal(giroProgressReaction(initial, badge).xp, 25, 'one reaction includes simultaneous achievements and XP');
  const absent = giroProgressSnapshot({ student: { id: 'a' }, tasks });
  assert.equal(giroProgressReaction(absent, initial), null, 'previously absent XP and badges do not look like rewards');
  assert.equal(giroExpression('thinking'), 'thinking');
  assert.equal(giroExpression('excited'), 'excited');
  assert.equal(giroExpression('thinking', 'happy'), 'happy', 'saved workshop preferences are preserved');

  const pageIds = new Set(['kanban', 'agenda', 'weekly_reports', 'logbook', 'strategy', 'rounds', 'rubrics', 'evaluations', 'feedback']);
  for (const page of ['overview', 'kanban', 'agenda', 'weekly_reports', 'logbook', 'strategy', 'rounds', 'rubrics', 'evaluations', 'feedback', 'sprint', 'unknown']) {
    for (const technical of [true, false]) {
      const tip = giroLocalAdvice({ ...context, page, technical, readiness: 60 }, 1);
      assert.ok(tip.title && tip.message && tip.question);
      assert.ok(pageIds.has(tip.action.page));
      assert.doesNotMatch(JSON.stringify(tip), /undefined|NaN|password/);
    }
  }
  const privateTask = [{ id: 'secret', status: 'todo', text: 'PRIVATE-OTHER-STUDENT', participants: [{ id: 'b', name: 'Ana' }] }];
  assert.match(giroLocalAdvice({ ...context, page: 'kanban', tasks: privateTask }).message, /Nenhuma tarefa/);
  assert.doesNotMatch(JSON.stringify(giroLocalAdvice({ ...context, tasks: privateTask })), /PRIVATE-OTHER-STUDENT/);
  const events = [{ id: 'old', title: 'OLD', date: '2026-10-29' }, { id: 'cancelled', title: 'CANCELLED', date: '2026-10-30', status: 'cancelado' }, { id: 'next', title: 'Treino', date: '2026-10-31' }];
  assert.match(giroLocalAdvice({ ...context, page: 'agenda', events }).message, /Treino/);
  assert.doesNotMatch(giroLocalAdvice({ ...context, page: 'agenda', events }).message, /OLD|CANCELLED/);
  assert.notEqual(giroLocalAdvice({ ...context, page: 'kanban' }, 0).id, giroLocalAdvice({ ...context, page: 'kanban' }, 1).id);
  assert.ok(giroLocalAdvice({ ...context, page: 'overview' }, -1).id);
  const before = structuredClone({ student, tasks, events });
  giroLocalAdvice({ ...context, events }); giroProgressSnapshot(context);
  assert.deepEqual({ student, tasks, events }, before, 'the mascot never mutates student or team records');
}
