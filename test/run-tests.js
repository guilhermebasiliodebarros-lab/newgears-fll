import { runProjectSummaryTests } from './projectSummary.test.js';
import { runAppStructureTests } from './appStructure.test.js';
import { runSchoolReportTests } from './schoolReport.test.js';
import { runPublicShowcaseTests } from './publicShowcase.test.js';
import { runWeeklyReportsTests } from './weeklyReports.test.js';
import { runTeamProcessesTests } from './teamProcesses.test.js';
import { runOperationsTests } from './operations.test.js';
import { runFinalSprintEvaluationsTests } from './finalSprintEvaluations.test.js';
import { runGearShopTests } from './gearShop.test.js';
import { runGearEvolutionTests } from './gearEvolution.test.js';
import { runFormDraftTests } from './formDrafts.test.js';
import { runGearCheckInTests } from './gearCheckIn.test.js';
import { runGiroSpeechTests } from './giroSpeech.test.js';
import { runGearStudioTests } from './gearStudio.test.js';
import { runGearWorkshopTests } from './gearWorkshop.test.js';
import { runGiroAITests } from './giroAI.test.js';
import { runGiroKnowledgeTests } from './giroKnowledge.test.js';
import { runGiroNvidiaTests } from './giroNvidia.test.js';
import { runGiroImprovementsTests } from './giroImprovements.test.js';
import { runGearTechnicianTests } from './gearTechnician.test.js';
import { runGearRefundsTests } from './gearRefunds.test.js';
import { runGearGrantsTests } from './gearGrants.test.js';
import { runTaskGearRewardsTests } from './taskGearRewards.test.js';
import { runRobotTrajectoryTests } from './robotTrajectory.test.js';
import { runTrajectoryAdvancedTests } from './trajectoryAdvanced.test.js';
import { runWorkspaceReliabilityTests } from './workspaceReliability.test.js';
import { runEvaluationReliabilityTests } from './evaluationReliability.test.js';
import { runShopExperienceTests } from './shopExperience.test.js';
import { runClientDiagnosticsTests } from './clientDiagnostics.test.js';
import { runGearAccessoriesTests } from './gearAccessories.test.js';

const suites = [
  { name: 'projectSummary', run: runProjectSummaryTests },
  { name: 'appStructure', run: runAppStructureTests },
  { name: 'schoolReport', run: runSchoolReportTests },
  { name: 'publicShowcase', run: runPublicShowcaseTests },
  { name: 'weeklyReports', run: runWeeklyReportsTests },
  { name: 'teamProcesses', run: runTeamProcessesTests },
  { name: 'operations', run: runOperationsTests },
  { name: 'finalSprintEvaluations', run: runFinalSprintEvaluationsTests },
  { name: 'gearShop', run: runGearShopTests },
  { name: 'gearEvolution', run: runGearEvolutionTests },
  { name: 'formDrafts', run: runFormDraftTests },
  { name: 'gearCheckIn', run: runGearCheckInTests },
  { name: 'giroSpeech', run: runGiroSpeechTests },
  { name: 'gearStudio', run: runGearStudioTests },
  { name: 'gearWorkshop', run: runGearWorkshopTests },
  { name: 'giroAI', run: runGiroAITests },
  { name: 'giroKnowledge', run: runGiroKnowledgeTests },
  { name: 'giroNvidia', run: runGiroNvidiaTests },
  { name: 'giroImprovements', run: runGiroImprovementsTests },
  { name: 'gearTechnician', run: runGearTechnicianTests },
  { name: 'gearRefunds', run: runGearRefundsTests },
  { name: 'gearGrants', run: runGearGrantsTests },
  { name: 'taskGearRewards', run: runTaskGearRewardsTests },
  { name: 'robotTrajectory', run: runRobotTrajectoryTests },
  { name: 'trajectoryAdvanced', run: runTrajectoryAdvancedTests },
  { name: 'workspaceReliability', run: runWorkspaceReliabilityTests },
  { name: 'evaluationReliability', run: runEvaluationReliabilityTests },
  { name: 'shopExperience', run: runShopExperienceTests },
  { name: 'clientDiagnostics', run: runClientDiagnosticsTests },
  { name: 'gearAccessories', run: runGearAccessoriesTests }
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
