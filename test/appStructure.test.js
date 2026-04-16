import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appFile = new URL('../src/App.jsx', import.meta.url);

const extractedViews = [
  'StrategyView',
  'RoundsView',
  'LogbookView',
  'KanbanView',
  'AgendaView'
];

export async function runAppStructureTests() {
  const source = await readFile(appFile, 'utf8');

  for (const viewName of extractedViews) {
    assert.match(source, new RegExp(`import ${viewName} from './views/${viewName}'`));
    assert.doesNotMatch(source, new RegExp(`const ${viewName}\\s*=`));
    assert.match(source, new RegExp(`<${viewName} \\{\\.\\.\\.[^}]+\\} ?/>`));
  }

  assert.match(source, /PROJECT_MAIN_DOC_ID/);
  assert.match(source, /doc\(db,\s*"project",\s*PROJECT_MAIN_DOC_ID\)/);
  assert.match(source, /setDoc\(doc\(db,\s*"project",\s*PROJECT_MAIN_DOC_ID\),\s*projectData,\s*\{\s*merge:\s*true\s*\}\)/);
  assert.match(source, /setProjectSummary\(\{\s*\.\.\.projectData,\s*id:\s*PROJECT_MAIN_DOC_ID\s*\}\)/);
}
