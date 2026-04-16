import assert from 'node:assert/strict';

import {
  DEFAULT_PROJECT_SUMMARY,
  PROJECT_MAIN_DOC_ID,
  resolveProjectSummary
} from '../src/utils/projectSummary.js';

export function runProjectSummaryTests() {
  assert.equal(PROJECT_MAIN_DOC_ID, 'main');
 
  const mainSummary = { id: 'main', title: 'Projeto principal' };
  const legacySummaries = [{ id: 'legacy-1', title: 'Projeto antigo' }];

  assert.equal(
    resolveProjectSummary({ mainSummary, legacySummaries }),
    mainSummary
  );

  const fallbackLegacySummaries = [
    { id: 'legacy-1', title: 'Projeto antigo' },
    { id: 'legacy-2', title: 'Projeto antigo 2' }
  ];

  assert.equal(
    resolveProjectSummary({ legacySummaries: fallbackLegacySummaries }),
    fallbackLegacySummaries[0]
  );

  assert.deepEqual(resolveProjectSummary(), DEFAULT_PROJECT_SUMMARY);
}
