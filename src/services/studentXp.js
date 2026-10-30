import { collection, deleteField, doc, runTransaction } from 'firebase/firestore';
import { assertActiveSeason } from './teamProcesses.js';
import { calculateSchoolReportXp, getSchoolStageRecord, normalizeSchoolGrades, parseSchoolGrade, SCHOOL_REPORT_STAGE_CONFIG, SCHOOL_REPORT_SUBJECTS } from '../utils/schoolReport.js';

const adapter = { collection, deleteField, doc, runTransaction };
const notifications = (value) => Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : [];
const requireAdmin = (user) => { if (user?.type !== 'admin') throw Error('Apenas o técnico pode alterar esta pontuação.'); };
const canonical = (value) => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])])) : value;
const sameValue = (left, right) => JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
const safeXp = (value) => { const xp = Number(value ?? 0); if (!Number.isSafeInteger(xp)) throw Error('A pontuação precisa ser conferida antes de continuar.'); return xp; };
const ledger = (student, amount, options, now) => ({ seasonId: options.seasonId, studentId: options.studentId, studentName: student.name || 'Aluno', amount,
  source: options.source, sourceLabel: options.sourceLabel || options.source, mode: options.mode || (amount < 0 ? 'correction' : 'reward'), reason: options.reason || '',
  notifyStudent: Boolean(options.notifyStudent), createdAt: now, createdBy: options.actor || options.user?.name || 'Técnico', referenceRecordId: '', ...options.metadata });

// A stable operation ID makes retries safe; every read precedes every write.
async function mutateXp(options, change) {
  options = { ...options, seasonId: options.seasonId || 'legacy' };
  const { db, studentId, seasonId, store = adapter } = options;
  const recordRef = options.operationId ? store.doc(db, 'xpRecords', options.operationId) : store.doc(store.collection(db, 'xpRecords'));
  const studentRef = store.doc(db, 'students', studentId);
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const [snapshot, record] = await Promise.all([transaction.get(studentRef), transaction.get(recordRef)]);
    if (!snapshot.exists()) throw Error('O integrante não foi encontrado.');
    const student = snapshot.data();
    if (record.exists()) {
      if (record.data().studentId !== studentId || record.data().seasonId !== seasonId || record.data().source !== options.source || (options.amount !== undefined && record.data().amount !== options.amount)) throw Error('Este envio já pertence a outro registro.');
      return { student: { ...student, id: studentId }, recordId: recordRef.id, amount: record.data().amount, duplicate: true };
    }
    const now = new Date().toISOString();
    const result = change(student, now, recordRef.id);
    const amount = safeXp(result.amount);
    const xp = safeXp(safeXp(student.xp) + amount);
    const data = { ...result.data, xp };
    const entry = ledger(student, amount, { ...options, ...result.options }, now);
    transaction.update(studentRef, data);
    transaction.set(recordRef, { ...entry, ...result.record });
    if (entry.notifyStudent && amount < 0) {
      const notice = { id: recordRef.id, amount, reason: entry.reason, date: now, createdAt: now };
      transaction.update(studentRef, { xpLossNotifications: [...notifications(student.xpLossNotifications), notice] });
      data.xpLossNotifications = [...notifications(student.xpLossNotifications), notice];
      transaction.set(store.doc(db, 'xpLossRecords', recordRef.id), { ...entry, noticeId: recordRef.id, date: now });
    }
    return { student: { ...student, ...data, id: studentId }, recordId: recordRef.id, amount, duplicate: false };
  });
}

export function adjustStudentXp(options) {
  requireAdmin(options.user);
  safeXp(options.amount);
  if (options.amount < 0 && options.notifyStudent && !options.reason?.trim()) throw Error('Informe o motivo da penalidade.');
  return mutateXp(options, (student) => {
    if (options.approval && (!student.submission || student.submission.status !== 'pending' || !sameValue(student.submission, options.expectedSubmission || null))) throw Error('A entrega mudou. Confira a versão atual antes de aprovar.');
    return { amount: options.amount, data: options.approval ? { submission: { ...student.submission, status: 'approved' } } : {},
      record: options.approval ? { previousSubmission: student.submission || null, approvedSubmission: { ...student.submission, status: 'approved' } } : {} };
  });
}

