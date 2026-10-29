import assert from 'node:assert/strict';
import { diagnosticArea, diagnosticCode, diagnosticFrames, validateDiagnostic } from '../src/utils/clientDiagnostics.js';
import { handleDiagnosticsRequest } from '../server/diagnostics/api.js';

export async function runClientDiagnosticsTests() {
  const issue = { id: 'test-occurrence', area: 'evaluations', role: 'student', code: 'invalid-data', device: 'desktop', browser: 'Edge', build: '2026-10-29T12:00:00.000Z', frames: 'assets/FinalSprintEvaluations-abc.js:20:14', occurredAt: '2026-10-29T12:00:00.000Z', count: 1, online: true };
  const clean = validateDiagnostic({ ...issue, message: 'private student text', password: 'secret', token: 'nvidia-key' });
  assert.equal(clean.area, issue.area); assert.equal(clean.password, undefined); assert.equal(clean.message, undefined); assert.equal(clean.token, undefined);
  assert.equal(diagnosticCode(new TypeError('draft.improvement.trim is not a function'), 'render'), 'invalid-data');
  assert.equal(diagnosticCode({ code: 'permission-denied' }), 'permission-denied');
  assert.equal(diagnosticCode(Error('Failed to fetch dynamically imported module')), 'module-load');
  assert.equal(diagnosticArea('admin-evaluations'), 'evaluations');
  assert.equal(diagnosticArea('students/private-person'), 'principal');
  const frames = diagnosticFrames('Error: private name and password\n at Example (https://site.test/assets/file-123.js:10:22)\n Authorization: private-key');
  assert.equal(frames, 'assets/file-123.js:10:22');
  assert.equal(validateDiagnostic({ ...issue, count: 1000000 }), null);
  assert.equal(validateDiagnostic({ ...issue, frames: 'https://server.test/?token=secret' }), null);
  assert.equal(validateDiagnostic({ ...issue, frames: Array(4).fill('assets/file.js:1:1').join(' | ') }), null);
  assert.equal(validateDiagnostic({ ...issue, area: 'a-private-student' }), null);
  assert.equal(validateDiagnostic({ ...issue, code: 'unknown' }), null);

  const records = []; const logs = [];
  const adapters = { log: (row) => logs.push(row), writeRecord: async (_env, path, row) => records.push({ path, row }), authenticate: async () => ({ role: 'admin' }), list: async () => records.map(({ row }) => row) };
  const request = (value = issue, extra = {}) => new Request('https://example.test/api/diagnostics', { method: 'POST', headers: { Origin: 'https://example.test', 'Content-Type': 'application/json', 'CF-Connecting-IP': 'test-client', ...extra }, body: JSON.stringify(value) });
  const result = await handleDiagnosticsRequest(request({ ...issue, message: 'secret', name: 'private name' }), {}, adapters);
  assert.equal(result.status, 202); assert.equal((await result.json()).accepted, true);
  assert.equal(logs.length, 1); assert.equal(records.length, 0, 'monitoring works in server logs before private database access is configured');
  assert.equal(JSON.stringify(logs).includes('secret'), false); assert.equal(JSON.stringify(logs).includes('private name'), false);
  const env = { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' };
  assert.equal((await handleDiagnosticsRequest(request(), env, adapters)).status, 202); assert.equal(records.length, 1);
  assert.equal((await handleDiagnosticsRequest(request(issue, { Origin: 'https://other.test' }), {}, adapters)).status, 403);
  assert.equal((await handleDiagnosticsRequest(request({ ...issue, code: 'secret' }), {}, adapters)).status, 400);
  assert.equal((await handleDiagnosticsRequest(request({ ...issue, arbitrary: 'x'.repeat(7000) }), {}, adapters)).status, 413);
  const get = new Request('https://example.test/api/diagnostics');
  assert.equal((await handleDiagnosticsRequest(get, env, { ...adapters, authenticate: async () => ({ role: 'student' }) })).status, 403);
  assert.equal((await handleDiagnosticsRequest(get, env, { ...adapters, authenticate: async () => { throw Object.assign(Error(), { status: 401 }); } })).status, 401);
  assert.equal((await handleDiagnosticsRequest(get, env, adapters)).status, 200);
  for (let i = 0; i < 30; i++) await handleDiagnosticsRequest(request(issue, { 'CF-Connecting-IP': 'rate-limit-test' }), {}, adapters);
  assert.equal((await handleDiagnosticsRequest(request(issue, { 'CF-Connecting-IP': 'rate-limit-test' }), {}, adapters)).status, 429);
}
