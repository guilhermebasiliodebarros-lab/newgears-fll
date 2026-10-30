import assert from 'node:assert/strict';
import { briefingEvents, briefingTasks } from '../src/utils/workspaceBriefing.js';

export function runWorkspaceBriefingTests() {
  const student = { id: 'a', name: 'Ana' };
  const students = [student, { id: 'b', name: 'Ana' }];
  const tasks = [
    { id: 'other', participants: [{ id: 'b', name: 'Ana' }], status: 'todo' },
    { id: 'later', participants: [{ id: 'a', name: 'Ana' }], status: 'doing', dueDate: '2026-11-04' },
    { id: 'overdue', participants: [{ id: 'a', name: 'Ana' }], status: 'todo', dueDate: '2026-10-20' },
    { id: 'done', participants: [{ id: 'a', name: 'Ana' }], status: 'done' },
    { id: 'legacy', author: 'Ana', status: 'review' },
  ];
  const original = structuredClone(tasks);
  const options = { student, students, today: '2026-10-30' };
  assert.deepEqual(briefingTasks(tasks, options).map((task) => task.id), ['overdue', 'later', 'legacy']);
  assert.equal(briefingTasks(tasks, { ...options, technical: true }).some((task) => task.id === 'other'), true);
  assert.deepEqual(briefingTasks(tasks, { today: options.today }), [], 'missing identity never shows other students as personal assignments');
  assert.deepEqual(tasks, original, 'sorting does not mutate the original collection');
  const events = [
    { id: 'cancelled', date: '2026-10-30', status: 'cancelado' },
    { id: 'past', date: '2026-10-29' },
    { id: 'tomorrow', date: '2026-10-31', time: '08:00' },
    { id: 'afternoon', date: '2026-10-30', time: '14:00' },
    { id: 'morning', date: '2026-10-30', time: '08:00' },
    { id: 'invalid', date: 'invalid' },
  ];
  assert.deepEqual(briefingEvents(events, '2026-10-30').map((event) => event.id), ['morning', 'afternoon', 'tomorrow']);
}
