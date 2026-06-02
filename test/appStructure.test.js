import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appFile = new URL('../src/App.jsx', import.meta.url);
const publicTeamViewFile = new URL('../src/views/PublicTeamView.jsx', import.meta.url);
const publicTvModeViewFile = new URL('../src/views/PublicTvModeView.jsx', import.meta.url);

const extractedViews = [
  'StrategyView',
  'RoundsView',
  'LogbookView',
  'KanbanView',
  'AgendaView'
];

export async function runAppStructureTests() {
  const source = await readFile(appFile, 'utf8');
  const publicTeamViewSource = await readFile(publicTeamViewFile, 'utf8');
  const publicTvModeViewSource = await readFile(publicTvModeViewFile, 'utf8');

  for (const viewName of extractedViews) {
    assert.match(source, new RegExp(`import ${viewName} from './views/${viewName}'`));
    assert.doesNotMatch(source, new RegExp(`const ${viewName}\\s*=`));
    assert.match(source, new RegExp(`<${viewName} \\{\\.\\.\\.[^}]+\\} ?/>`));
  }

  assert.match(source, /PROJECT_MAIN_DOC_ID/);
  assert.match(source, /doc\(db,\s*"project",\s*PROJECT_MAIN_DOC_ID\)/);
  assert.match(source, /setDoc\(doc\(db,\s*"project",\s*PROJECT_MAIN_DOC_ID\),\s*projectData,\s*\{\s*merge:\s*true\s*\}\)/);
  assert.match(source, /setProjectSummary\(\{\s*\.\.\.projectData,\s*id:\s*PROJECT_MAIN_DOC_ID\s*\}\)/);
  assert.match(source, /import ActivityHistoryView from '\.\/views\/ActivityHistoryView'/);
  assert.match(source, /import PublicTeamView from '\.\/views\/PublicTeamView'/);
  assert.match(source, /import PublicTvModeView from '\.\/views\/PublicTvModeView'/);
  assert.match(source, /collection\(db,\s*"activityLogs"\)/);
  assert.match(source, /orderBy\("createdAt",\s*"desc"\)/);
  assert.match(source, /<PublicTeamView/);
  assert.match(source, /<PublicTvModeView/);
  assert.match(source, /<ActivityHistoryView activityLogs=\{activityLogs\}/);
  assert.doesNotMatch(publicTeamViewSource, /\.username|\.password|\.xp/);
  assert.doesNotMatch(publicTvModeViewSource, /\.username|\.password|\.xp/);
}
