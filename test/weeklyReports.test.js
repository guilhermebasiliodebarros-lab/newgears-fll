import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/reports/[[path]].js';
import { firestoreValue } from '../server/reports/firebase.js';
import { runReminderCycle } from '../server/reports/reminders.js';
import { filterWeeklyReports, MAX_REPORT_FILE_SIZE, validateReportBytes } from '../src/utils/weeklyReports.js';

function storedZip(entries) {
  const locals = []; const central = []; let offset = 0;
  for (const [name, content] of entries) {
    const filename = Buffer.from(name); const data = Buffer.from(content);
    let crc = 0xffffffff;
    for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
    crc = (crc ^ 0xffffffff) >>> 0;
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(20, 4); local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(filename.length, 26);
    locals.push(local, filename, data);
    const record = Buffer.alloc(46); record.writeUInt32LE(0x02014b50); record.writeUInt16LE(20, 4); record.writeUInt16LE(20, 6); record.writeUInt32LE(crc, 16); record.writeUInt32LE(data.length, 20); record.writeUInt32LE(data.length, 24); record.writeUInt16LE(filename.length, 28); record.writeUInt32LE(offset, 42);
    central.push(record, filename); offset += local.length + filename.length + data.length;
  }
  const directory = Buffer.concat(central); const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

export async function runWeeklyReportsTests() {
  const originalFetch = globalThis.fetch;
  const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = { ...await crypto.subtle.exportKey('jwk', pair.publicKey), kid: 'reports-test', alg: 'RS256', use: 'sig' };
  const privateBytes = await crypto.subtle.exportKey('pkcs8', pair.privateKey);
  const env = {
    FIREBASE_PROJECT_ID: 'reports-test-project', FIREBASE_CLIENT_EMAIL: 'test@reports-test-project.iam.gserviceaccount.com',
    FIREBASE_PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----\n${Buffer.from(privateBytes).toString('base64')}\n-----END PRIVATE KEY-----`,
    SUPABASE_URL: 'https://reports-test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-server-secret', SUPABASE_REPORTS_BUCKET: 'weekly-reports',
    EMAIL_API_KEY: 'test-email-secret', EMAIL_FROM: 'Equipe <reports@example.com>', APP_URL: 'https://team.example.com',
  };
  const now = Math.floor(Date.now() / 1000);
  const tokens = {};
  const accountState = new Map();
  const records = new Map();
  const files = new Map();
  const deliveries = [];
  let emailFailure = false;
  let conflictReportId = '';
  let version = 0;
  const document = (path, value) => ({ name: `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`, fields: Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, firestoreValue(entry)])), updateTime: `2026-10-09T12:00:${String(++version).padStart(2, '0')}.000Z` });
  const setRecord = (path, value) => records.set(path, document(path, value));
  const claimsFor = (uid) => ({ aud: env.FIREBASE_PROJECT_ID, iss: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`, sub: uid, email: `${uid}@example.com`, iat: now - 10, exp: now + 3600, auth_time: now - 10, firebase: { sign_in_provider: 'password' } });
  const mint = async (claims) => {
    const unsigned = `${Buffer.from(JSON.stringify({ alg: 'RS256', kid: jwk.kid })).toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}`;
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(unsigned));
    return `${unsigned}.${Buffer.from(signature).toString('base64url')}`;
  };
  for (const uid of ['alice', 'bob', 'coach']) {
    tokens[uid] = await mint({ ...claimsFor(uid), role: 'admin' }); // O papel do JWT fornecido pelo cliente não deve promover alunos.
    accountState.set(uid, { localId: uid, email: `${uid}@example.com`, validSince: String(now - 60) });
    setRecord(`weeklyReportMembers/${uid}`, { name: uid, email: `${uid}@example.com`, active: true, role: uid === 'coach' ? 'admin' : 'student', studentId: uid === 'coach' ? '' : `student-${uid}` });
    if (uid !== 'coach') setRecord(`students/student-${uid}`, { name: uid, status: 'active' });
  }
  const ok = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  globalThis.fetch = async (address, options = {}) => {
    const url = new URL(address);
    if (url.pathname.includes('/service_accounts/v1/jwk/')) return ok({ keys: [jwk] });
    if (url.hostname === 'oauth2.googleapis.com') return ok({ access_token: 'google-test-token', expires_in: 3600 });
    if (url.hostname === 'identitytoolkit.googleapis.com') {
      const uid = JSON.parse(options.body).localId[0];
      return ok({ users: accountState.has(uid) ? [accountState.get(uid)] : [] });
    }
    if (url.hostname === 'firestore.googleapis.com') {
      const path = decodeURIComponent(url.pathname.split('/documents/')[1]);
      if (!options.method || options.method === 'GET') {
        if (path.split('/').length % 2 === 1) return ok({ documents: [...records.entries()].filter(([entry]) => entry.startsWith(`${path}/`) && entry.split('/').length === path.split('/').length + 1).map(([, record]) => record) });
        return records.has(path) ? ok(records.get(path)) : ok({}, 404);
      }
      const existing = records.get(path);
      if (conflictReportId && path === `weeklyReports/${conflictReportId}` && options.method === 'PATCH') { existing.updateTime = 'concurrent-version'; conflictReportId = ''; }
      if (url.searchParams.get('currentDocument.exists') === 'false' && existing) return ok({}, 409);
      if (url.searchParams.get('currentDocument.exists') === 'true' && !existing) return ok({}, 404);
      if (url.searchParams.has('currentDocument.updateTime') && existing?.updateTime !== url.searchParams.get('currentDocument.updateTime')) return ok({}, 409);
      if (options.method === 'DELETE') { records.delete(path); return ok({}); }
      const payload = JSON.parse(options.body);
      const merged = url.searchParams.has('updateMask.fieldPaths') ? { ...existing.fields, ...payload.fields } : payload.fields;
      const value = { name: `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`, fields: merged, updateTime: `version-${++version}` };
      records.set(path, value);
      return ok(value);
    }
    if (url.hostname === 'reports-test.supabase.co') {
      assert.equal(options.headers.apikey, env.SUPABASE_SERVICE_ROLE_KEY);
      if (url.pathname.includes('/object/sign/')) { assert.equal(JSON.parse(options.body).expiresIn, 300); return ok({ signedURL: '/object/sign/weekly-reports/test.pdf?token=temporary' }); }
      if (options.method === 'DELETE') { JSON.parse(options.body).prefixes.forEach((path) => files.delete(path)); return ok([]); }
      files.set(decodeURIComponent(url.pathname.split('/object/weekly-reports/')[1]), options.body);
      return ok({ Key: url.pathname });
    }
    if (url.hostname === 'api.resend.com') {
      if (emailFailure) return ok({ message: 'Unavailable' }, 503);
      deliveries.push({ payload: JSON.parse(options.body), key: options.headers['Idempotency-Key'] });
      return ok({ data: [{ id: 'email-test' }] });
    }
    throw new Error(`Unexpected request: ${url.hostname}`);
  };
  const call = async (uid, path, method = 'GET', body, tokenOverride, extraHeaders = {}) => {
    const request = new Request(`https://team.example.com/api/reports${path}`, { method, headers: { ...(uid ? { Authorization: `Bearer ${tokenOverride || tokens[uid]}` } : {}), Origin: 'https://team.example.com', ...extraHeaders }, ...(body ? { body } : {}) });
    const response = await onRequest({ request, env });
    return { status: response.status, data: await response.json() };
  };
  const form = (name = 'report.pdf', content = '%PDF-1.7\nReport content', mime = 'application/pdf') => {
    const value = new FormData();
    value.set('title', 'Pesquisa dos sensores'); value.set('week', 'Semana 3'); value.set('reportDate', '2026-10-09'); value.set('description', 'Experiência prática');
    value.set('userId', 'coach'); value.set('studentName', 'Forged coach');
    value.set('file', new Blob([content], { type: mime }), name);
    return value;
  };
  try {
    assert.equal((await call(null, '/session')).status, 401);
    assert.equal((await call('alice', '/session', 'GET', null, await mint({ ...claimsFor('alice'), exp: now - 1 }))).status, 401);
    assert.equal((await call('alice', '/session', 'GET', null, await mint({ ...claimsFor('alice'), aud: 'another-project' }))).status, 401);
    const tampered = tokens.alice.split('.');
    tampered[1] = Buffer.from(JSON.stringify(claimsFor('coach'))).toString('base64url');
    assert.equal((await call('alice', '/session', 'GET', null, tampered.join('.'))).status, 401);
    assert.equal((await call('alice', '/session')).data.user.role, 'student');
    records.delete('students/student-alice');
    assert.equal((await call('alice', '/session')).status, 403);
    setRecord('students/student-alice', { status: 'inactive' });
    assert.equal((await call('alice', '/session')).status, 403);
    setRecord('students/student-alice', { status: 'active' });
    accountState.get('alice').disabled = true;
    assert.equal((await call('alice', '/session')).status, 401);
    accountState.get('alice').disabled = false;
    accountState.get('alice').validSince = String(now);
    assert.equal((await call('alice', '/session')).status, 401);
    accountState.get('alice').validSince = String(now - 60);
    assert.equal((await call('alice', '', 'POST', form('renamed.pdf', 'This is not a PDF'))).status, 400);
    assert.equal((await call('alice', '', 'POST', form('forbidden.exe'))).status, 400);
    assert.equal((await call('alice', '', 'POST', form('oversized.pdf', new Uint8Array(MAX_REPORT_FILE_SIZE + 1)))).status, 400);
    assert.equal((await call('alice', '', 'POST', form(), undefined, { 'Content-Length': String(MAX_REPORT_FILE_SIZE + 200000) })).status, 413);
    assert.equal(files.size, 0);
    const created = await call('alice', '', 'POST', form());
    assert.equal(created.status, 201);
    const report = created.data.report;
    assert.equal(report.userId, 'alice'); assert.equal(report.studentName, 'alice'); assert.equal(report.studentEmail, 'alice@example.com');
    assert.equal(report.weekStart, '2026-10-05'); assert.equal(report.fileExtension, 'pdf');
    assert.equal(files.size, 1);
    assert.equal(Object.keys(report).some((key) => /base64|fileData|fileContent/i.test(key)), false);
    assert.equal((await call('bob', `/${report.id}`, 'PATCH', form())).status, 403);
    assert.equal((await call('bob', `/${report.id}`, 'DELETE')).status, 403);
    assert.equal(files.size, 1);
    const signed = await call('bob', `/${report.id}/file?download=1`);
    assert.equal(signed.status, 200); assert.equal(new URL(signed.data.url).searchParams.get('download'), 'report.pdf');
    assert.equal((await call('bob', `/${report.id}/read`, 'POST')).status, 200);
    assert.ok(records.has(`weeklyReportReads/bob/reports/${report.id}`));
    const updated = await call('coach', `/${report.id}`, 'PATCH', form());
    assert.equal(updated.status, 200); assert.equal(updated.data.report.userId, 'alice'); assert.equal(updated.data.report.studentName, 'alice');
    assert.notEqual(updated.data.report.filePath, report.filePath); assert.equal(files.size, 1); assert.ok(!files.has(report.filePath));
    conflictReportId = report.id;
    assert.equal((await call('alice', `/${report.id}`, 'PATCH', form())).status, 409);
    assert.equal(files.size, 1); assert.ok(files.has(updated.data.report.filePath));
    const recipientBody = JSON.stringify({ name: 'Bob', email: 'bob@example.com', active: true, notificationsEnabled: true });
    assert.equal((await call('alice', '/recipients', 'POST', recipientBody, undefined, { 'Content-Type': 'application/json' })).status, 403);
    assert.equal((await call('coach', '/recipients', 'POST', recipientBody, undefined, { 'Content-Type': 'application/json' })).status, 201);
    setRecord('weeklyReportRecipients/inactive', { name: 'Inactive', email: 'inactive@example.com', active: false, notificationsEnabled: true });
    setRecord('weeklyReportRecipients/opt-out', { name: 'No thanks', email: 'opt-out@example.com', active: true, notificationsEnabled: false });
    setRecord('weeklyReportRecipients/duplicate', { name: 'Bob again', email: 'bob@example.com', active: true, notificationsEnabled: true });
    emailFailure = true;
    const failedMail = await call('alice', `/${report.id}/notify`, 'POST');
    assert.equal(failedMail.data.emailStatus, 'failed'); assert.ok(records.has(`weeklyReports/${report.id}`));
    emailFailure = false;
    const sent = await call('alice', `/${report.id}/notify`, 'POST');
    assert.equal(sent.data.emailStatus, 'sent'); assert.equal(sent.data.recipients, 1);
    assert.equal(deliveries.length, 1); assert.deepEqual(deliveries[0].payload[0].to, ['bob@example.com']);
    assert.match(deliveries[0].payload[0].text, new RegExp(`report=${report.id}`));
    assert.equal((await call('alice', `/${report.id}/notify`, 'POST')).data.emailStatus, 'sent'); assert.equal(deliveries.length, 1);
    assert.equal('emailRecipients' in records.get(`weeklyReports/${report.id}`).fields, false);
    assert.ok(records.has(`weeklyReportEmailJobs/${report.id}`));
    assert.equal((await call('coach', `/${report.id}`, 'DELETE')).status, 200); assert.equal(files.size, 0); assert.ok(!records.has(`weeklyReports/${report.id}`));
    assert.equal((await call('bob', `/${report.id}/file`)).status, 404);
    setRecord('students/student-alice', { name: 'Alice', status: 'active' });
    const expectation = { seasonId: 'legacy', weekStart: '2027-01-04', studentId: 'student-alice', exempt: true, reason: 'School event' };
    const expectationCall = (who, value) => call(who, '/expectations', 'POST', JSON.stringify(value), undefined, { 'Content-Type': 'application/json' });
    assert.equal((await expectationCall('alice', expectation)).status, 403);
    assert.equal((await expectationCall('coach', { ...expectation, reason: '' })).status, 400);
    assert.equal((await expectationCall('coach', { ...expectation, weekStart: '2027-01-05' })).status, 400);
    assert.equal((await expectationCall('coach', expectation)).status, 200);
    assert.equal((await call('coach', '/expectations?seasonId=legacy&weekStart=2027-01-04')).data.exemptions['student-alice'].reason, 'School event');
    assert.equal((await expectationCall('coach', { ...expectation, exempt: false })).status, 200);
    assert.deepEqual((await call('coach', '/expectations?seasonId=legacy&weekStart=2027-01-04')).data.exemptions, {});
    setRecord('settings/workspace_season', { activeSeasonId: 'new-season' });
    assert.equal((await expectationCall('coach', expectation)).status, 409);
    const seasonalReport = await call('alice', '', 'POST', form());
    assert.equal(seasonalReport.data.report.seasonId, 'new-season');
    setRecord('settings/workspace_season', { activeSeasonId: 'new-season', transitionLock: { nextSeasonId: 'next' } });
    assert.equal((await call('alice', '', 'POST', form())).status, 409);
    setRecord('students/student-alice', { status: 'inactive' });
    assert.equal((await call('alice', '/session')).status, 403);
    const member = records.get('weeklyReportMembers/bob'); member.fields.active = { booleanValue: false };
    assert.equal((await call('bob', '/session')).status, 403);
    setRecord('students/student-alice', { name: 'alice', status: 'active' });
    setRecord('students/student-bob', { name: 'bob', status: 'active' });
    setRecord('settings/workspace_season', { activeSeasonId: 'new-season', planningConfig: { startDate: '2027-01-04', reportDueDay: 5 } });
    setRecord('tasks/reminder-own', { text: 'Sensor test', status: 'doing', seasonId: 'new-season', dueDate: '2026-01-01', participants: [{ id: 'student-alice', name: 'alice' }] });
    setRecord('tasks/reminder-other', { text: 'Other task', status: 'doing', seasonId: 'new-season', dueDate: '2026-01-01', participants: [{ id: 'student-bob', name: 'bob' }] });
    const preferences = { emailEnabled: true, emailHour: 10, leadDays: 1, tasks: true, reports: false, blocks: true };
    assert.equal((await call('alice', '/reminders/settings', 'POST', JSON.stringify(preferences), undefined, { 'Content-Type': 'application/json' })).status, 403);
    assert.equal((await call('coach', '/reminders/settings', 'POST', JSON.stringify({ ...preferences, emailHour: 24 }), undefined, { 'Content-Type': 'application/json' })).status, 400);
    assert.equal((await call('coach', '/reminders/settings', 'POST', JSON.stringify(preferences), undefined, { 'Content-Type': 'application/json' })).status, 200);
    assert.equal((await call('alice', '/reminders/settings')).status, 403);
    assert.equal((await call('coach', '/reminders/settings')).data.config.emailHour, 10);
    const inbox = await call('alice', '/reminders/inbox');
    assert.equal(inbox.status, 200); assert.ok(inbox.data.items.some((item) => item.entityId === 'reminder-own')); assert.ok(!inbox.data.items.some((item) => item.entityId === 'reminder-other'));
    const reminderStart = deliveries.length;
    emailFailure = true;
    const failedCycle = await runReminderCycle(env, new Date('2027-01-08T13:00:00Z'));
    assert.equal(failedCycle.failed, 2); assert.equal(failedCycle.sent, 0);
    emailFailure = false;
    const reminderCycle = await runReminderCycle(env, new Date('2027-01-08T13:15:00Z'));
    assert.equal(reminderCycle.sent, 2); assert.equal(deliveries.length, reminderStart + 2);
    assert.equal((await runReminderCycle(env, new Date('2027-01-08T13:30:00Z'))).sent, 0);
    assert.equal(deliveries.length, reminderStart + 2, 'Repeated cron execution must not duplicate reminders');
    assert.equal((await runReminderCycle(env, new Date('2027-01-08T14:00:00Z'))).status, 'waiting');
    assert.equal((await call('alice', '/backup?scope=all')).status, 403);
    const backup = await call('coach', '/backup?scope=all');
    assert.equal(backup.status, 200); assert.ok(backup.data.documents.some((item) => item.path.startsWith('weeklyReportExpectations/')));
    assert.ok(!backup.data.documents.some((item) => item.path.startsWith('automaticReminderJobs/')));
    const examples = [{ ...report, title: 'Sensores óticos' }, { ...report, userId: 'bob', title: 'Mecânica', week: 'Semana 4', reportDate: '2026-09-02' }];
    assert.equal(filterWeeklyReports(examples, { search: 'oticos', student: 'alice', week: 'Semana 3', month: '10', year: '2026' }).length, 1);
    assert.equal(filterWeeklyReports(examples, { month: '08' }).length, 0);
    const docx = storedZip([['[Content_Types].xml', '<Types/>'], ['word/document.xml', '<w:document/>']]);
    assert.doesNotThrow(() => validateReportBytes(docx, 'docx'));
    assert.throws(() => validateReportBytes(storedZip([['[Content_Types].xml', '<Types/>'], ['xl/workbook.xml', '<workbook/>']]), 'docx'));
    assert.throws(() => validateReportBytes(storedZip([['[Content_Types].xml', '<Types/>'], ['word/document.xml', '<w:document/>'], ['word/vbaProject.bin', 'macro']]), 'docx'));
    const compound = Buffer.alloc(1024); Buffer.from([208, 207, 17, 224, 161, 177, 26, 225]).copy(compound); compound.writeUInt16LE(9, 30); compound.writeInt32LE(0, 48); Buffer.from('WordDocument\0', 'utf16le').copy(compound, 512); compound.writeUInt16LE(26, 576); compound[578] = 2;
    assert.doesNotThrow(() => validateReportBytes(compound, 'doc'));
    compound.fill(0, 512, 576); Buffer.from('Workbook\0', 'utf16le').copy(compound, 512); compound.writeUInt16LE(18, 576);
    assert.throws(() => validateReportBytes(compound, 'doc'));
  } finally { globalThis.fetch = originalFetch; }
}
