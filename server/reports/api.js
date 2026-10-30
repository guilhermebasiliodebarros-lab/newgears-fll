import { ApiError, authenticate, firestoreRequest, getRecord, listRecords, writeRecord } from './firebase.js';
import { MAX_REPORT_FILE_SIZE, REPORT_FILE_TYPES, validateReportBytes, validateReportDetails, validateReportFile } from '../../src/utils/weeklyReports.js';
import { handleReminderRequest } from './reminders.js';
import { handleCoachingRequest } from './coaching.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const validId = (id) => /^[a-zA-Z0-9_-]{1,128}$/.test(id || '');
const assertId = (id) => { if (!validId(id)) throw new ApiError(400, 'Identificador inválido.'); };
export const assertReportOwner = (user, report) => {
  if (!report) throw new ApiError(404, 'Relatório não encontrado.');
  if (user.role !== 'admin' && report.userId !== user.uid) throw new ApiError(403, 'Você só pode alterar seus próprios relatórios.');
};
const assertAdmin = (user) => { if (user.role !== 'admin') throw new ApiError(403, 'Apenas o técnico pode gerenciar os destinatários.'); };
const cleanRecord = (record) => Object.fromEntries(Object.entries(record).filter(([key]) => !key.startsWith('_')));
const safeFileName = (name) => [...name].map((char) => char.charCodeAt(0) < 32 || char === '/' || char === '\\' ? '_' : char).join('').slice(0, 240);

async function limitedBody(request, limit) {
  if (Number(request.headers.get('Content-Length') || 0) > limit) throw new ApiError(413, 'Arquivo ou formulário muito grande. Limite de arquivo: 10 MB.');
  if (!request.body) throw new ApiError(400, 'Formulário vazio.');
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new ApiError(413, 'Arquivo ou formulário muito grande. Limite de arquivo: 10 MB.'); }
    chunks.push(value);
  }
  return new Blob(chunks);
}

async function readJson(request) {
  try { return JSON.parse(await (await limitedBody(request, 16000)).text()); }
  catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(400, 'Dados inválidos.'); }
}

function storageConfig(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_REPORTS_BUCKET) throw new ApiError(503, 'O técnico precisa configurar o armazenamento dos relatórios.');
  const origin = new URL(env.SUPABASE_URL);
  if (origin.protocol !== 'https:') throw new ApiError(503, 'Endereço de armazenamento inválido.');
  return { base: `${origin.origin}/storage/v1`, bucket: encodeURIComponent(env.SUPABASE_REPORTS_BUCKET), headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } };
}
const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/');

async function uploadDocument(env, path, bytes, type) {
  const storage = storageConfig(env);
  const response = await fetch(`${storage.base}/object/${storage.bucket}/${encodePath(path)}`, {
    method: 'POST', headers: { ...storage.headers, 'Content-Type': type, 'x-upsert': 'false', 'Cache-Control': 'private, max-age=0' }, body: bytes,
  });
  if (!response.ok) throw new ApiError(503, 'Não foi possível armazenar o arquivo. Confira o bucket ou tente novamente.');
  await response.arrayBuffer();
}

async function removeDocument(env, path) {
  const storage = storageConfig(env);
  const response = await fetch(`${storage.base}/object/${storage.bucket}`, { method: 'DELETE', headers: { ...storage.headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: [path] }) });
  if (!response.ok) throw new ApiError(503, 'Não foi possível remover o arquivo do armazenamento.');
  await response.arrayBuffer();
}

async function retireDocument(env, reportId, filePath) {
  try { await removeDocument(env, filePath); }
  catch {
    // Não perde a referência de arquivos que precisem de limpeza posterior.
    await writeRecord(env, `weeklyReportCleanup/${crypto.randomUUID()}`, { reportId, filePath, createdAt: new Date().toISOString() });
    console.warn('Arquivo de relatório aguardando limpeza', reportId);
  }
}

