import { STATION_KEYS } from '../constants/workspace.js';
import { recordDay } from './workspaceRecords.js';

export const ACTIVE_STATUSES = ['present', 'late'];
export const ATTENDANCE_LABELS = { present: 'Presente', late: 'Atraso', absent: 'Falta', excused: 'Falta justificada' };
export const SEASON_COLLECTIONS = ['tasks', 'events', 'finalSprintAssignments', 'finalSprintEvaluations', 'finalSprintSelectionScores', 'finalSprintTournamentDrafts', 'attendanceSessions', 'rotationApplications', 'logbook', 'score_history', 'prototypeIterations', 'expertContacts', 'outreach', 'decisionMatrix', 'xpRecords', 'xpLossRecords', 'leaderPenaltyRequests', 'dailyMoods', 'activityLogs', 'robotTrajectories'];
export const isActiveStudent = (student) => Boolean(student && typeof student === 'object' && student.status !== 'inactive');
export const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
const token = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// One-time fallback for the existing roster. Saved seasons use student IDs.
export function defaultPlanning(students, legacy = false) {
  const findIds = (names) => names.map((name) => students.find((student) => token(student.name) === token(name))?.id).filter(Boolean);
  const captainIds = legacy ? findIds(['Heloise', 'Sofia']) : [];
  const traineeIds = legacy ? findIds(['Antônio Echenique', 'Helena', 'Heloisa']) : [];
  const oldOrder = legacy ? findIds(['Enzo', 'Mariana', 'Lívia', 'Arthur Silva', 'Benjamim', 'Davi Miguel', 'Antônio Yamaguchi']) : [];
  const participantIds = [...new Set([...oldOrder, ...students.filter(isActiveStudent).map((s) => s.id)])].filter((id) => !captainIds.includes(id) && !traineeIds.includes(id));
  return { startDate: legacy ? '2026-02-22' : dateKey(new Date()), totalWeeks: 36, trainingDays: [1, 3], pauseWeeks: [], participantIds, captainIds, traineeIds, reportDueDay: 5 };
}

export function resolvePlanningConfig(config, students, legacy = false) {
  const fallback = defaultPlanning(students, legacy);
  if (!config || typeof config !== 'object') return fallback;
  const ids = (value, defaults) => Array.isArray(value) ? value.filter((id) => typeof id === 'string') : defaults;
  const trainingDays = Array.isArray(config.trainingDays) ? config.trainingDays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6) : [];
  return {
    ...fallback, ...config,
    startDate: recordDay(config.startDate) || fallback.startDate,
    totalWeeks: Number.isInteger(Number(config.totalWeeks)) && Number(config.totalWeeks) >= 1 && Number(config.totalWeeks) <= 52 ? Number(config.totalWeeks) : fallback.totalWeeks,
    trainingDays: trainingDays.length ? trainingDays : fallback.trainingDays,
    pauseWeeks: Array.isArray(config.pauseWeeks) ? config.pauseWeeks.map(recordDay).filter(Boolean) : [],
    participantIds: ids(config.participantIds, fallback.participantIds),
    captainIds: ids(config.captainIds, fallback.captainIds),
    traineeIds: ids(config.traineeIds, fallback.traineeIds),
    reportDueDay: Number.isInteger(config.reportDueDay) && config.reportDueDay >= 0 && config.reportDueDay <= 6 ? config.reportDueDay : fallback.reportDueDay,
  };
}

export function validatePlanning(config, students) {
  if (!validDate(config.startDate)) throw new Error('Informe uma data válida para iniciar o ciclo.');
  if (!Number.isInteger(Number(config.totalWeeks)) || config.totalWeeks < 1 || config.totalWeeks > 52) throw new Error('Escolha entre 1 e 52 semanas.');
  if (!config.trainingDays?.length || config.trainingDays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) throw new Error('Selecione os dias de treino.');
  if (!Number.isInteger(Number(config.reportDueDay)) || config.reportDueDay < 0 || config.reportDueDay > 6) throw new Error('Escolha o dia de entrega dos relatórios.');
  if (config.pauseWeeks?.some((day) => !validDate(day))) throw new Error('Informe as pausas no formato AAAA-MM-DD.');
  const ids = [...config.participantIds, ...config.captainIds, ...config.traineeIds];
  if (!ids.length) throw new Error('Selecione pelo menos um integrante para a escala.');
  if (new Set(ids).size !== ids.length || ids.some((id) => !students.some((s) => s.id === id && isActiveStudent(s)))) throw new Error('Confira os integrantes: cada aluno ativo deve ter apenas um papel.');
  return { ...config, totalWeeks: Number(config.totalWeeks), reportDueDay: Number(config.reportDueDay), pauseWeeks: [...new Set(config.pauseWeeks || [])] };
}

