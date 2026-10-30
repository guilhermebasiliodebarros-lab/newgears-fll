import assert from 'node:assert/strict';
import { requestGiroJSON, validateGiroReply } from '../src/utils/giroTransport.js';

export async function runGiroTransportTests() {
  let calls = 0;
  const fetcher = async (_url, options) => { calls++; assert.equal(options.headers.Authorization, 'Bearer fixture-token'); return Response.json({ text: 'Resposta de teste.' }); };
  const result = await requestGiroJSON('/fixture', { getToken: async () => 'fixture-token', fetcher });
  assert.equal(result.text, 'Resposta de teste.'); assert.equal(calls, 1);
  const abort = new AbortController(); abort.abort();
  await assert.rejects(requestGiroJSON('/fixture', { signal: abort.signal, getToken: async () => { throw Error('Must not authenticate after cancellation'); }, fetcher }), { name: 'AbortError' });
  assert.equal(calls, 1);
  const during = new AbortController();
  const pending = requestGiroJSON('/fixture', { signal: during.signal, getToken: () => new Promise(() => {}), fetcher });
  during.abort(); await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(calls, 1, 'cancellation does not wait for a hanging authentication request');
  await assert.rejects(requestGiroJSON('/fixture', { timeoutMs: 10, getToken: () => new Promise(() => {}), fetcher }), /demorou/);
  await assert.rejects(requestGiroJSON('/fixture', { timeoutMs: 10, fetcher: async () => ({ ok: true, json: () => new Promise(() => {}) }) }), /demorou/, 'deadline covers a hanging response body');
  await assert.rejects(requestGiroJSON('/fixture', { fetcher: async () => { throw new TypeError('Failed to fetch'); } }), /conexão/);
  await assert.rejects(requestGiroJSON('/fixture', { fetcher: async () => new Response('<html>fallback</html>') }), /servidor/);
  await assert.rejects(requestGiroJSON('/fixture', { fetcher: async () => Response.json({ error: 'Aguarde.' }, { status: 429, headers: { 'Retry-After': '99999' } }) }), (issue) => issue.status === 429 && issue.retryAfter === 120);
  await assert.rejects(requestGiroJSON('/fixture', { fetcher: async () => Response.json({}, { status: 401 }) }), /autenticada/);
  await assert.rejects(requestGiroJSON('/fixture', { fetcher: async () => Response.json([]) }), /não pôde ser lida/);
  for (const invalid of [{}, { text: '' }, { text: 'x'.repeat(16001) }, { text: {} }]) assert.throws(() => validateGiroReply(invalid), /completa/);
  const clean = validateGiroReply({ text: ' Resposta. ', role: 'user', id: 'forged', secret: 'private', sources: [{ url: 'javascript:alert(1)' }, { type: 'internal', title: 'Guia', materialId: 'guide', page: 2, number: {}, url: '' }, { type: 'internal', materialId: '../private', page: 1, url: 'https://example.test' }] });
  assert.equal(clean.text, 'Resposta.'); assert.equal(clean.sources.length, 1); assert.equal(clean.sources[0].number, undefined);
  assert.doesNotMatch(JSON.stringify(clean), /forged|private|javascript/);
}
