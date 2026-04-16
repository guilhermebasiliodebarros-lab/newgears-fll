export const PROJECT_MAIN_DOC_ID = 'main';

export const DEFAULT_PROJECT_SUMMARY = {
  title: 'Nome do Projeto',
  problem: '',
  solution: '',
  sharing: '',
  image: null
};

export const resolveProjectSummary = ({
  mainSummary = null,
  legacySummaries = [],
  defaultSummary = DEFAULT_PROJECT_SUMMARY
} = {}) => {
  if (mainSummary) return mainSummary;

  if (Array.isArray(legacySummaries) && legacySummaries.length > 0) {
    return legacySummaries[0];
  }

  return defaultSummary;
};