async function saveReport(request, env, user, id) {
  const previous = id ? await getRecord(env, `weeklyReports/${id}`) : null;
  if (id) assertReportOwner(user, previous);
  const body = await limitedBody(request, MAX_REPORT_FILE_SIZE + 128 * 1024);
  let form;
  try { form = await new Response(body, { headers: { 'Content-Type': request.headers.get('Content-Type') || '' } }).formData(); }
  catch { throw new ApiError(400, 'Envie o relatório como formulário com arquivo.'); }
  const details = validateReportDetails(Object.fromEntries(['title', 'description', 'week', 'reportDate'].map((key) => [key, form.get(key)])));
  const file = form.get('file');
  if (!previous && !file) throw new ApiError(400, 'Selecione um arquivo para publicar.');
  const reportId = id || crypto.randomUUID();
  const now = new Date().toISOString();
  const workspace = await getRecord(env, 'settings/workspace_season');
  if (workspace?.transitionLock) throw new ApiError(409, 'A temporada está sendo encerrada. Aguarde para publicar.');
  const record = previous ? { ...cleanRecord(previous), ...details, updatedAt: now } : {
    ...details, userId: user.uid, studentId: user.studentId, studentName: user.name, studentEmail: user.email,
    createdAt: now, updatedAt: now, emailStatus: 'pending', seasonId: workspace?.activeSeasonId || 'legacy',
  };
  let uploadedPath;
  try {
    if (file) {
      const extension = validateReportFile(file);
      const bytes = new Uint8Array(await file.arrayBuffer());
      validateReportBytes(bytes, extension);
      uploadedPath = `${record.userId}/${reportId}/${crypto.randomUUID()}.${extension}`;
      await uploadDocument(env, uploadedPath, bytes, REPORT_FILE_TYPES[extension]);
      Object.assign(record, { fileName: safeFileName(file.name), fileType: REPORT_FILE_TYPES[extension], fileExtension: extension, fileSize: bytes.length, filePath: uploadedPath, fileUrl: `/api/reports/${reportId}/file` });
    }
    await writeRecord(env, `weeklyReports/${reportId}`, record, previous ? { updateTime: previous._updateTime } : { create: true });
  } catch (error) {
    if (uploadedPath) await retireDocument(env, reportId, uploadedPath);
    throw error;
  }
  if (uploadedPath && previous?.filePath) await retireDocument(env, reportId, previous.filePath);
  return json({ report: { ...record, id: reportId } }, previous ? 200 : 201);
}

async function fileLink(env, report, download) {
  const storage = storageConfig(env);
  const response = await fetch(`${storage.base}/object/sign/${storage.bucket}/${encodePath(report.filePath)}`, { method: 'POST', headers: { ...storage.headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: 300 }) });
  if (!response.ok) throw new ApiError(503, 'Não foi possível abrir este arquivo agora.');
  const data = await response.json();
  const signed = data.signedURL || data.signedUrl;
  if (!signed) throw new ApiError(503, 'O armazenamento não retornou um link para o arquivo.');
  const url = new URL(`${storage.base}${signed}`);
  if (download) url.searchParams.set('download', report.fileName);
  return json({ url: url.href, expiresIn: 300, reportUpdatedAt: report.updatedAt || '', fileSize: report.fileSize });
}

export function validateRecipient(input) {
  const name = `${input.name || ''}`.trim();
  const email = `${input.email || ''}`.trim().toLowerCase();
  if (!name || name.length > 120 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'Informe um nome e um e-mail válidos.');
  if (typeof input.active !== 'boolean' || typeof input.notificationsEnabled !== 'boolean') throw new ApiError(400, 'Informe as preferências de notificação.');
  return { name, email, active: input.active, notificationsEnabled: input.notificationsEnabled };
}

export function emailMessage(snapshot, reportId, appUrl, emailFrom) {
  const url = new URL(appUrl);
  url.searchParams.set('report', reportId);
  url.searchParams.delete('view');
  url.hash = '';
  return {
    from: emailFrom, subject: `Novo relatório semanal — ${snapshot.studentName}`,
    text: `Olá!\n\n${snapshot.studentName} publicou um novo relatório semanal.\n\nSemana: ${snapshot.week}\nTítulo: ${snapshot.title}\nData: ${snapshot.reportDate.split('-').reverse().join('/')}\n\nVocê pode visualizar o relatório no sistema (login necessário):\n${url.href}\n`,
  };
}

