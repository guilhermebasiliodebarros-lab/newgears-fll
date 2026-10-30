import { ApiError, decodeDocument, firestoreRequest, firestoreValue, getRecord } from './firebase.js';
import { readGiroBody } from '../giro/ai.js';
import { validateCoachingObservation } from '../../src/utils/coaching.js';

const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const assertId = (value) => { if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(value)) throw new ApiError(400, 'Identificador inválido.'); };
const documentRoot = (env) => `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const clean = (record) => Object.fromEntries(Object.entries(record).filter(([key]) => !key.startsWith('_')));

export async function queryCoaching(env, cohort, cursor = '', request = firestoreRequest) {
  const root = documentRoot(env);
  const rows = await request(env, ':runQuery', { method: 'POST', body: JSON.stringify({ structuredQuery: {
    from: [{ collectionId: 'coachObservations' }], where: { fieldFilter: { field: { fieldPath: 'cohort' }, op: 'EQUAL', value: { stringValue: cohort } } },
    orderBy: [{ field: { fieldPath: '__name__' }, direction: 'ASCENDING' }], limit: 101,
    ...(cursor ? { startAt: { values: [{ referenceValue: `${root}/coachObservations/${cursor}` }], before: false } } : {}),
  } }) });
  const documents = (Array.isArray(rows) ? rows : []).flatMap((row) => row.document ? [decodeDocument(row.document)] : []);
  return { records: documents.slice(0, 100).map(clean), cursor: documents.length > 100 ? documents[99].id : '' };
}
export async function commitObservation(env, data, workspace, student, request = firestoreRequest) {
  const root = documentRoot(env);
  const { transaction } = await request(env, ':beginTransaction', { method: 'POST', body: JSON.stringify({ options: { readWrite: {} } }) });
  if (!transaction) throw new ApiError(503, 'Não foi possível iniciar o registro privado.');
  let committed = false;
  try {
    const params = new URLSearchParams({ transaction });
    const freshWorkspace = await request(env, `settings/workspace_season?${params}`);
    const freshStudent = await request(env, `students/${data.studentId}?${params}`);
    if ((freshWorkspace?.updateTime || null) !== (workspace?._updateTime || null) || freshStudent?.updateTime !== student._updateTime) throw new ApiError(409, 'O cadastro ou a temporada mudou durante o envio.');
    // The transaction's read set protects both records until the append commits.
    await request(env, ':commit', { method: 'POST', body: JSON.stringify({ transaction, writes: [
      { update: { name: `${root}/coachObservations/${data.id}`, fields: Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'id').map(([key, value]) => [key, firestoreValue(value)])) }, currentDocument: { exists: false } },
    ] }) });
    committed = true;
  } finally {
    if (!committed) await request(env, ':rollback', { method: 'POST', body: JSON.stringify({ transaction }) }).catch(() => {});
  }
}

// Invoked only after the existing reports API authenticates the Firebase account.
// The explicit flag prevents storing confidential text before rules are reviewed/deployed.
export async function handleCoachingRequest(request, env, user, runtime = {}) {
  if (user?.role !== 'admin') throw new ApiError(403, 'Apenas técnicos autenticados podem acessar observações privadas.');
  const enabled = env.COACHING_PRIVATE_ENABLED === 'true';
  const url = new URL(request.url);
  if (url.pathname.endsWith('/status') && request.method === 'GET') return json({ ready: enabled, message: enabled ? '' : 'O módulo privado precisa ser habilitado no servidor após publicar e conferir as regras de acesso. Nenhum registro privado será gravado enquanto estiver desativado.' });
  if (!enabled) throw new ApiError(503, 'Acompanhamento privado ainda não habilitado pelo técnico no servidor.');
  const records = runtime.records || { getRecord, queryCoaching, commitObservation };
  if (request.method === 'GET') {
    const seasonId = url.searchParams.get('seasonId'); const studentId = url.searchParams.get('studentId'); const cursor = url.searchParams.get('cursor') || '';
    assertId(seasonId); assertId(studentId); if (cursor) assertId(cursor);
    return json(await records.queryCoaching(env, JSON.stringify([seasonId, studentId]), cursor));
  }
  if (request.method !== 'POST' || url.pathname.endsWith('/status')) throw new ApiError(405, 'Operação não disponível.');
  let data;
  try { data = validateCoachingObservation(await readGiroBody(request, 16000)); } catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(400, error.message); }
  const workspace = await records.getRecord(env, 'settings/workspace_season');
  if (workspace?.transitionLock || (workspace?.activeSeasonId || 'legacy') !== data.seasonId) throw new ApiError(409, 'A temporada mudou ou está sendo encerrada. Seu preenchimento foi mantido.');
  const student = await records.getRecord(env, `students/${data.studentId}`);
  if (!student || student.status === 'inactive') throw new ApiError(409, 'O integrante não está ativo.');
  const previous = await records.getRecord(env, `coachObservations/${data.id}`);
  const core = { ...data, cohort: JSON.stringify([data.seasonId, data.studentId]), evaluatorId: user.uid };
  if (previous) {
    if (Object.entries(core).every(([key, value]) => JSON.stringify(previous[key]) === JSON.stringify(value))) return json({ record: clean(previous), duplicate: true });
    throw new ApiError(409, 'Este envio já foi registrado. Confira o histórico antes de iniciar outro registro.');
  }
  const record = { ...core, studentName: String(student.name || 'Integrante').slice(0, 120), evaluatorName: String(user.name || 'Técnico').slice(0, 120), createdAt: new Date().toISOString() };
  try { await records.commitObservation(env, record, workspace, student); }
  catch (error) { if ([409, 412].includes(error.status)) throw new ApiError(409, 'O cadastro ou a temporada mudou durante o envio. Atualize o histórico antes de tentar novamente.'); throw error; }
  return json({ record }, 201);
}
