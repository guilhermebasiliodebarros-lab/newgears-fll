import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appFile = new URL('../src/App.jsx', import.meta.url);
const publicTeamViewFile = new URL('../src/views/PublicTeamView.jsx', import.meta.url);
const publicTvModeViewFile = new URL('../src/views/PublicTvModeView.jsx', import.meta.url);
const publicShowcaseAdminViewFile = new URL('../src/views/PublicShowcaseAdminView.jsx', import.meta.url);
const innovationStrategyPanelFile = new URL('../src/components/InnovationStrategyPanel.jsx', import.meta.url);

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
  const publicShowcaseAdminViewSource = await readFile(publicShowcaseAdminViewFile, 'utf8');
  const innovationStrategyPanelSource = await readFile(innovationStrategyPanelFile, 'utf8');

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
  assert.match(source, /import PublicShowcaseAdminView from '\.\/views\/PublicShowcaseAdminView'/);
  assert.match(source, /collection\(db,\s*"activityLogs"\)/);
  assert.match(source, /collection\(db,\s*"expertContacts"\)/);
  assert.match(source, /collection\(db,\s*"publicGalleryPhotos"\)/);
  assert.match(source, /doc\(db,\s*"settings",\s*"public_showcase"\)/);
  assert.match(source, /orderBy\("createdAt",\s*"desc"\)/);
  assert.match(source, /<PublicTeamView/);
  assert.match(source, /<PublicTvModeView/);
  assert.match(source, /<ActivityHistoryView activityLogs=\{activityLogs\}/);
  assert.doesNotMatch(publicTeamViewSource, /\.username|\.password|\.xp/);
  assert.doesNotMatch(publicTvModeViewSource, /\.username|\.password|\.xp/);
  assert.doesNotMatch(publicTvModeViewSource, /(?:text|border|bg)-yellow-/);
  assert.match(publicTvModeViewSource, /newgears-public-tv-backdrop/);
  assert.match(publicTvModeViewSource, /newgears-public-tv-slide/);
  assert.match(publicTvModeViewSource, /<PublicQrCodes settings=\{showcaseSettings\}/);
  assert.match(publicShowcaseAdminViewSource, /buildTrainingGallery\(\{\s*galleryPhotos,\s*robotVersions,\s*attachments,\s*includeHidden:\s*true,\s*prioritizeFeatured:\s*false\s*\}\)/);
  assert.match(publicShowcaseAdminViewSource, /draggable/);
  assert.match(publicShowcaseAdminViewSource, /onDrop=\{\(event\) => handleDrop\(event,\s*photo\)\}/);
  assert.match(source, /onReorderPhotos=\{handleReorderGalleryPhotos\}/);
  assert.match(source, /modal\.type === 'expertContactForm'/);
  assert.match(source, /accept="image\/\*,application\/pdf"/);
  assert.match(source, /convertExpertContactEvidence/);
  assert.match(innovationStrategyPanelSource, /Contatos realizados/);
  assert.match(innovationStrategyPanelSource, /Taxa de resposta/);
  assert.match(innovationStrategyPanelSource, /Evidencias:/);
  assert.match(innovationStrategyPanelSource, /download=\{contact\.evidenceName/);
}