export async function undoStudentXp({ db, user, studentId, seasonId, recordId, actor, store = adapter }) {
  seasonId ||= 'legacy';
  requireAdmin(user);
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const originalRef = store.doc(db, 'xpRecords', recordId);
    const studentRef = store.doc(db, 'students', studentId);
    const [original, snapshot] = await Promise.all([transaction.get(originalRef), transaction.get(studentRef)]);
    const entry = original.data(); const student = snapshot.data();
    if (!entry || !student || entry.studentId !== studentId || entry.seasonId !== seasonId || entry.source === 'undo') throw Error('Não foi possível localizar o lançamento original.');
    if (entry.undoneAt) return { student: { ...student, id: studentId }, duplicate: true };
    const now = new Date().toISOString(); const amount = -safeXp(entry.amount);
    const data = { xp: safeXp(safeXp(student.xp) + amount), xpLossNotifications: notifications(student.xpLossNotifications).filter((item) => item.id !== recordId) };
    if (entry.badgeChange) {
      const { badgeId, previousBadges, previousAchievements, previousRevision } = entry.badgeChange;
      if (student.badgeRevisions?.[badgeId] !== recordId) throw Error('Esta conquista mudou depois deste lançamento. Confira a versão atual.');
      const revisions = { ...student.badgeRevisions }; delete revisions[badgeId];
      if (previousRevision) revisions[badgeId] = previousRevision;
      data.badgeRevisions = revisions;
      data.badges = [...(student.badges || []).filter((id) => id !== badgeId), ...previousBadges];
      data.badgeAchievements = [...notifications(student.badgeAchievements).filter((item) => item.badgeId !== badgeId), ...previousAchievements];
    }
    if (entry.approvedSubmission && sameValue(student.submission, entry.approvedSubmission)) data.submission = entry.previousSubmission || null;
    transaction.update(studentRef, data);
    transaction.update(originalRef, { undoneAt: now, undoneBy: actor || user.name || 'Técnico' });
    transaction.set(store.doc(db, 'xpRecords', `${recordId}__undo`), ledger(student, amount, { studentId, seasonId, user, actor, source: 'undo', mode: 'undo', reason: `Desfazer: ${entry.sourceLabel || entry.source}`, metadata: { referenceRecordId: recordId } }, now));
    if (entry.notifyStudent && entry.amount < 0) transaction.update(store.doc(db, 'xpLossRecords', recordId), { undoneAt: now, undoneBy: actor || user.name || 'Técnico' });
    return { student: { ...student, ...data, id: studentId }, duplicate: false };
  });
}

export function claimEnglishReward(options) {
  if (!options.user || (options.user.type !== 'admin' && (options.user.studentId || options.user.data?.id) !== options.studentId)) throw Error('Integrante inválido.');
  return mutateXp({ ...options, source: 'english_challenge', sourceLabel: 'Desafio de inglês', mode: 'reward' }, (student) => {
    if (!student.englishChallengeUnlocked || student.status === 'inactive') throw Error('Este desafio já foi resgatado ou não está disponível.');
    return { amount: 20, data: { englishChallengeUnlocked: false } };
  });
}

export function changeStudentBadge(options) {
  requireAdmin(options.user);
  const { badgeId, badgeName, bonus, removing, normalizeBadges = (value) => Array.isArray(value) ? value : [], normalizeAchievementId = (item) => item.badgeId || item.id || '' } = options;
  if (!badgeId || !Number.isSafeInteger(bonus) || bonus < 0) throw Error('Conquista inválida.');
  return mutateXp({ ...options, source: 'badge', sourceLabel: 'Conquista', mode: removing ? 'correction' : 'reward', metadata: { badgeId, badgeName }, reason: `${removing ? 'Remover' : 'Aplicar'}: ${badgeName}` }, (student, now, recordId) => {
    const badges = normalizeBadges(student.badges);
    if (badges.includes(badgeId) !== removing) throw Error('Esta conquista mudou em outro acesso. Atualize antes de continuar.');
    const achievements = notifications(student.badgeAchievements).map((item) => ({ ...item, badgeId: normalizeAchievementId(item) }));
    const previousAchievements = achievements.filter((item) => item.badgeId === badgeId);
    return { amount: removing ? -bonus : bonus, data: {
      badges: removing ? badges.filter((id) => id !== badgeId) : [...badges, badgeId],
      badgeAchievements: removing ? achievements.filter((item) => item.badgeId !== badgeId) : [...achievements, { badgeId, badgeName, awardedAt: now, xpAmount: bonus, xpSource: 'badge' }],
      badgeRevisions: { ...student.badgeRevisions, [badgeId]: recordId },
    }, record: { badgeChange: { badgeId, previousBadges: badges.filter((id) => id === badgeId), previousAchievements, previousRevision: student.badgeRevisions?.[badgeId] || null } } };
  });
}

