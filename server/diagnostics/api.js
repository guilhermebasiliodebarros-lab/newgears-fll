import { authenticate, decodeDocument, firestoreRequest, writeRecord } from '../reports/firebase.js';
import { validateDiagnostic } from '../../src/utils/clientDiagnostics.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const requests = new Map();
const firestoreReady = (env) => Boolean(env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY);

export async function handleDiagnosticsRequest(request, env, adapters = {}) {
  const store = { authenticate, list: async () => {
    const data = await firestoreRequest(env, 'clientDiagnostics?pageSize=100&orderBy=receivedAt%20desc');
    return (data?.documents || []).map(decodeDocument);
  }, writeRecord, log: (item) => console.warn('newgears_client_issue', JSON.stringify(item)), ...adapters };
  try {
    if (request.method === 'GET') {
      const user = await store.authenticate(request, env);
      if (user.role !== 'admin') return json({ error: 'Consulta disponível para o técnico.' }, 403);
      const records = await store.list();
      return json({ records });
    }
    if (request.method !== 'POST') return json({ error: 'Método inválido.' }, 405);
    const origin = request.headers.get('Origin');
    if (origin !== new URL(request.url).origin) return json({ error: 'Origem inválida.' }, 403);
    if (Number(request.headers.get('Content-Length') || 0) > 6000) return json({ error: 'Registro muito grande.' }, 413);
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Registro vazio.' }, 400);
    const chunks = []; let size = 0;
    while (true) {
      const next = await reader.read(); if (next.done) break;
      size += next.value.byteLength;
      if (size > 6000) { await reader.cancel(); return json({ error: 'Registro muito grande.' }, 413); }
      chunks.push(next.value);
    }
    let body;
    try { body = JSON.parse(await new Blob(chunks).text()); } catch { return json({ error: 'Registro inválido.' }, 400); }
    const event = validateDiagnostic(body);
    if (!event) return json({ error: 'Registro inválido.' }, 400);
    const now = Date.now();
    const source = request.headers.get('CF-Connecting-IP') || 'local';
    const rate = requests.get(source);
    if (rate && rate.expires > now && rate.count >= 30) return json({ error: 'Aguarde antes de reenviar.' }, 429);
    if (requests.size >= 500) for (const [key, value] of requests) if (value.expires <= now) requests.delete(key);
    if (requests.size >= 500 && !requests.has(source)) return json({ error: 'Aguarde antes de reenviar.' }, 429);
    requests.set(source, { count: rate && rate.expires > now ? rate.count + 1 : 1, expires: rate && rate.expires > now ? rate.expires : now + 60000 });
    const record = { ...event, receivedAt: new Date().toISOString() };
    store.log(record);
    if (firestoreReady(env)) {
      try { await store.writeRecord(env, `clientDiagnostics/${event.id}`, record); }
      catch { console.warn('newgears_diagnostics_storage_unavailable'); }
    }
    return json({ accepted: true, id: event.id }, 202);
  } catch (error) { return json({ error: 'Não foi possível consultar as ocorrências.' }, error.status || 503); }
}
