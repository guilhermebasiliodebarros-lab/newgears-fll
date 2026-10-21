import assert from 'node:assert/strict';
import { memoryStore } from './teamProcesses.test.js';
import { setTaskBlock, changeTaskStage } from '../src/services/taskWorkflow.js';
import { buildEvolution, localDateOf } from '../src/utils/evolution.js';
import { buildReminders, DEFAULT_REMINDERS, validateReminderSettings } from '../src/utils/reminders.js';
import { backupValue, createBackupArchive, crc32, makeZip } from '../src/utils/backup.js';

function unzipStored(bytes) {
  const files = new Map(); const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    const size = view.getUint32(offset + 18, true); const nameSize = view.getUint16(offset + 26, true); const extra = view.getUint16(offset + 28, true);
    const name = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameSize)); const start = offset + 30 + nameSize + extra;
    const content = bytes.subarray(start, start + size);
    assert.equal(crc32(content), view.getUint32(offset + 14, true), 'ZIP CRC must match each file');
    files.set(name, content); offset = start + size;
  }
  assert.equal(view.getUint32(offset, true), 0x02014b50); assert.equal(view.getUint32(bytes.length - 22, true), 0x06054b50);
  return files;
}

export async function runOperationsTests() {
  const store = memoryStore({ 'settings/workspace_season': { activeSeasonId: 's' }, 'students/a': { status: 'active', name: 'Ana' }, 'tasks/a': { status: 'doing', seasonId: 's', participants: [{ id: 'a', name: 'Ana' }] }, 'tasks/b': { status: 'todo', seasonId: 's' }, 'tasks/c': { status: 'doing', seasonId: 's', block: { dependencyId: 'a', updatedAt: 'old' } } });
  const context = { db: {}, store: store.store, seasonId: 's', actor: 'Ana', actorStudentId: 'a', expectedStatus: 'doing', id: 'a', expectedBlockAt: '' };
  await assert.rejects(setTaskBlock({ ...context, actorStudentId: 'stranger', actor: 'Stranger', blocked: true, reason: 'Need a missing part' }), /responsáveis/);
  await assert.rejects(setTaskBlock({ ...context, blocked: true, category: 'dependency', dependencyId: 'c', reason: 'Waiting for the next task' }), /ciclo/);
  await setTaskBlock({ ...context, blocked: true, category: 'dependency', dependencyId: 'b', reason: 'Waiting for the next task' });
  const blockedAt = store.records.get('tasks/a').block.updatedAt;
  await assert.rejects(changeTaskStage({ ...context, status: 'review', details: { evidence: 'The result is ready' } }), /impedimento/);
  await assert.rejects(setTaskBlock({ ...context, blocked: false, expectedBlockAt: blockedAt, resolution: 'Ready now' }), /Conclua/);
  assert.equal(store.records.get('tasks/a').block.resolvedAt, null);
  store.records.set('tasks/b', { status: 'done', seasonId: 's' });
  await setTaskBlock({ ...context, blocked: false, expectedBlockAt: blockedAt, resolution: 'Previous task completed' });
  assert.ok(store.records.get('tasks/a').block.resolvedAt);
  assert.equal(store.records.get('tasks/a').blockHistory.length, 2);

  const tasks = [{ id: 'a', text: 'Test sensors', status: 'done', dueDate: '2027-01-08', completedAt: '2027-01-09T01:00:00Z', history: [{ to: 'review', date: '2027-01-06' }, { from: 'review', to: 'doing', date: '2027-01-07' }] }, { id: 'b', status: 'done', dueDate: '2027-01-08', completedAt: '2027-01-10T12:00:00Z' }, { id: 'c', status: 'done', completedAt: '2027-01-08' }];
  const stats = buildEvolution({ tasks, sessions: [{ date: '2027-01-05', entries: { a: { status: 'late' }, b: { status: 'absent' }, c: { status: 'excused' } } }], start: '2027-01-04', end: '2027-01-10' });
  assert.equal(stats.current.completed, 3); assert.equal(stats.current.onTimeRate, 50); assert.equal(stats.current.withDeadline, 2);
  assert.equal(stats.current.reworkRate, 100); assert.equal(stats.current.attendanceRate, 50); assert.equal(stats.current.justified, 1);
  assert.equal(localDateOf('2027-01-09T01:00:00Z'), '2027-01-08');
  assert.equal(stats.previous.attendanceRate, null); assert.equal(stats.weeks.length, 1);
  assert.throws(() => buildEvolution({ start: '2027-02-30', end: '2027-03-04' }));

  const reminderInput = { today: '2027-01-08', students: [{ id: 'a', name: 'Ana' }, { id: 'b', name: 'Bia' }, { id: 'old', name: 'Former', status: 'inactive' }], tasks: [{ id: 'a', text: 'Own task', dueDate: '2027-01-08', participants: [{ id: 'a', name: 'Ana' }], status: 'doing' }, { id: 'b', text: 'Other task', dueDate: '2027-01-01', participants: [{ id: 'b', name: 'Bia' }], status: 'todo' }, { id: 'c', text: 'Need support', status: 'doing', participants: [{ id: 'b', name: 'Bia' }], block: { reason: 'Need a second opinion', helpFromId: 'a' } }], planning: { startDate: '2027-01-04', reportDueDay: 5 }, expectations: { '2027-01-04': { a: { reason: 'School activity' } } } };
  const studentNotices = buildReminders({ ...reminderInput, user: { role: 'student', name: 'Ana', studentId: 'a' } });
  assert.equal(studentNotices.length, 2); assert.ok(studentNotices.every((notice) => notice.id === 'task:a' || notice.id === 'block:c'));
  const sameName = buildReminders({ ...reminderInput, user: { role: 'student', name: 'Ana', studentId: 'other-id' }, config: { ...DEFAULT_REMINDERS, reports: false } });
  assert.equal(sameName.length, 0, 'A matching display name must not override an existing participant ID');
  const adminNotices = buildReminders({ ...reminderInput, user: { role: 'admin' } });
  assert.ok(adminNotices.some((notice) => notice.id === 'report:b:2027-01-04')); assert.ok(!adminNotices.some((notice) => notice.entityId === 'old'));
  const paused = buildReminders({ ...reminderInput, user: { role: 'admin' }, planning: { ...reminderInput.planning, pauseWeeks: ['2027-01-05'] } });
  assert.ok(!paused.some((notice) => notice.kind === 'report'));
  assert.throws(() => validateReminderSettings({ ...DEFAULT_REMINDERS, emailHour: 24 }));

  const value = backupValue({ name: 'Ana', password: 'never-export', nested: { accessToken: 'hidden', score: 42 }, stamp: { seconds: 100, nanoseconds: 50, toDate: () => new Date() } });
  assert.equal('password' in value, false); assert.deepEqual(value.nested, { score: 42 }); assert.equal(value.stamp.$type, 'timestamp');
  assert.throws(() => makeZip([{ name: '../unsafe', bytes: new Uint8Array() }]));
  const report = new TextEncoder().encode('%PDF-1.7\nReport');
  const archive = await createBackupArchive({ documents: [{ path: 'students/a', data: { name: 'Ana', password: 'never-export' } }], files: [{ name: 'relatorios/a/pesquisa.pdf', bytes: report }], scope: 's', startedAt: '2027-01-08T10:00:00Z', filesIncluded: true });
  const files = unzipStored(new Uint8Array(await archive.arrayBuffer()));
  assert.deepEqual(files.get('relatorios/a/pesquisa.pdf'), report);
  const data = JSON.parse(new TextDecoder().decode(files.get('dados.json'))); assert.equal(data.documents[0].data.name, 'Ana'); assert.equal('password' in data.documents[0].data, false);
  const manifest = JSON.parse(new TextDecoder().decode(files.get('manifesto.json'))); assert.equal(manifest.documentCount, 1); assert.equal(manifest.reportFilesIncluded, true); assert.equal(manifest.files.length, 2);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', report)); assert.equal(manifest.files[1].sha256, [...digest].map((byte) => byte.toString(16).padStart(2, '0')).join(''));
}
