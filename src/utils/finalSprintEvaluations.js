import { isTournamentEligible } from './tournamentEligibility.js';

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

export const parseFinalSprintReportScore = (value) => {
  if (value === null || value === undefined || `${value}`.trim() === '') return null;
  const score = Number(`${value}`.trim().replace(',', '.'));
  return Number.isFinite(score) && score >= 0 && score <= 10 ? score : null;
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

const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
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
  for (const record of evaluations) {
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
  const records = evaluations.filter((item) => item.type === 'weekly' && getFinalSprintEvaluationWeekForDate(item.weekId));
  const candidates = [getFinalSprintEvaluationWeekForDate(startDate)?.id, ...records.map((item) => getFinalSprintEvaluationWeekForDate(item.weekId).id), getFinalSprintEvaluationWeekForDate(includeWeekId)?.id].filter((id) => id && id <= current.id);
  const first = candidates.sort()[0] || getFinalSprintEvaluationWeek(-11, referenceDate).id;
  const paused = new Set(pauseWeeks.map((value) => getFinalSprintEvaluationWeekForDate(value)?.id));
  const activeStudents = students.filter((item) => item?.id && item.status !== 'inactive');
  const weeks = [];
  for (let cursor = first; cursor <= current.id;) {
    const week = getFinalSprintEvaluationWeekForDate(cursor, referenceDate);
    const weekRecords = records.filter((item) => getFinalSprintEvaluationWeekForDate(item.weekId).id === week.id);
    if (!paused.has(week.id) || weekRecords.length) {
      const eligible = activeStudents.filter((item) => !item.joinedAt || `${item.joinedAt}`.slice(0, 10) <= week.endDate);
      const completed = new Set(weekRecords.filter((item) => item.status === 'complete').map((item) => String(item.studentId)));
      const pending = paused.has(week.id) ? [] : eligible.filter((item) => !completed.has(String(item.id)));
      const completeCount = eligible.filter((item) => completed.has(String(item.id))).length;
      weeks.push({ ...week, completeCount, total: eligible.length, pending, status: paused.has(week.id) ? 'paused' : !pending.length && eligible.length ? 'complete' : completeCount ? 'partial' : 'empty' });
    }
    cursor = getFinalSprintEvaluationWeek(1, new Date(`${cursor}T12:00:00`)).id;
  }
  return weeks.reverse();
};
