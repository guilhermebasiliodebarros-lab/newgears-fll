import { isTournamentEligible } from './tournamentEligibility.js';
import { recordDate, recordDay } from './workspaceRecords.js';

export const WEEKLY_EVALUATION_CRITERIA = [
  { id: 'commitment', label: 'Comprometimento' },
  { id: 'teamwork', label: 'Trabalho em equipe' },
  { id: 'initiative', label: 'Iniciativa' },
  { id: 'integration', label: 'Integração dos colegas' },
  { id: 'fllValues', label: 'Valores FLL' },
];

const LEGACY_PRESENTATION_EVALUATION_CRITERIA = [
  { id: 'projectKnowledge', label: 'Domínio do projeto' },
  { id: 'communication', label: 'Comunicação e fala' },
  { id: 'questions', label: 'Respostas às perguntas' },
  { id: 'posture', label: 'Postura' },
  { id: 'teamwork', label: 'Trabalho em equipe' },
  { id: 'inclusion', label: 'Inclusão e participação' },
  { id: 'fllValues', label: 'Valores FLL' },
];

const PRESENTATION_EVALUATION_CRITERIA_V2 = [
  { id: 'projectKnowledge', label: 'Domínio do projeto' },
  { id: 'communication', label: 'Comunicação e fala' },
  { id: 'organization', label: 'Organização da apresentação' },
  { id: 'posture', label: 'Postura' },
  { id: 'examples', label: 'Uso de exemplos e evidências' },
  { id: 'ideaSequence', label: 'Sequência das ideias' },
  { id: 'timeManagement', label: 'Gestão do tempo' },
];

export const PRESENTATION_EVALUATION_CRITERIA_VERSION = 3;
export const PRESENTATION_EVALUATION_CRITERIA = [
  { id: 'projectKnowledge', label: 'Domínio do projeto' },
  { id: 'communication', label: 'Comunicação e fala' },
  { id: 'confidence', label: 'Segurança ao apresentar' },
  { id: 'posture', label: 'Postura' },
  { id: 'fluency', label: 'Fluidez da fala' },
  { id: 'eyeContact', label: 'Contato visual com o público' },
  { id: 'bodyExpression', label: 'Expressão corporal' },
];

// Historical scores keep their original meaning until the presentation is reevaluated.
export const getPresentationEvaluationCriteria = (record) => {
  if (!record || record.criteriaVersion === PRESENTATION_EVALUATION_CRITERIA_VERSION) return PRESENTATION_EVALUATION_CRITERIA;
  if (record.criteriaVersion === 2) return PRESENTATION_EVALUATION_CRITERIA_V2;
  if (!record.criteriaVersion) {
    const hasRatings = (ids) => ids.some((id) => Object.hasOwn(record.ratings || {}, id));
    if (hasRatings(['confidence', 'fluency', 'eyeContact', 'bodyExpression'])) return PRESENTATION_EVALUATION_CRITERIA;
    if (hasRatings(['organization', 'examples', 'ideaSequence', 'timeManagement'])) return PRESENTATION_EVALUATION_CRITERIA_V2;
  }
  return LEGACY_PRESENTATION_EVALUATION_CRITERIA;
};

export const FINAL_SPRINT_RANKING_CATEGORIES = [
  { id: 'report', label: 'Relatório' },
  { id: 'weekly', label: 'Semanais' },
  { id: 'presentation', label: 'Apresentação final' },
  { id: 'xp', label: 'Ranking XP' },
];

export const FINAL_SPRINT_REPORT_NOTE_MAX_LENGTH = 20000;

export const parseFinalSprintReportScore = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  if (value === null || value === undefined || `${value}`.trim() === '') return null;
  const score = Number(`${value}`.trim().replace(',', '.'));
  return Number.isFinite(score) && score >= 0 && score <= 10 ? score : null;
};

const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value);
const safeText = (value) => typeof value === 'string' ? value : '';
export const parseEvaluationRating = (value) => {
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) return null;
  const score = Number(value);
  return Number.isInteger(score) && score >= 0 && score <= 5 ? score : null;
};

export function normalizeEvaluationDraft(type, value) {
  if (!isRecord(value)) return null;
  const ratings = isRecord(value.ratings) ? Object.fromEntries(Object.entries(value.ratings).map(([id, score]) => [id, parseEvaluationRating(score)])) : {};
  return {
    ...value, ratings, strengths: safeText(value.strengths), improvement: safeText(value.improvement),
    note: safeText(value.note), presentedAt: recordDay(value.presentedAt),
    ...(type === 'report' ? { score: typeof value.score === 'string' || (typeof value.score === 'number' && Number.isFinite(value.score)) ? value.score : '' } : {}),
  };
}