export function saveSchoolGrades(options) {
  requireAdmin(options.user);
  const stage = SCHOOL_REPORT_STAGE_CONFIG[options.stageId];
  if (!stage) throw Error('Etapa escolar inválida.');
  const grades = Object.fromEntries(Object.entries(options.grades).map(([subject, value]) => {
    if (!SCHOOL_REPORT_SUBJECTS.includes(subject) || parseSchoolGrade(value) === null) throw Error('Confira as notas escolares.');
    return [subject, parseSchoolGrade(value)];
  }));
  return mutateXp({ ...options, source: 'school_report', sourceLabel: 'Boletim escolar', reason: stage.label }, (student, now) => {
    const previous = getSchoolStageRecord(student, options.stageId);
    if (!sameValue(previous?.grades || {}, options.expectedGrades || {})) throw Error('As notas mudaram em outro acesso. Reabra a etapa antes de salvar.');
    const bonusXP = calculateSchoolReportXp(grades);
    return { amount: bonusXP - (previous?.xpApplied ?? calculateSchoolReportXp(previous?.grades || {})), data: { schoolGrades: { ...normalizeSchoolGrades(student.schoolGrades), [options.stageId]: { ...previous, label: stage.label, grades, xpApplied: bonusXP, submittedAt: previous?.submittedAt || now, updatedAt: now } } } };
  });
}

export async function reviewLeaderPenalty({ db, user, seasonId, id, approved, actor, store = adapter }) {
  seasonId ||= 'legacy';
  requireAdmin(user);
  return store.runTransaction(db, async (transaction) => {
    await assertActiveSeason(transaction, db, seasonId, store);
    const ref = store.doc(db, 'leaderPenaltyRequests', id); const request = (await transaction.get(ref)).data();
    if (!request || (request.seasonId && request.seasonId !== seasonId)) throw Error('Solicitação não encontrada nesta temporada.');
    if ((request.status || 'pending') !== 'pending') throw Error('Esta solicitação já foi revisada.');
    const now = new Date().toISOString(); const noticeId = `leader-penalty__${id}`;
    let student; const studentRef = store.doc(db, 'students', request.studentId);
    if (approved) { student = (await transaction.get(studentRef)).data(); if (!student) throw Error('Integrante não encontrado.'); }
    transaction.update(ref, { status: approved ? 'approved' : 'rejected', reviewedAt: now, reviewedBy: actor || user.name || 'Técnico', evidenceImage: store.deleteField(), evidenceFileName: store.deleteField(), evidenceMimeType: store.deleteField(), ...(approved ? { xpLossNoticeId: noticeId } : {}) });
    if (!approved) return { student: null };
    const amount = -Math.abs(safeXp(request.amount || 10));
    const reason = `Penalidade aprovada pelo técnico: ${String(request.reason || '').trim()}`;
    const entry = ledger(student, amount, { studentId: request.studentId, seasonId, user, actor, source: 'penalty', mode: 'penalty', sourceLabel: 'Penalidade', reason, notifyStudent: true }, now);
    const data = { xp: safeXp(safeXp(student.xp) + amount), xpLossNotifications: [...notifications(student.xpLossNotifications), { id: noticeId, amount, reason, date: now, createdAt: now }] };
    transaction.update(studentRef, data);
    transaction.set(store.doc(db, 'xpRecords', noticeId), entry);
    transaction.set(store.doc(db, 'xpLossRecords', noticeId), { ...entry, noticeId, date: now, leaderPenaltyRequestId: id, requestedByLeaderId: request.requestedByLeaderId || '', requestedByLeaderName: request.requestedByLeaderName || '', leaderWeekId: request.leaderWeekId || '', leaderWeekName: request.leaderWeekName || '' });
    return { student: { ...student, ...data, id: request.studentId }, amount };
  });
}