async function notifyReport(env, user, id) {
  const report = await getRecord(env, `weeklyReports/${id}`);
  assertReportOwner(user, report);
  const job = await getRecord(env, `weeklyReportEmailJobs/${id}`);
  if (job?.status === 'sent') {
    await writeRecord(env, `weeklyReports/${id}`, { emailStatus: 'sent' }, { merge: true });
    return json({ emailStatus: 'sent' });
  }
  if (!env.EMAIL_API_KEY || !env.EMAIL_FROM || !env.APP_URL) {
    await writeRecord(env, `weeklyReports/${id}`, { emailStatus: 'not_configured' }, { merge: true, updateTime: report._updateTime });
    return json({ emailStatus: 'not_configured', message: 'Relatório publicado. O envio por e-mail ainda precisa ser configurado.' });
  }
  if (job?.status === 'sending' && Date.now() - Date.parse(job.attemptAt) < 5 * 60 * 1000) return json({ emailStatus: 'sending' }, 202);
  const recipients = job?.recipients || [...new Set((await listRecords(env, 'weeklyReportRecipients')).filter((item) => item.active === true && item.notificationsEnabled === true).map((item) => item.email.toLowerCase()))].sort();
  const snapshot = job?.snapshot || { studentName: report.studentName, week: report.week, title: report.title, reportDate: report.reportDate, appUrl: env.APP_URL, emailFrom: env.EMAIL_FROM };
  // Destinatários e conteúdo congelado ficam em coleção privada, fora dos cards compartilhados.
  await writeRecord(env, `weeklyReportEmailJobs/${id}`, { status: 'sending', attemptAt: new Date().toISOString(), recipients, snapshot }, job ? { merge: true, updateTime: job._updateTime } : { create: true });
  await writeRecord(env, `weeklyReports/${id}`, { emailStatus: 'sending' }, { merge: true });
  try {
    const message = emailMessage(snapshot, id, snapshot.appUrl, snapshot.emailFrom);
    let sentCount = job?.sentCount || 0;
    for (let offset = sentCount; offset < recipients.length; offset += 100) {
      const batch = recipients.slice(offset, offset + 100).map((email) => ({ ...message, to: [email] }));
      const response = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST', headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `weekly-report/${id}/${offset}` }, body: JSON.stringify(batch),
      });
      if (!response.ok) { console.warn('Falha ao enviar e-mails de relatório', id, response.status); throw new Error('Email provider'); }
      await response.arrayBuffer();
      sentCount += batch.length;
      await writeRecord(env, `weeklyReportEmailJobs/${id}`, { sentCount }, { merge: true });
    }
    await writeRecord(env, `weeklyReportEmailJobs/${id}`, { status: 'sent', sentAt: new Date().toISOString(), sentCount }, { merge: true });
    await writeRecord(env, `weeklyReports/${id}`, { emailStatus: 'sent', emailSentAt: new Date().toISOString() }, { merge: true });
    return json({ emailStatus: 'sent', recipients: sentCount });
  } catch {
    await writeRecord(env, `weeklyReportEmailJobs/${id}`, { status: 'failed' }, { merge: true });
    await writeRecord(env, `weeklyReports/${id}`, { emailStatus: 'failed' }, { merge: true });
    return json({ emailStatus: 'failed', message: 'O relatório foi publicado, mas o envio de e-mail falhou. Você pode tentar novamente.' });
  }
}