export function normalizeEvaluationRecords(values) {
  const latest = new Map();
  for (const [index, value] of (Array.isArray(values) ? values : []).entries()) {
    if (!isRecord(value) || !['weekly', 'presentation', 'report'].includes(value.type)) continue;
    const studentId = typeof value.studentId === 'string' || typeof value.studentId === 'number' ? String(value.studentId) : '';
    if (!studentId) continue;
    const draft = normalizeEvaluationDraft(value.type, value);
    const maximum = value.type === 'report' ? 10 : value.type === 'weekly' ? 25 : 35;
    const numericTotal = typeof value.total === 'number' || (typeof value.total === 'string' && value.total.trim()) ? Number(value.total) : NaN;
    const item = {
      ...value, ...draft, studentId, studentName: safeText(value.studentName),
      weekId: value.type === 'weekly' ? getFinalSprintEvaluationWeekForDate(recordDay(value.weekId))?.id || '' : recordDay(value.weekId), weekLabel: safeText(value.weekLabel),
      evaluatorName: safeText(value.evaluatorName),
      total: Number.isFinite(numericTotal) && numericTotal >= 0 && numericTotal <= maximum ? numericTotal : null,
      createdAt: recordDate(value.createdAt)?.toISOString() || '', updatedAt: recordDate(value.updatedAt)?.toISOString() || '',
    };
    if (item.type === 'presentation' && [1, 2, 3].includes(Number(value.criteriaVersion))) item.criteriaVersion = Number(value.criteriaVersion);
    if (item.status === 'complete' && (item.type === 'report' ? item.total === null : getSavedEvaluationTotal(item, item.type === 'weekly' ? WEEKLY_EVALUATION_CRITERIA : getPresentationEvaluationCriteria(item)) === null)) item.status = 'draft';
    const key = `${studentId}:${value.type}:${value.type === 'weekly' ? item.weekId || value.id || index : ''}`;
    const previous = latest.get(key);
    const stamp = (entry) => entry.updatedAt || entry.createdAt || '';
    if (!previous || stamp(item) > stamp(previous) || (stamp(item) === stamp(previous) && String(item.id || '') > String(previous.id || ''))) latest.set(key, item);
  }
  return [...latest.values()];
}

export const formatEvaluationDate = (value, options = {}) => {
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? recordDay(value) ? recordDate(`${value}T12:00:00`) : null : recordDate(value);
  return date ? date.toLocaleDateString('pt-BR', options) : 'Data não registrada';
};

export const getFinalSprintReportEvaluation = (evaluation, selection) => {
  if (evaluation) return evaluation;
  const total = parseFinalSprintReportScore(selection?.reportScore);
  if (total === null && !selection?.reportNote) return null;
  return {
    type: 'report',
    status: total === null ? 'draft' : 'complete',
    total,
    note: selection?.reportNote || '',
    strengths: '',
    improvement: '',
    legacy: true,
  };
};

const getSavedEvaluationTotal = (record, criteria) => {
  if (record?.status !== 'complete') return null;
  if (record.total !== null && record.total !== undefined && record.total !== '') {
    const total = Number(record.total);
    return Number.isFinite(total) && total >= 0 && total <= criteria.length * 5 ? total : null;
  }
  const ratings = criteria.map(({ id }) => record.ratings?.[id]);
  if (!ratings.every((value) => value !== null && value !== undefined && value !== '' && Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 5)) return null;
  return ratings.reduce((sum, value) => sum + Number(value), 0);
};

