import { runProjectSummaryTests } from './projectSummary.test.js';
import { runAppStructureTests } from './appStructure.test.js';
import { runSchoolReportTests } from './schoolReport.test.js';
import { runPublicShowcaseTests } from './publicShowcase.test.js';
import { runWeeklyReportsTests } from './weeklyReports.test.js';
import { runTeamProcessesTests } from './teamProcesses.test.js';
import { runOperationsTests } from './operations.test.js';
import { runFinalSprintEvaluationsTests } from './finalSprintEvaluations.test.js';
import { runGearShopTests } from './gearShop.test.js';

const suites = [
  { name: 'projectSummary', run: runProjectSummaryTests },
  { name: 'appStructure', run: runAppStructureTests },
  { name: 'schoolReport', run: runSchoolReportTests },
  { name: 'publicShowcase', run: runPublicShowcaseTests },
  { name: 'weeklyReports', run: runWeeklyReportsTests },
  { name: 'teamProcesses', run: runTeamProcessesTests },
  { name: 'operations', run: runOperationsTests },
  { name: 'finalSprintEvaluations', run: runFinalSprintEvaluationsTests },
  { name: 'gearShop', run: runGearShopTests }
];

let failures = 0;

for (const suite of suites) {
  try {
    await suite.run();
    console.log(`ok - ${suite.name}`);
  } catch (error) {
    failures += 1;
    console.error(`not ok - ${suite.name}`);
    console.error(error);
  }
}

if (failures > 0) {
  console.error(`\n${failures} suite(s) falharam.`);
  process.exitCode = 1;
} else {
  console.log(`\n${suites.length} suite(s) ok.`);
}
