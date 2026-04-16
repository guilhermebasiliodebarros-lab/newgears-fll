import { runProjectSummaryTests } from './projectSummary.test.js';
import { runAppStructureTests } from './appStructure.test.js';

const suites = [
  { name: 'projectSummary', run: runProjectSummaryTests },
  { name: 'appStructure', run: runAppStructureTests }
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
