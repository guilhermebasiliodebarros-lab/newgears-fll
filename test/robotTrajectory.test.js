import assert from 'node:assert/strict';
import { importTrajectory, newTrajectory, normalizeHeading, trajectoryCommands, trajectoryDocument, trajectoryOutside, trajectoryPose, trajectoryTimeline, validateTrajectory } from '../src/utils/robotTrajectory.js';
import { canEditTrajectory, deleteTrajectory, saveTrajectory, subscribeTrajectories } from '../src/services/robotTrajectories.js';
import { memoryStore } from './teamProcesses.test.js';
import { SEASON_COLLECTIONS } from '../src/utils/teamProcesses.js';

export async function runRobotTrajectoryTests() {
  const plan = { ...newTrajectory(), title: 'Coleta e retorno', points: [{ id: 'p1', x: 20, y: 20, action: 'open', note: '' }, { id: 'p2', x: 80, y: 20, action: 'close', note: 'Coletar' }, { id: 'p3', x: 80, y: 80, action: 'raise', note: '' }, { id: 'p4', x: 20, y: 80, action: 'lower', note: '' }] };
  assert.deepEqual(importTrajectory(trajectoryDocument(plan)), plan);
  assert.ok(SEASON_COLLECTIONS.includes('robotTrajectories'), 'Plans are included in season archives and backups');
  assert.deepEqual(validateTrajectory(newTrajectory(), { allowEmpty: true }), newTrajectory());
  for (const changes of [{ title: '' }, { title: 'a'.repeat(101) }, { notes: 'a'.repeat(2001) }, { roundId: '../other' }, { points: [] }, { points: Array(81).fill(plan.points[0]) }, { points: [plan.points[0], plan.points[0]] }, { points: [{ ...plan.points[0], x: -1 }, plan.points[1]] }, { points: [{ ...plan.points[0], y: 121 }, plan.points[1]] }, { points: [{ ...plan.points[0], x: NaN }, plan.points[1]] }, { points: [{ ...plan.points[0], action: 'execute' }, plan.points[1]] }, { settings: { ...plan.settings, width: 0 } }, { settings: { ...plan.settings, height: Infinity } }, { settings: { ...plan.settings, heading: 181 } }, { settings: { ...plan.settings, map: 'https://external' } }]) assert.throws(() => validateTrajectory({ ...plan, ...changes }));
  for (const invalid of ['not json', JSON.stringify({ format: 'other', version: 1, plan }), 'a'.repeat(100001)]) assert.throws(() => importTrajectory(invalid));
  const commands = trajectoryCommands(plan);
  assert.deepEqual(commands.map((command) => command.type), ['gripper', 'move', 'gripper', 'turn', 'move', 'gripper', 'turn', 'move', 'gripper']);
  assert.equal(commands.filter((command) => command.type === 'move').reduce((sum, command) => sum + command.distance, 0), 180);
  assert.equal(commands[3].angle, 90); assert.equal(commands[6].angle, 90);
  assert.match(commands[3].label, /esquerda/);
  assert.equal(normalizeHeading(-350), 10); assert.equal(normalizeHeading(350), -10);
  const rightTurn = trajectoryCommands({ ...plan, points: [plan.points[2], plan.points[1]], settings: { ...plan.settings, heading: 0 } });
  assert.equal(rightTurn.find((command) => command.type === 'turn').angle, -90);
  assert.match(rightTurn.find((command) => command.type === 'turn').label, /direita/);
  const samePosition = trajectoryCommands({ ...plan, points: [plan.points[0], { ...plan.points[0], id: 'duplicate-position', action: 'close' }] });
  assert.deepEqual(samePosition.map((command) => command.type), ['gripper', 'gripper'], 'Zero-length segments still execute gripper actions without NaN headings');
  const timeline = trajectoryTimeline(plan);
  for (let index = 0; index < timeline.length; index++) { assert.ok(timeline[index].end > timeline[index].start); if (index) assert.equal(timeline[index].start, timeline[index - 1].end); }
  const move = timeline.find((command) => command.type === 'move');
  const halfway = trajectoryPose(plan, timeline, (move.start + move.end) / 2);
  assert.equal(halfway.x, 50); assert.equal(halfway.y, 20); assert.equal(halfway.action, 'open');
  const turn = timeline.find((command) => command.type === 'turn');
  assert.equal(trajectoryPose(plan, timeline, (turn.start + turn.end) / 2).heading, 45);
  const end = trajectoryPose(plan, timeline, timeline.at(-1).end);
  assert.equal(end.x, 20); assert.equal(end.y, 80); assert.equal(end.heading, 180); assert.equal(end.action, 'lower');
  assert.equal(trajectoryOutside(plan, halfway), false);
  assert.equal(trajectoryOutside(plan, { x: 3, y: 30, heading: 0 }), true);
  assert.equal(trajectoryOutside(plan, { x: 12, y: 12, heading: 45 }), true, 'Rotated footprint, not only robot center, must fit in the field');

  const memory = memoryStore({ 'settings/workspace_season': { activeSeasonId: 'current' }, 'rounds/r1': { name: 'Saída 1', seasonId: 'current' } });
  const user = { type: 'student', uid: 'ana', name: 'Ana' };
  const context = { db: {}, user, seasonId: 'current', id: 'route-1', plan: { ...plan, roundId: 'r1' }, store: memory.store };
  assert.equal(canEditTrajectory(user, { ownerId: 'ana' }), true); assert.equal(canEditTrajectory({ type: 'student', uid: 'other' }, { ownerId: 'ana' }), false);
  const first = await saveTrajectory(context);
  assert.equal(first.record.revision, 1); assert.equal(first.record.ownerId, 'ana');
  assert.equal((await saveTrajectory(context)).record.revision, 1, 'Lost-response retry does not duplicate a version');
  const updated = await saveTrajectory({ ...context, expectedRevision: 1, plan: { ...context.plan, notes: 'Calibrar sensor' } });
  assert.equal(updated.record.revision, 2); assert.equal(updated.record.createdAt, first.record.createdAt);
  await assert.rejects(saveTrajectory(context), /mudou/);
  await assert.rejects(saveTrajectory({ ...context, user: { type: 'student', uid: 'other' }, expectedRevision: 2 }), /Duplicar/);
  await assert.rejects(saveTrajectory({ ...context, user: null }), /Entre/);
  await assert.rejects(saveTrajectory({ ...context, seasonId: 'old', id: 'route-2' }), /temporada mudou/);
  await assert.rejects(saveTrajectory({ ...context, id: 'route-2', plan: { ...context.plan, roundId: 'removed' } }), /removida/);
  const original = structuredClone([...memory.records]);
  const failingStore = { ...memory.store, runTransaction: (_db, callback) => memory.store.runTransaction(_db, async (transaction) => { await callback(transaction); throw new Error('Interrupted'); }) };
  await assert.rejects(saveTrajectory({ ...context, id: 'failed-route', store: failingStore }), /Interrupted/);
  assert.deepEqual([...memory.records], original);
  const admin = { type: 'admin', uid: 'coach', name: 'Coach' };
  await saveTrajectory({ ...context, user: admin, expectedRevision: 2, plan: { ...plan, notes: 'Ajustado pelo técnico' } });
  assert.equal(memory.records.get('robotTrajectories/route-1').ownerId, 'ana', 'Technician editing preserves authorship');
  await assert.rejects(deleteTrajectory({ ...context, expectedRevision: 3, user: { type: 'student', uid: 'other' } }), /autor/);
  await assert.rejects(deleteTrajectory({ ...context, expectedRevision: 1 }), /mudou/);
  const deleting = { ...memory.store, runTransaction: async (_db, callback) => {
    let deleted;
    await memory.store.runTransaction(_db, (transaction) => callback({ ...transaction, delete: (ref) => { deleted = ref.path; } }));
    memory.records.delete(deleted);
  } };
  await deleteTrajectory({ ...context, expectedRevision: 3, store: deleting });
  assert.equal(memory.records.has('robotTrajectories/route-1'), false);
  memory.records.set('settings/workspace_season', { activeSeasonId: 'current', transitionLock: {} });
  await assert.rejects(saveTrajectory({ ...context, id: 'locked' }), /encerrada/);

  let listener; let constraint; let rows;
  subscribeTrajectories({ db: {}, seasonId: 'current', onData: (data) => { rows = data; }, store: { collection: () => null, where: (...args) => { constraint = args; }, query: () => null, onSnapshot: (_q, callback) => { listener = callback; return () => {}; } } });
  assert.deepEqual(constraint, ['seasonId', '==', 'current']);
  listener({ docs: [{ id: 'old', data: () => ({ seasonId: 'old', updatedAt: '9' }) }, { id: 'a', data: () => ({ seasonId: 'current', updatedAt: '1' }) }, { id: 'b', data: () => ({ seasonId: 'current', updatedAt: '2' }) }] });
  assert.deepEqual(rows.map((row) => row.id), ['b', 'a']);
}