export async function handleReportsRequest(request, env) {
  try {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    // A API permanece no mesmo domínio do aplicativo; não aceita cookies como credencial.
    const allowedOrigin = env.APP_URL ? new URL(env.APP_URL).origin : url.origin;
    if (origin && origin !== allowedOrigin && origin !== url.origin) throw new ApiError(403, 'Origem não autorizada.');
    const user = await authenticate(request, env);
    const segments = url.pathname.replace(/^\/api\/reports\/?/, '').split('/').filter(Boolean);
    const [id, action] = segments;
    const method = request.method;
    if (id === 'coaching' && (segments.length === 1 || (segments.length === 2 && action === 'status'))) return await handleCoachingRequest(request, env, user);
    if (id === 'reminders') return await handleReminderRequest(request, env, user, segments);
    if (id === 'backup' && segments.length === 1 && method === 'GET') {
      assertAdmin(user);
      const scope = url.searchParams.get('scope') || 'all'; if (scope !== 'all') assertId(scope);
      const documents = [];
      for (const name of ['weeklyReportExpectations', 'weeklyReportRecipients', 'coachObservations']) {
        const records = await listRecords(env, name, 20000);
        records.filter((item) => name === 'weeklyReportRecipients' || scope === 'all' || (item.seasonId || 'legacy') === scope).forEach(({ id: recordId, ...item }) => documents.push({ path: `${name}/${recordId}`, data: cleanRecord(item) }));
      }
      const preferences = await getRecord(env, 'settings/automatic_reminders');
      if (preferences) documents.push({ path: 'settings/automatic_reminders', data: cleanRecord(preferences) });
      return json({ documents });
    }
    if (id === 'session' && segments.length === 1 && method === 'GET') return json({ user });
    if (id === 'expectations') {
      assertAdmin(user);
      const data = method === 'POST' ? await readJson(request) : Object.fromEntries(url.searchParams);
      const { seasonId, weekStart } = data;
      assertId(seasonId);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart || '') || !Number.isFinite(Date.parse(weekStart)) || new Date(`${weekStart}T12:00:00Z`).toISOString().slice(0, 10) !== weekStart || new Date(`${weekStart}T12:00:00Z`).getUTCDay() !== 1) throw new ApiError(400, 'Informe uma semana válida iniciada na segunda-feira.');
      const path = `weeklyReportExpectations/${seasonId}__${weekStart}`;
      const previous = await getRecord(env, path);
      if (method === 'GET') return json({ exemptions: previous?.exemptions || {} });
      if (method === 'POST') {
        assertId(data.studentId);
        if (typeof data.exempt !== 'boolean' || (data.exempt && (typeof data.reason !== 'string' || !data.reason.trim() || data.reason.length > 300))) throw new ApiError(400, 'Informe o motivo da dispensa em até 300 caracteres.');
        if (!await getRecord(env, `students/${data.studentId}`)) throw new ApiError(404, 'Integrante não encontrado.');
        const workspace = await getRecord(env, 'settings/workspace_season');
        if (workspace?.transitionLock || (workspace?.activeSeasonId || 'legacy') !== seasonId) throw new ApiError(409, 'A temporada mudou ou está sendo encerrada. Atualize a página.');
        const exemptions = { ...(previous?.exemptions || {}) };
        if (data.exempt) exemptions[data.studentId] = { reason: data.reason.trim(), by: user.name, updatedAt: new Date().toISOString() };
        else delete exemptions[data.studentId];
        await writeRecord(env, path, { seasonId, weekStart, exemptions }, previous ? { updateTime: previous._updateTime } : { create: true });
        return json({ exemptions });
      }
    } else if (id === 'recipients') {
      assertAdmin(user);
      if (method === 'POST' && segments.length === 1) {
        const data = validateRecipient(await readJson(request));
        const recipientId = crypto.randomUUID();
        await writeRecord(env, `weeklyReportRecipients/${recipientId}`, { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { create: true });
        return json({ id: recipientId }, 201);
      }
      if (segments.length === 2) {
        assertId(action);
        const recipient = await getRecord(env, `weeklyReportRecipients/${action}`);
        if (!recipient) throw new ApiError(404, 'Integrante não encontrado.');
        if (method === 'PATCH') {
          await writeRecord(env, `weeklyReportRecipients/${action}`, { ...validateRecipient(await readJson(request)), updatedAt: new Date().toISOString() }, { merge: true, updateTime: recipient._updateTime });
          return json({ id: action });
        }
        if (method === 'DELETE') {
          await firestoreRequest(env, `weeklyReportRecipients/${action}?${new URLSearchParams({ 'currentDocument.updateTime': recipient._updateTime })}`, { method: 'DELETE' });
          return json({ deleted: true });
        }
      }
    } else {
      if (!id && method === 'POST') return await saveReport(request, env, user);
      assertId(id);
      if (segments.length === 1 && method === 'PATCH') return await saveReport(request, env, user, id);
      const report = await getRecord(env, `weeklyReports/${id}`);
      if (!report) throw new ApiError(404, 'Relatório não encontrado.');
      if (segments.length === 1 && method === 'DELETE') {
        assertReportOwner(user, report);
        await firestoreRequest(env, `weeklyReports/${id}?${new URLSearchParams({ 'currentDocument.updateTime': report._updateTime })}`, { method: 'DELETE' });
        await retireDocument(env, id, report.filePath);
        return json({ deleted: true });
      }
      if (segments.length === 2 && action === 'file' && method === 'GET') return await fileLink(env, report, url.searchParams.get('download') === '1');
      if (segments.length === 2 && action === 'notify' && method === 'POST') return await notifyReport(env, user, id);
      if (segments.length === 2 && action === 'read' && method === 'POST') {
        await writeRecord(env, `weeklyReportReads/${encodeURIComponent(user.uid)}/reports/${id}`, { readAt: new Date().toISOString() });
        return json({ read: true });
      }
    }
    throw new ApiError(405, 'Operação não disponível.');
  } catch (error) {
    if (error instanceof ApiError) return json({ error: error.message }, error.status);
    // Os validadores compartilhados lançam Error sem expor detalhes de provedores.
    if (/^(Selecione|Formato|O arquivo|O tipo|O conteúdo|Informe|O resumo)/.test(error.message || '')) return json({ error: error.message }, 400);
    console.error('Weekly Reports API', error.name);
    return json({ error: 'Não foi possível concluir a operação. Tente novamente.' }, 500);
  }
}