export const getFinalSprintTournamentRanking = ({ students = [], evaluations = [], selections = [] }) => {
  students = Array.isArray(students) ? students : [];
  evaluations = normalizeEvaluationRecords(evaluations);
  selections = (Array.isArray(selections) ? selections : []).filter(isRecord);
  const compareStudents = (left, right) => `${left.student.name || ''}`.localeCompare(`${right.student.name || ''}`, 'pt-BR') || String(left.student.id).localeCompare(String(right.student.id));
  const selectionsByStudent = new Map(selections.map((item) => [String(item.studentId), item]));
  const rows = students.filter((item) => item?.id !== null && item?.id !== undefined).map((student) => {
    const studentEvaluations = evaluations.filter((item) => String(item.studentId) === String(student.id));
    const weeklyTotals = studentEvaluations.filter((item) => item.type === 'weekly').map((item) => getSavedEvaluationTotal(item, WEEKLY_EVALUATION_CRITERIA)).filter((total) => total !== null);
    const presentation = studentEvaluations.find((item) => item.type === 'presentation');
    const selection = selectionsByStudent.get(String(student.id));
    const reportEvaluation = getFinalSprintReportEvaluation(studentEvaluations.find((item) => item.type === 'report'), selection);
    const xp = Number(student.xp);
    return {
      student,
      eligibleForTournament: isTournamentEligible(student),
      selection,
      reportEvaluation,
      weeklyCount: weeklyTotals.length,
      values: {
        report: reportEvaluation?.status === 'complete' ? parseFinalSprintReportScore(reportEvaluation.total) : null,
        weekly: weeklyTotals.length ? weeklyTotals.reduce((sum, total) => sum + total, 0) : null,
        presentation: getSavedEvaluationTotal(presentation, getPresentationEvaluationCriteria(presentation)),
        xp: Number.isFinite(xp) ? xp : 0,
      },
      positions: {},
    };
  });

  const candidates = rows.filter((row) => row.eligibleForTournament);
  for (const { id } of FINAL_SPRINT_RANKING_CATEGORIES) {
    const categoryRows = [...candidates].sort((left, right) => {
      if (left.values[id] === null && right.values[id] !== null) return 1;
      if (right.values[id] === null && left.values[id] !== null) return -1;
      return (right.values[id] ?? 0) - (left.values[id] ?? 0) || compareStudents(left, right);
    });
    let position = 0;
    categoryRows.forEach((row, index) => {
      // All category positions, including XP, consider tournament candidates only.
      // Equal evaluation grades share a rank (1, 1, 3); missing grades receive last place.
      if (id === 'xp' || index === 0 || row.values[id] !== categoryRows[index - 1].values[id]) position = index + 1;
      row.positions[id] = row.values[id] === null ? candidates.length : position;
    });
  }

  const rankedRows = candidates.map((row) => ({
    ...row,
    score: FINAL_SPRINT_RANKING_CATEGORIES.reduce((sum, { id }) => sum + row.positions[id], 0),
  })).sort((left, right) => left.score - right.score || compareStudents(left, right));

  const cutoffScore = rankedRows[5]?.score;
  const hasCutoffTie = rankedRows.length > 6 && rankedRows[6].score === cutoffScore;
  const scoreCounts = new Map();
  rankedRows.forEach(({ score }) => scoreCounts.set(score, (scoreCounts.get(score) || 0) + 1));
  let position = 0;
  const ranked = rankedRows.map((row, index) => {
    if (index === 0 || row.score !== rankedRows[index - 1].score) position = index + 1;
    return {
      ...row,
      position,
      inTopSix: position <= 6,
      tied: scoreCounts.get(row.score) > 1,
      inCutoffTie: hasCutoffTie && row.score === cutoffScore,
    };
  });
  const learningOnly = rows.filter((row) => !row.eligibleForTournament).sort(compareStudents).map((row) => ({
    ...row,
    positions: Object.fromEntries(FINAL_SPRINT_RANKING_CATEGORIES.map(({ id }) => [id, null])),
    score: null,
    position: null,
    inTopSix: false,
    tied: false,
    inCutoffTie: false,
  }));
  return [...ranked, ...learningOnly];
};

const weekDateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
const formatDate = (date) => weekDateFormatter.format(date);
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const getFinalSprintEvaluationWeek = (offset = 0, referenceDate = new Date()) => {
  const monday = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 12);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + (offset * 7));
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  return {
    id: dateKey(monday),
    startDate: dateKey(monday),
    endDate: dateKey(friday),
    label: `Semana de ${formatDate(monday)} a ${formatDate(friday)}`,
    isCurrent: offset === 0,
    isFriday: offset === 0 && referenceDate.getDay() === 5,
  };
};

export const getFinalSprintEvaluationWeekForDate = (value, referenceDate = new Date()) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const date = new Date(`${value}T12:00:00`);
  if (!Number.isFinite(date.getTime()) || dateKey(date) !== value) return null;
  const week = getFinalSprintEvaluationWeek(0, date);
  const current = getFinalSprintEvaluationWeek(0, referenceDate);
  return { ...week, isCurrent: week.id === current.id, isFriday: week.id === current.id && referenceDate.getDay() === 5 };
};

