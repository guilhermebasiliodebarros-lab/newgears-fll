import assert from 'node:assert/strict';
import { formatTrainingTime, readTrainingWorkspace, reduceTrainingWorkspace, remainingTrainingSeconds, trainingReport, trainingStorageKey } from '../src/utils/trainingSession.js';

export function runTrainingSessionTests() {
  const start = new Date('2026-11-18T13:00:00Z').getTime();
  let workspace = readTrainingWorkspace(null, start);
  const act = (type, fields = {}, now = start) => { workspace = reduceTrainingWorkspace(workspace, { type, ...fields, now }); return workspace; };
  act('start');
  assert.equal(workspace.session.status, 'ready', 'a session needs an explicit objective');
  act('goal', { value: 'Conseguir três saídas consistentes.' });
  act('check', { index: 0 });
  act('start');
  assert.equal(remainingTrainingSeconds(workspace.session, start + 12500), 1488, 'time uses a deadline, including time spent away from the screen');
  const running = structuredClone(workspace);
  assert.equal(readTrainingWorkspace(JSON.stringify(running), start + 600000).session.status, 'running');
  assert.equal(remainingTrainingSeconds(readTrainingWorkspace(JSON.stringify(running), start + 600000).session, start + 600000), 900, 'reloading does not restart the timer');
  assert.equal(readTrainingWorkspace(JSON.stringify(running), start + 2000000).session.status, 'reflection', 'an expired timer recovers into the learning step');

  act('pause', {}, start + 60000);
  assert.equal(workspace.session.remainingSeconds, 1440);
  assert.equal(remainingTrainingSeconds(workspace.session, start + 900000), 1440, 'a pause does not count as focus time');
  const paused = structuredClone(workspace);
  act('track', { id: 'innovation' });
  act('duration', { minutes: 60 });
  act('new');
  assert.deepEqual(workspace, paused, 'an in-progress session cannot be accidentally overwritten');
  act('start', {}, start + 900000);
  assert.equal(remainingTrainingSeconds(workspace.session, start + 930000), 1410);
  act('notes', { value: 'O sensor funcionou em três tentativas. Próximo passo: testar outra luz.' });
  act('check', { index: 1 });
  act('finish', {}, start + 930000);
  assert.equal(workspace.session.status, 'completed');
  assert.equal(workspace.history[0].durationSeconds - workspace.history[0].remainingSeconds, 90, 'recorded focus excludes the pause');
  act('finish', {}, start + 931000);
  assert.equal(workspace.history.length, 1, 'double completion does not duplicate the record');
  assert.match(trainingReport(workspace.history), /01:30 \/ 25:00 planejados/);
  assert.match(trainingReport(workspace.history), /Próximo passo: testar outra luz/);
  act('new', {}, start + 940000);
  act('track', { id: 'presentation' }, start + 940000);
  assert.equal(workspace.session.durationSeconds, 600);
  assert.equal(workspace.session.goal, '');
  assert.equal(workspace.history.length, 1);
  act('duration', { minutes: 15 });
  assert.equal(workspace.session.remainingSeconds, 900);
  act('duration', { minutes: -10 });
  assert.equal(workspace.session.remainingSeconds, 900);

  assert.notEqual(trainingStorageKey('student:ana:2026'), trainingStorageKey('student:ana:2027'), 'seasons have independent workspaces');
  assert.notEqual(trainingStorageKey('student:ana:2026'), trainingStorageKey('student:bob:2026'), 'profiles have independent workspaces');
  assert.equal(readTrainingWorkspace('{broken', start).session.status, 'ready');
  assert.equal(readTrainingWorkspace('{"version":99}', start).history.length, 0);
  const corrupted = { ...running, session: { ...running.session, checked: [-1, 0, 0, 50, '1'], durationSeconds: -1, goal: 'x'.repeat(900), notes: 'x'.repeat(3000), deadline: null }, history: [null, { status: 'completed' }] };
  const recovered = readTrainingWorkspace(JSON.stringify(corrupted), start);
  assert.equal(recovered.session.status, 'paused');
  assert.equal(recovered.session.durationSeconds, 1500);
  assert.equal(recovered.session.goal.length, 180);
  assert.equal(recovered.session.notes.length, 2000);
  assert.deepEqual(recovered.session.checked, [0]);
  assert.equal(recovered.history.length, 0);
  const expired = reduceTrainingWorkspace(running, { type: 'tick', now: start + 1800000 });
  assert.equal(expired.session.remainingSeconds, 0);
  assert.equal(expired.history.length, 0, 'timer expiry requires an explicit finish before writing history');
  assert.equal(formatTrainingTime(-9), '00:00');
  assert.equal(formatTrainingTime(1500), '25:00');

  let many = readTrainingWorkspace(null, start);
  for (let index = 0; index < 25; index += 1) {
    const now = start + index * 100000;
    many = reduceTrainingWorkspace(many, { type: 'new', now });
    many = reduceTrainingWorkspace(many, { type: 'goal', value: `Teste ${index}`, now });
    many = reduceTrainingWorkspace(many, { type: 'start', now });
    many = reduceTrainingWorkspace(many, { type: 'finish', now: now + 30000 });
  }
  assert.equal(many.history.length, 20, 'browser storage is bounded');
  assert.equal(many.history[0].goal, 'Teste 24');
  assert.equal(many.history.at(-1).goal, 'Teste 5');
  assert.deepEqual(readTrainingWorkspace(JSON.stringify(many), start + 3000000), many, 'completed sessions and their evidence survive reload');
}
