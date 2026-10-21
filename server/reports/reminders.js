import { ApiError, getRecord, listRecords, writeRecord } from './firebase.js';
import { DEFAULT_REMINDERS, buildReminders, validateReminderSettings } from '../../src/utils/reminders.js';
import { weekStartFor } from '../../src/utils/weeklyReports.js';
import { shiftDate } from '../../src/utils/evolution.js';

const clean = (item) => Object.fromEntries(Object.entries(item).filter(([key]) => !key.startsWith('_')));
const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
export async function reminderData(env, now = new Date()) {
  const [workspace, storedConfig] = await Promise.all([getRecord(env, 'settings/workspace_season'), getRecord(env, 'settings/automatic_reminders')]);
  if (workspace?.transitionLock) throw new ApiError(409, 'Aguarde o encerramento da temporada para atualizar os lembretes.');
  const seasonId = workspace?.activeSeasonId || 'legacy';
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const config = { ...DEFAULT_REMINDERS, ...storedConfig };
  const [allTasks, students, allReports, ...expectations] = await Promise.all([
    listRecords(env, 'tasks', 20000), listRecords(env, 'students', 20000), listRecords(env, 'weeklyReports', 20000),
    ...Array.from({ length: 4 }, (_, offset) => getRecord(env, `weeklyReportExpectations/${seasonId}__${shiftDate(weekStartFor(today), -7 * offset)}`)),
  ]);
  return { seasonId, today, config, planning: workspace?.planningConfig || {}, tasks: allTasks.filter((task) => !task.seasonId || task.seasonId === seasonId), students, reports: allReports.filter((report) => (report.seasonId || 'legacy') === seasonId), expectations: Object.fromEntries(expectations.filter(Boolean).map((item) => [item.weekStart, item.exemptions || {}])) };
}

export async function handleReminderRequest(request, env, user, segments) {
  if (segments.length !== 2) throw new ApiError(405, 'Operação de lembretes não disponível.');
  const action = segments[1];
  if (action === 'inbox' && request.method === 'GET') {
    const data = await reminderData(env);
    return response({ items: buildReminders({ ...data, user }), config: Object.fromEntries(Object.keys(DEFAULT_REMINDERS).map((key) => [key, data.config[key]])), seasonId: data.seasonId, checkedAt: new Date().toISOString() });
  }
  if (action === 'settings') {
    if (user.role !== 'admin') throw new ApiError(403, 'Apenas o técnico pode configurar os lembretes.');
    if (request.method === 'GET') {
      const [settings, state] = await Promise.all([getRecord(env, 'settings/automatic_reminders'), getRecord(env, 'settings/reminder_scheduler')]);
      return response({ config: { ...DEFAULT_REMINDERS, ...(settings ? clean(settings) : {}) }, scheduler: state ? clean(state) : null });
    }
    if (request.method === 'POST') {
      const raw = await request.text(); if (raw.length > 4096) throw new ApiError(400, 'Preferências muito grandes.');
      let config; try { config = validateReminderSettings(JSON.parse(raw)); } catch (issue) { throw new ApiError(400, issue.message); }
      const previous = await getRecord(env, 'settings/automatic_reminders');
      await writeRecord(env, 'settings/automatic_reminders', config, previous ? { updateTime: previous._updateTime } : { create: true });
      return response({ config });
    }
  }
  throw new ApiError(405, 'Operação de lembretes não disponível.');
}

export async function runReminderCycle(env, now = new Date()) {
  const settings = await getRecord(env, 'settings/automatic_reminders');
  const prefs = { ...DEFAULT_REMINDERS, ...settings };
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', hourCycle: 'h23' }).format(now));
  const heartbeat = async (status, detail = {}) => { const previous = await getRecord(env, 'settings/reminder_scheduler'); await writeRecord(env, 'settings/reminder_scheduler', { checkedAt: now.toISOString(), status, ...detail }, previous ? { merge: true, updateTime: previous._updateTime } : { create: true }); };
  if (!prefs.emailEnabled) { await heartbeat('disabled'); return { sent: 0, status: 'disabled' }; }
  if (hour !== prefs.emailHour) { await heartbeat('waiting'); return { sent: 0, status: 'waiting' }; }
  if (!env.EMAIL_API_KEY || !env.EMAIL_FROM || !env.APP_URL) { await heartbeat('not_configured'); return { sent: 0, status: 'not_configured' }; }
  const data = await reminderData(env, now);
  const members = await listRecords(env, 'weeklyReportMembers', 20000);
  let sent = 0; let failed = 0;
  for (const member of members.filter((item) => item.active === true && item.remindersEnabled !== false && ['admin', 'student'].includes(item.role) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email || ''))) {
    if (member.role === 'student' && !data.students.some((student) => student.id === member.studentId && student.status !== 'inactive')) continue;
    const items = buildReminders({ ...data, user: member }); if (!items.length) continue;
    const workspace = await getRecord(env, 'settings/workspace_season');
    const currentPrefs = await getRecord(env, 'settings/automatic_reminders');
    if (workspace?.transitionLock || (workspace?.activeSeasonId || 'legacy') !== data.seasonId || currentPrefs?.emailEnabled !== true) break;
    const jobId = `${data.seasonId}__${data.today}__${member.id}`;
    const path = `automaticReminderJobs/${jobId}`; const previous = await getRecord(env, path);
    if (previous?.status === 'sent' || (previous?.status === 'sending' && now.getTime() - Date.parse(previous.attemptAt) < 10 * 60 * 1000)) continue;
    // Never retry a provider-accepted message outside its 24-hour idempotency window.
    if (previous?.createdAt && now.getTime() - Date.parse(previous.createdAt) >= 23 * 60 * 60 * 1000) continue;
    const appUrl = new URL(env.APP_URL); appUrl.searchParams.delete('view'); appUrl.searchParams.delete('report');
    const payload = previous?.payload || { from: env.EMAIL_FROM, to: [member.email.toLowerCase()], subject: `Lembretes da equipe — ${data.today.split('-').reverse().join('/')}`, text: `Olá, ${member.name || 'integrante'}!\n\n${items.slice(0, 25).map((item) => `• ${item.title}\n  ${item.detail}`).join('\n\n')}${items.length > 25 ? `\n\nMais ${items.length - 25} aviso(s) no sistema.` : ''}\n\nAcesse a equipe: ${appUrl.href}\n` };
    try {
      await writeRecord(env, path, { status: 'sending', createdAt: previous?.createdAt || now.toISOString(), attemptAt: now.toISOString(), payload, seasonId: data.seasonId }, previous ? { updateTime: previous._updateTime } : { create: true });
    } catch (issue) { if (issue.status === 409) continue; throw issue; }
    try {
      const result = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `newgears-reminder/${jobId}` }, body: JSON.stringify(payload) });
      if (!result.ok) throw new Error('Email provider failed');
      await result.arrayBuffer();
      await writeRecord(env, path, { status: 'sent', sentAt: now.toISOString() }, { merge: true }); sent += 1;
    } catch { await writeRecord(env, path, { status: 'failed' }, { merge: true }); failed += 1; }
  }
  await heartbeat(failed ? 'partial_failure' : 'completed', { sent, failed });
  return { status: failed ? 'partial_failure' : 'completed', sent, failed };
}
