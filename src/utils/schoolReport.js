export const SCHOOL_REPORT_SUBJECTS = [
  'Matematica',
  'Portugues',
  'Ciencias',
  'Historia',
  'Geografia',
  'Ingles',
  'Artes',
  'Ed. Fisica',
  'Robotica',
  'STEAM'
];

export const SCHOOL_REPORT_STAGE_CONFIG = {
  etapa1: {
    id: 'etapa1',
    label: '1a etapa',
    periodLabel: 'fechamento do fim de abril'
  },
  etapa2: {
    id: 'etapa2',
    label: '2a etapa',
    periodLabel: 'fechamento de meados de setembro'
  }
};

export const calculateSchoolReportXp = (grades = {}) =>
  Object.values(grades).reduce((total, rawGrade) => {
    const grade = parseFloat(rawGrade);

    if (Number.isNaN(grade)) return total;
    if (grade === 10) return total + 10;
    if (grade >= 9.0) return total + 7;
    if (grade >= 8.0) return total + 5;

    return total - 2;
  }, 0);

export const normalizeSchoolGrades = (schoolGrades) => {
  if (!schoolGrades || typeof schoolGrades !== 'object') return {};

  const hasSeparatedStages = Object.values(SCHOOL_REPORT_STAGE_CONFIG).some((stage) => {
    const stageRecord = schoolGrades?.[stage.id];
    return Boolean(stageRecord && typeof stageRecord === 'object');
  });

  if (hasSeparatedStages) return schoolGrades;

  return {
    etapa1: {
      grades: schoolGrades,
      xpApplied: calculateSchoolReportXp(schoolGrades),
      submittedAt: null,
      updatedAt: null,
      migratedFromLegacy: true
    }
  };
};

export const getSchoolStageRecord = (studentOrGrades, stageId) => {
  const schoolGrades = studentOrGrades?.schoolGrades ?? studentOrGrades;
  const normalized = normalizeSchoolGrades(schoolGrades);
  return normalized?.[stageId] || null;
};