export const getStudentTournamentSelection = ({ user, studentId, selections = [], seasonId = 'legacy' }) => {
  const authenticatedId = user?.studentId || user?.data?.id || user?.student?.id;
  if (user?.type !== 'student' || !authenticatedId || String(authenticatedId) !== String(studentId)) return null;
  return selections.find((record) => String(record.studentId) === String(authenticatedId)
    && (record.seasonId || 'legacy') === seasonId && record.selectedForTournament === true) || null;
};

export const getWeeklyEvaluationHistory = (evaluations = [], studentId) => {
  const weeks = new Map();
  for (const record of normalizeEvaluationRecords(evaluations)) {
    if (record.type !== 'weekly' || record.status !== 'complete' || String(record.studentId) !== String(studentId)) continue;
    const week = getFinalSprintEvaluationWeekForDate(record.weekId);
    if (!week || WEEKLY_EVALUATION_CRITERIA.some(({ id }) => record.ratings?.[id] === null || record.ratings?.[id] === undefined || record.ratings?.[id] === '' || !Number.isInteger(Number(record.ratings[id])) || Number(record.ratings[id]) < 0 || Number(record.ratings[id]) > 5)) continue;
    const previous = weeks.get(week.id);
    if (previous && `${previous.updatedAt || ''}` > `${record.updatedAt || ''}`) continue;
    const ratings = Object.fromEntries(WEEKLY_EVALUATION_CRITERIA.map(({ id }) => [id, Number(record.ratings[id])]));
    weeks.set(week.id, { ...record, weekId: week.id, label: week.label, ratings, total: Object.values(ratings).reduce((sum, score) => sum + score, 0) });
  }
  return [...weeks.values()].sort((left, right) => left.weekId.localeCompare(right.weekId));
};

export const buildEvaluationCalendar = ({ students = [], evaluations = [], startDate, pauseWeeks = [], includeWeekId, referenceDate = new Date() }) => {
  const current = getFinalSprintEvaluationWeek(0, referenceDate);
  // Resolve each date once and index the records instead of scanning/parsing the
  // entire evaluation history again for every week in the calendar.
  const dateWeeks = new Map();
  const resolveWeek = (value) => {
    const day = recordDay(value);
    if (!dateWeeks.has(day)) dateWeeks.set(day, getFinalSprintEvaluationWeekForDate(day, referenceDate));
    return dateWeeks.get(day);
  };
  const recordsByWeek = new Map();
  for (const item of normalizeEvaluationRecords(evaluations)) {
    if (item?.type !== 'weekly') continue;
    const week = resolveWeek(item.weekId);
    if (!week) continue;
    if (!recordsByWeek.has(week.id)) recordsByWeek.set(week.id, []);
    recordsByWeek.get(week.id).push(item);
  }
  const candidates = [resolveWeek(startDate)?.id, ...recordsByWeek.keys(), resolveWeek(includeWeekId)?.id].filter((id) => id && id <= current.id);
  const first = candidates.sort()[0] || getFinalSprintEvaluationWeek(-11, referenceDate).id;
  const paused = new Set((Array.isArray(pauseWeeks) ? pauseWeeks : []).map((value) => resolveWeek(value)?.id));
  const activeStudents = (Array.isArray(students) ? students : []).filter((item) => item?.id && item.status !== 'inactive');
  const weeks = [];
  for (let cursor = first; cursor <= current.id;) {
    const week = resolveWeek(cursor);
    const weekRecords = recordsByWeek.get(week.id) || [];
    if (!paused.has(week.id) || weekRecords.length) {
      const eligible = activeStudents.filter((item) => !recordDay(item.joinedAt) || recordDay(item.joinedAt) <= week.endDate);
      const completed = new Set(weekRecords.filter((item) => item.status === 'complete').map((item) => String(item.studentId)));
      const pending = paused.has(week.id) ? [] : eligible.filter((item) => !completed.has(String(item.id)));
      const completeCount = eligible.filter((item) => completed.has(String(item.id))).length;
      weeks.push({ ...week, completeCount, total: eligible.length, pending, status: paused.has(week.id) ? 'paused' : !pending.length && eligible.length ? 'complete' : completeCount ? 'partial' : 'empty' });
    }
    cursor = getFinalSprintEvaluationWeek(1, new Date(`${cursor}T12:00:00`)).id;
  }
  return weeks.reverse();
};
