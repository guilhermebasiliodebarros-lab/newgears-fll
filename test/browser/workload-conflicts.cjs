const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.WORKFLOW_TEST_BASE || 'http://127.0.0.1:5173';

async function run() {
  const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true });
  let page;
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    context.setDefaultTimeout(12000);
    await context.route('https://**/*', (route) => route.abort());
    await context.route('**/src/firebase.js*', (route) => route.fulfill({ contentType: 'application/javascript', body: 'export const db={};export const auth={currentUser:{getIdToken:async()=>"fixture"}};export const FIREBASE_AUTH_ENABLED=false;' }));
    const mock = await fs.readFile('test/fixtures/workflowFirestoreMock.js', 'utf8');
    await context.route('**/node_modules/.vite/deps/firebase_firestore.js*', (route) => route.fulfill({ contentType: 'application/javascript', body: mock }));
    let reportRequests = 0; let reportBody = '';
    await context.route('**/api/**', (route) => {
      if (route.request().method() === 'PATCH' && new URL(route.request().url()).pathname === '/api/reports/existing') {
        reportBody = route.request().postData(); reportRequests += 1;
        return route.fulfill({ status: reportRequests === 1 ? 409 : 200, json: reportRequests === 1 ? { error: 'O relatório mudou em outro acesso.', code: 'record-conflict', currentRecord: { title: 'Título do outro técnico', description: 'Resumo atualizado por outra pessoa', week: 'Semana 1', reportDate: '2026-11-04', linkedTaskIds: [], revision: 2, fileName: 'atualizado.pdf', fileSize: 50, fileRevision: 2 } } : { report: { id: 'existing', revision: 3 } } });
      }
      return route.fulfill({ status: 503, json: { error: 'API simulada' } });
    });
    await context.addInitScript(() => {
      const student = location.search.includes('fixtureRole=student');
      localStorage.setItem('roboquest_user', JSON.stringify(student ? { type: 'student', data: { id: 'alice', name: 'Alice', username: 'alice' } } : { type: 'admin', name: new URLSearchParams(location.search).get('fixtureTeacher') || 'Fixture' }));
      localStorage.setItem('roboquest_last_activity', String(Date.now()));
    });
    await fs.mkdir("test/artifacts.local", { recursive: true });
    page = await context.newPage(); page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(base);
    await page.getByRole('button', { name: /Cadastros incompletos/ }).click();
    await page.getByRole('button', { name: 'Ver carga de trabalho da equipe', exact: true }).click();
    const panel = page.getByRole('region', { name: 'Distribuição da carga de trabalho' });
    await panel.getByText('2h estimadas · 1h disponíveis por semana', { exact: true }).waitFor();
    await panel.screenshot({ path: 'test/artifacts.local/workload-desktop.png' });
    await panel.getByRole('button', { name: 'Combinar disponibilidade de Alice', exact: true }).click();
    await panel.getByLabel('Disponibilidade combinada de Alice (minutos por semana)').fill('180');
    await panel.getByRole('button', { name: 'Salvar disponibilidade', exact: true }).click();
    await panel.getByText('2h estimadas · 3h disponíveis por semana', { exact: true }).waitFor();
    await page.goto(base);
    await page.getByRole('button', { name: /Tarefas vencidas ou para hoje/ }).click();
    const card = page.locator('[data-task-id=urgent]');
    await card.getByTitle('Editar Tarefa', { exact: true }).click();
    const editor = page.getByRole('dialog', { name: 'Editar tarefa', exact: true });
    await editor.locator('textarea[name=taskText]').fill('Texto salvo no primeiro acesso');
    await editor.locator('select[name=priority]').selectOption('alta');
    await editor.locator('input[name=estimatedMinutes]').fill('60');

    const other = await context.newPage(); other.on('pageerror', (error) => errors.push(error.message));
    await other.goto(base + '/?fixtureTeacher=Second'); await other.getByRole('button', { name: /Tarefas vencidas ou para hoje/ }).click();
    const otherCard = other.locator('[data-task-id=urgent]');
    await otherCard.getByTitle('Editar Tarefa', { exact: true }).click();
    const otherEditor = other.getByRole('dialog', { name: 'Editar tarefa', exact: true });
    await otherEditor.locator('textarea[name=taskText]').fill('Minha proposta no segundo acesso');
    await editor.getByRole('button', { name: 'Salvar detalhes da tarefa', exact: true }).click();
    await page.waitForFunction(() => window.__workflowFixture.get('tasks/urgent').text === 'Texto salvo no primeiro acesso');
    await otherEditor.getByRole('button', { name: 'Salvar detalhes da tarefa', exact: true }).click();
    const comparison = other.getByRole('region', { name: 'Comparar alterações' });
    await comparison.waitFor();
    assert.equal(await otherEditor.locator('textarea[name=taskText]').inputValue(), 'Minha proposta no segundo acesso');
    await comparison.screenshot({ path: 'test/artifacts.local/task-conflict.png' });
    const description = comparison.getByRole('group', { name: 'Descrição', exact: true });
    await description.getByRole('radio', { name: /^Sua versão/ }).check();
    await comparison.getByRole('button', { name: 'Aplicar escolhas ao formulário', exact: true }).click();
    assert.equal(await otherEditor.locator('select[name=priority]').inputValue(), 'alta');
    assert.equal(await otherEditor.locator('input[name=estimatedMinutes]').inputValue(), '60');
    await otherEditor.getByRole('button', { name: 'Salvar detalhes da tarefa', exact: true }).click();
    await other.waitForFunction(() => window.__workflowFixture.get('tasks/urgent').text === 'Minha proposta no segundo acesso');
    assert.equal((await other.evaluate(() => window.__workflowFixture.get('tasks/urgent'))).priority, 'alta');

    await page.goto(base);
    await page.getByRole('button', { name: /Avaliações semanais pendentes/ }).click();
    const period = await page.getByLabel('Semana da avaliação', { exact: true }).inputValue();
    const evaluationPath = `finalSprintEvaluations/legacy__weekly__alice__${period}`;
    const firstEvaluation = page.locator('[id^="evaluation-weekly-alice__"]');
    await firstEvaluation.locator('summary').first().click();
    for (const label of ['Comprometimento', 'Trabalho em equipe', 'Iniciativa', 'Integração dos colegas', 'Valores FLL']) await firstEvaluation.getByRole('button', { name: new RegExp(`^${label}: 4`) }).click();
    await firstEvaluation.locator('textarea').nth(0).fill('Ponto forte do primeiro técnico');
    await firstEvaluation.locator('textarea').nth(1).fill('Praticar a explicação dos testes');
    await other.goto(`${base}/?fixtureTeacher=Second`);
    await other.getByRole('button', { name: /Avaliações semanais pendentes/ }).click();
    const secondEvaluation = other.locator('[id^="evaluation-weekly-alice__"]');
    await secondEvaluation.locator('summary').first().click();
    for (const label of ['Comprometimento', 'Trabalho em equipe', 'Iniciativa', 'Integração dos colegas', 'Valores FLL']) await secondEvaluation.getByRole('button', { name: new RegExp(`^${label}: 4`) }).click();
    await secondEvaluation.locator('textarea').nth(0).fill('Ponto forte escrito no segundo acesso');
    await secondEvaluation.locator('textarea').nth(1).fill('Meu próximo passo para a semana');
    await firstEvaluation.getByRole('button', { name: 'Salvar avaliação', exact: true }).click();
    await page.waitForFunction((path) => window.__workflowFixture.get(path)?.revision === 1, evaluationPath);
    await secondEvaluation.getByRole('button', { name: 'Salvar avaliação', exact: true }).click();
    const evaluationComparison = other.getByRole('region', { name: 'Comparar alterações' });
    await evaluationComparison.waitFor();
    await evaluationComparison.getByRole('group', { name: 'Pontos fortes', exact: true }).getByRole('radio', { name: /^Versão atual no sistema/ }).check();
    await evaluationComparison.getByRole('group', { name: 'Próximo ponto a melhorar', exact: true }).getByRole('radio', { name: /^Sua versão/ }).check();
    await evaluationComparison.getByRole('button', { name: 'Aplicar escolhas ao formulário', exact: true }).click();
    assert.equal(await secondEvaluation.locator('textarea').nth(0).inputValue(), 'Ponto forte do primeiro técnico');
    assert.equal(await secondEvaluation.locator('textarea').nth(1).inputValue(), 'Meu próximo passo para a semana');
    await secondEvaluation.getByRole('button', { name: 'Salvar avaliação', exact: true }).click();
    await other.waitForFunction((path) => window.__workflowFixture.get(path)?.revision === 2, evaluationPath);

    await page.goto(`${base}/?fixtureRole=student`);
    const guide = page.getByRole('region', { name: 'Roteiro para novos integrantes' });
    await guide.getByText('0/4 etapas marcadas · progresso deste dispositivo', { exact: true }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    await guide.screenshot({ path: 'test/artifacts.local/onboarding-mobile.png' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await guide.getByLabel('Conhecer minha estação', { exact: true }).check();
    await page.reload();
    assert.equal(await guide.getByLabel('Conhecer minha estação', { exact: true }).isChecked(), true);
    await guide.getByRole('button', { name: 'Abrir minhas tarefas', exact: true }).click();
    assert.equal(await page.getByRole('combobox', { name: 'Filtrar tarefas por pendência' }).inputValue(), 'mine');
    await page.goto(`${base}/?fixtureRole=student`);
    await guide.getByRole('button', { name: 'Escrever no diário', exact: true }).click();
    await page.waitForFunction(() => document.activeElement?.matches('[data-draft-kind="logbook"] textarea[name=entry]'));

    await page.goto(`${base}/test/fixtures/workflow-improvements.html?area=reports`);
    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    const form = page.locator('[data-draft-kind=weekly-report]');
    await form.locator('input[name=title]').fill('Meu título do relatório');
    await form.locator('input[type=file]').setInputFiles({ name: 'minha-versao.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nFixture') });
    await form.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    const reportComparison = form.getByRole('region', { name: 'Comparar alterações' });
    await reportComparison.waitFor();
    await reportComparison.getByRole('group', { name: 'Título', exact: true }).getByRole('radio', { name: /^Sua versão/ }).check();
    await reportComparison.getByRole('group', { name: 'Documento anexado', exact: true }).getByRole('radio', { name: /^Versão atual no sistema/ }).check();
    await reportComparison.getByRole('button', { name: 'Aplicar escolhas ao formulário', exact: true }).click();
    assert.equal(await form.locator('input[name=title]').inputValue(), 'Meu título do relatório');
    assert.equal(await form.locator('textarea[name=description]').inputValue(), 'Resumo atualizado por outra pessoa');
    assert.equal(await form.locator('input[type=file]').evaluate((input) => input.files.length), 0);
    await form.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await page.getByText('Relatório atualizado.', { exact: true }).waitFor();
    assert.match(reportBody, /name="expectedRevision"\r?\n\r?\n2/);
    assert.doesNotMatch(reportBody, /filename="minha-versao.pdf"/);
    assert.deepEqual(errors, []);
    console.log('ok - workload, task conflicts across two tabs, report conflict recovery and member onboarding');
  } catch (error) { console.error('Current screen:', await page?.locator('body').innerText()); throw error; }
  finally { await browser.close(); }
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
