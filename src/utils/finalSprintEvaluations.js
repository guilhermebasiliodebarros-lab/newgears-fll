export const WEEKLY_EVALUATION_CRITERIA = [
  { id: 'commitment', label: 'Comprometimento' },
  { id: 'teamwork', label: 'Trabalho em equipe' },
  { id: 'initiative', label: 'Iniciativa' },
  { id: 'integration', label: 'Integração dos colegas' },
  { id: 'fllValues', label: 'Valores FLL' },
];

export const PRESENTATION_EVALUATION_CRITERIA = [
  { id: 'projectKnowledge', label: 'Domínio do projeto' },
  { id: 'communication', label: 'Comunicação e fala' },
  { id: 'questions', label: 'Respostas às perguntas' },
  { id: 'posture', label: 'Postura' },
  { id: 'teamwork', label: 'Trabalho em equipe' },
  { id: 'inclusion', label: 'Inclusão e participação' },
  { id: 'fllValues', label: 'Valores FLL' },
];

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
      selection,
      reportEvaluation,
      weeklyCount: weeklyTotals.length,
      values: {
        report: reportEvaluation?.status === 'complete' ? parseFinalSprintReportScore(reportEvaluation.total) : null,
        weekly: weeklyTotals.length ? weeklyTotals.reduce((sum, total) => sum + total, 0) : null,
        presentation: getSavedEvaluationTotal(presentation, PRESENTATION_EVALUATION_CRITERIA),
        xp: Number.isFinite(xp) ? xp : 0,
      },
      positions: {},
    };
  });

  for (const { id } of FINAL_SPRINT_RANKING_CATEGORIES) {
    const categoryRows = [...rows].sort((left, right) => {
      if (left.values[id] === null && right.values[id] !== null) return 1;
      if (right.values[id] === null && left.values[id] !== null) return -1;
      return (right.values[id] ?? 0) - (left.values[id] ?? 0) || compareStudents(left, right);
    });
    let position = 0;
    categoryRows.forEach((row, index) => {
      // XP follows the positions displayed in RankingPanel, including its name tiebreak.
      // Equal evaluation grades share a rank (1, 1, 3); missing grades receive last place.
      if (id === 'xp' || index === 0 || row.values[id] !== categoryRows[index - 1].values[id]) position = index + 1;
      row.positions[id] = row.values[id] === null ? rows.length : position;
    });
  }

  const rankedRows = rows.map((row) => ({
    ...row,
    score: FINAL_SPRINT_RANKING_CATEGORIES.reduce((sum, { id }) => sum + row.positions[id], 0),
  })).sort((left, right) => left.score - right.score || compareStudents(left, right));

  const cutoffScore = rankedRows[5]?.score;
  const hasCutoffTie = rankedRows.length > 6 && rankedRows[6].score === cutoffScore;
  const scoreCounts = new Map();
  rankedRows.forEach(({ score }) => scoreCounts.set(score, (scoreCounts.get(score) || 0) + 1));
  let position = 0;
  return rankedRows.map((row, index) => {
    if (index === 0 || row.score !== rankedRows[index - 1].score) position = index + 1;
    return {
      ...row,
      position,
      inTopSix: position <= 6,
      tied: scoreCounts.get(row.score) > 1,
      inCutoffTie: hasCutoffTie && row.score === cutoffScore,
    };
  });
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