export function buildRotationSchedule(students, config) {
  if (!validDate(config.startDate)) return [];
  const byIds = (ids = []) => ids.map((id) => students.find((s) => s.id === id && isActiveStudent(s))).filter(Boolean);
  const pool = byIds(config.participantIds);
  const captains = byIds(config.captainIds);
  const trainees = byIds(config.traineeIds);
  const schedule = [];
  const cursor = new Date(`${config.startDate}T12:00:00`);
  const pauseDates = config.pauseWeeks || [];
  for (let calendarWeek = 0; calendarWeek < 156 && schedule.length < Number(config.totalWeeks); calendarWeek += 1) {
    const end = new Date(cursor); end.setDate(end.getDate() + 6);
    const startDate = dateKey(cursor); const endDate = dateKey(end);
    if (!pauseDates.some((date) => date >= startDate && date <= endDate)) {
      const index = schedule.length;
      const assignments = { [STATION_KEYS.ENGINEERING]: [], [STATION_KEYS.INNOVATION]: [], [STATION_KEYS.MANAGEMENT]: [...captains] };
      const stations = [STATION_KEYS.ENGINEERING, STATION_KEYS.MANAGEMENT, STATION_KEYS.INNOVATION, STATION_KEYS.ENGINEERING, STATION_KEYS.INNOVATION, STATION_KEYS.ENGINEERING, STATION_KEYS.INNOVATION];
      pool.forEach((_, offset) => assignments[stations[offset % stations.length]].push(pool[(offset + index) % pool.length]));
      if (trainees.length === 3) {
        const cycle = index % 6; const pairIndex = Math.floor(cycle / 2);
        const pair = [trainees[pairIndex], trainees[(pairIndex + 1) % 3]];
        const solo = trainees[(pairIndex + 2) % 3];
        assignments[cycle % 2 === 0 ? STATION_KEYS.ENGINEERING : STATION_KEYS.INNOVATION].push(...pair);
        assignments[cycle % 2 === 0 ? STATION_KEYS.INNOVATION : STATION_KEYS.ENGINEERING].push(solo);
      } else trainees.forEach((student, offset) => assignments[(index + offset) % 2 ? STATION_KEYS.INNOVATION : STATION_KEYS.ENGINEERING].push(student));
      schedule.push({ id: index + 1, weekName: `Semana ${index + 1}`, startDate, endDate, assignments });
    }
    cursor.setDate(cursor.getDate() + 7);
  }
  return schedule;
}

export function sessionEntries(session) {
  if (session?.entries && typeof session.entries === 'object' && !Array.isArray(session.entries)) return Object.fromEntries(Object.entries(session.entries)
    .filter(([, entry]) => entry && Object.hasOwn(ATTENDANCE_LABELS, entry.status))
    .map(([id, entry]) => [id, { ...entry, note: typeof entry.note === 'string' ? entry.note : '' }]));
  return Object.fromEntries([...(Array.isArray(session?.presentIds) ? session.presentIds : []).map((id) => [id, { status: 'present', note: '' }]), ...(Array.isArray(session?.absentIds) ? session.absentIds : []).map((id) => [id, { status: 'absent', note: '' }])]);
}
export function attendanceContribution(entry) {
  return { total: entry && entry.status !== 'excused' ? 1 : 0, attended: ACTIVE_STATUSES.includes(entry?.status) ? 1 : 0, late: entry?.status === 'late' ? 1 : 0, excused: entry?.status === 'excused' ? 1 : 0 };
}
export function taskParticipants(task, students = []) {
  const roster = Array.isArray(students) ? students.filter(Boolean) : [];
  if (Array.isArray(task?.participants)) return task.participants
    .filter((person) => person && typeof person === 'object')
    .map((person) => ({ ...person, id: typeof person.id === 'string' ? person.id : '', name: typeof person.name === 'string' && person.name.trim() ? person.name : roster.find((student) => student.id === person.id)?.name || '' }))
    .filter((person) => typeof person.name === 'string' && person.name.trim());
  return (typeof task?.author === 'string' ? task.author : '').split(',').map((name) => name.trim()).filter((name) => name && !['Tecnico', 'Técnico', 'Equipe'].includes(name)).map((name) => ({ id: roster.find((student) => student.name === name)?.id || '', name }));
}
