import assert from 'node:assert/strict';
import { handleNvidiaGiroRequest } from '../server/giro/nvidia.js';
import { createPublicGiroLimiter, publicGiroClient } from '../server/giro/publicAccess.js';

export async function runGiroPublicAccessTests() {
  const env = { NVIDIA_API_KEY: 'fixture-server-only', GIRO_AI_ACCESS: 'public' };
  const body = { messages: [{ role: 'user', content: 'Como comparar dois testes?' }], useKnowledge: true, seasonId: 'current', context: {}, references: [{ materialId: 'guide', title: 'Guia', page: 1, excerpt: 'Compare as mesmas condições.' }] };
  const request = (payload = body, headers = {}) => new Request('https://team.example/api/giro-ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://team.example', ...headers }, body: JSON.stringify(payload) });
  const status = await handleNvidiaGiroRequest(new Request('https://team.example/api/giro-ai/status'), env);
  const configuration = await status.json();
  assert.equal(configuration.ready, true);
  assert.equal(configuration.authentication, 'public');
  assert.doesNotMatch(JSON.stringify(configuration), /fixture-server-only/);
  const cookie = status.headers.get('Set-Cookie');
  assert.match(cookie, /HttpOnly; Secure; SameSite=Strict/);
  const browserCookie = cookie.split(';')[0];
  const clientId = publicGiroClient(request(body, { Cookie: browserCookie })).id;
  assert.equal(publicGiroClient(request(body, { Cookie: browserCookie })).headers['Set-Cookie'], undefined);
  assert.notEqual(publicGiroClient(request(body, { Cookie: 'giro_public_client=invalid' })).id, 'invalid');

  let reserved = 0; let released = 0; let submitted;
  const deny = () => { throw Error('Public AI must not access accounts or Firestore'); };
  const runtime = {
    authenticate: deny, reserveUsage: deny, records: { getRecord: deny },
    reservePublicUsage: (_request, id) => { assert.equal(id, clientId); reserved++; return () => { released++; }; },
    fetch: async (_url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer fixture-server-only');
      submitted = JSON.parse(options.body);
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: 'Compare os resultados. [Material 1]' } }] });
    },
  };
  const result = await handleNvidiaGiroRequest(request(body, { Cookie: browserCookie }), env, runtime);
  assert.equal(result.status, 200);
  const answer = await result.json();
  assert.equal(answer.sources[0].title, 'Trecho enviado: Guia');
  assert.match(submitted.messages[0].content, /não foram conferidos no banco/);
  assert.doesNotMatch(JSON.stringify(answer), /fixture-server-only/);
  assert.equal(reserved, 1); assert.equal(released, 1);
  const failure = await handleNvidiaGiroRequest(request(body, { Cookie: browserCookie }), env, { ...runtime, fetch: async () => new Response('', { status: 503 }) });
  assert.equal(failure.status, 503); assert.equal(released, 2, 'Provider failures must release concurrency slots');
  assert.equal((await handleNvidiaGiroRequest(request(body, { Origin: 'https://other.example' }), env, runtime)).status, 403);
  assert.equal((await handleNvidiaGiroRequest(request({ ...body, messages: [] }), env, runtime)).status, 400);
  assert.equal(reserved, 2, 'Invalid and cross-origin requests never consume a provider slot');
  assert.equal((await handleNvidiaGiroRequest(request({ ...body, public: true, local: true }), { NVIDIA_API_KEY: env.NVIDIA_API_KEY }, { ...runtime, local: true })).status, 503, 'Public access requires an explicit server setting');

  let now = 0;
  const limiter = createPublicGiroLimiter(() => now);
  const network = (ip) => request(body, { 'CF-Connecting-IP': ip });
  for (let i = 0; i < 8; i++) limiter(network('192.0.2.1'), 'browser')();
  assert.throws(() => limiter(network('192.0.2.1'), 'browser'), (error) => error.status === 429);
  for (let i = 8; i < 60; i++) limiter(network('192.0.2.1'), `browser-${i}`)();
  assert.throws(() => limiter(network('192.0.2.1'), 'another-browser'), (error) => error.status === 429, 'Changing the cookie cannot bypass network limits');
  now = 60000;
  const active = Array.from({ length: 6 }, (_, i) => limiter(network('192.0.2.1'), `concurrent-${i}`));
  assert.throws(() => limiter(network('192.0.2.2'), 'seventh'), (error) => error.status === 429);
  active[0](); active[0]();
  const replacement = limiter(network('192.0.2.2'), 'replacement');
  assert.throws(() => limiter(network('192.0.2.3'), 'still-seventh'), (error) => error.status === 429, 'Releasing twice cannot undercount active requests');
  replacement(); active.slice(1).forEach((release) => release());
  now = 120000;
  for (let i = 0; i < 120; i++) limiter(network(`192.0.2.${i}`), `global-${i}`)();
  assert.throws(() => limiter(network('198.51.100.1'), 'over-global-limit'), (error) => error.status === 429);
  now = 180000;
  limiter(network('192.0.2.1'), 'browser')();
  const exhausted = createPublicGiroLimiter(() => 0);
  for (let i = 0; i < 8; i++) exhausted(request(), clientId)();
  const limited = await handleNvidiaGiroRequest(request(body, { Cookie: browserCookie }), env, { ...runtime, reservePublicUsage: exhausted });
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('Retry-After'), '60');
}
