// Start npm run dev. PLAYWRIGHT_MODULE may point to an existing installation.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

async function run() {
  const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true });
  const errors = [];
  let page;
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await context.route('https://**/*', (route) => route.abort());
    await context.route('**/src/firebase.js*', (route) => route.fulfill({ contentType: 'application/javascript', body: 'export const db={};export const auth={currentUser:{getIdToken:async()=>"fixture-token"}};export const FIREBASE_AUTH_ENABLED=false;' }));
    let reportMode = 'failure'; let postedReport = '';
    await context.route('**/api/**', async (route) => {
      if (route.request().method() === 'POST' && new URL(route.request().url()).pathname === '/api/reports') {
        postedReport = route.request().postData();
        return route.fulfill({ status: reportMode === 'failure' ? 503 : 201, json: reportMode === 'failure' ? { error: 'Falha simulada no envio do relatório' } : { report: { id: 'fixture-report' } } });
      }
      return route.fulfill({ status: 503, json: { error: 'API simulada' } });
    });
    context.setDefaultTimeout(10000);
    page = await context.newPage();
    page.on('pageerror', (error) => { errors.push(error.message); console.error('Browser error:', error.message); });
    const base = process.env.WORKFLOW_TEST_BASE || 'http://127.0.0.1:5173';
    const url = `${base}/test/fixtures/workflow-improvements.html`;
    await page.goto(url);
    await page.locator('textarea[name=learning]').fill('Aprendemos a testar sensores.');
    await page.getByLabel('Sensor validado', { exact: true }).check();
    assert.equal(await page.getByLabel('Resultado de outra pessoa', { exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Inserir resultados no texto', exact: true }).click();
    await page.reload();
    await page.getByText(/Rascunho (recuperado|salvo) neste dispositivo/).waitFor();
    assert.match(await page.locator('textarea[name=learning]').inputValue(), /Dez testes realizados/);
    assert.equal(await page.getByLabel('Sensor validado', { exact: true }).isChecked(), true, 'linked tasks survive reload');
    await page.getByRole('button', { name: 'Simular falha', exact: true }).click();
    await page.getByRole('button', { name: 'Enviar registro', exact: true }).click();
    await page.getByText('Falha simulada de conexão', { exact: true }).waitFor();
    assert.match(await page.locator('textarea[name=learning]').inputValue(), /Dez testes/);
    await page.getByRole('button', { name: 'Simular espera', exact: true }).click();
    await page.getByRole('button', { name: 'Enviar registro', exact: true }).click();
    await page.getByText('Enviando… Aguarde a confirmação do sistema.', { exact: true }).waitFor();
    await page.locator('textarea[name=learning]').fill('Alteração feita durante o envio');
    await page.evaluate(() => window.finishWorkflowSave());
    await page.getByText(/Suas alterações mais recentes continuam como rascunho/).waitFor();
    assert.equal(await page.locator('textarea[name=learning]').inputValue(), 'Alteração feita durante o envio');
    await page.getByRole('button', { name: 'Simular sucesso', exact: true }).click();
    await page.getByRole('button', { name: 'Enviar registro', exact: true }).click();
    await page.getByText('Confirmado no sistema. Nenhum rascunho pendente.', { exact: true }).waitFor();
    assert.equal(await page.locator('textarea[name=learning]').inputValue(), '');

    await page.getByRole('button', { name: 'access', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByText('2 tarefa(s) aberta(s)', { exact: true }).waitFor();
    await dialog.getByLabel('Responsável por Montagem para hoje', { exact: true }).selectOption('bob');
    await dialog.getByRole('button', { name: 'Confirmar inativação', exact: true }).click();
    assert.equal((await page.evaluate(() => window.lastHandoff))[2].tasks[0].replacementId, 'bob');

    await page.getByRole('button', { name: 'tasks', exact: true }).click();
    for (const [filter, expected] of [['blocked', 'blocked'], ['urgent', 'urgent'], ['review', 'review']]) {
      await page.getByRole('button', { name: `Filtrar ${filter}`, exact: true }).click();
      await page.locator(`[data-task-id="${expected}"]`).waitFor();
      assert.deepEqual(await page.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.dataset.taskId)), [expected]);
    }
    await page.getByRole('button', { name: 'Atualizar tarefa', exact: true }).click();
    assert.equal(await page.getByRole('combobox', { name: 'Filtrar tarefas por pendência' }).inputValue(), 'mine');
    await page.getByRole('button', { name: 'Registrar descoberta', exact: true }).click();
    await page.waitForFunction(() => document.activeElement?.matches('[data-draft-kind="logbook"] textarea[name="entry"]'));
    await page.getByLabel('Sensor validado', { exact: true }).check();
    await page.getByRole('button', { name: 'Inserir resultados no texto', exact: true }).click();
    await page.getByRole('button', { name: 'Salvar registro', exact: true }).click();
    assert.equal(JSON.parse((await page.evaluate(() => window.lastDiary)).linkedTaskIds)[0], 'done');
    await page.getByRole('button', { name: 'Registrar teste', exact: true }).click();
    await page.waitForFunction(() => document.activeElement?.matches('[data-draft-kind="full-round-test"] input[name="score"]'));

    await page.getByRole('button', { name: 'students', exact: true }).click();
    assert.equal(await page.getByLabel('Mostrar somente cadastros incompletos').isChecked(), true);
    await page.getByText('Mostrando 1 de 2 alunos', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'evaluations', exact: true }).click();
    assert.equal(await page.getByLabel('Mostrar somente alunos ainda não avaliados').isChecked(), true);

    await page.getByRole('button', { name: 'reports', exact: true }).click();
    await page.getByRole('button', { name: 'Novo relatório', exact: true }).click();
    await page.getByLabel('Título do relatório', { exact: true }).fill('Aprendizados dos testes');
    await page.getByLabel('Sensor validado', { exact: true }).check();
    await page.getByRole('button', { name: 'Inserir resultados no texto', exact: true }).click();
    await page.locator('input[type=file]').setInputFiles({ name: 'teste.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nFixture') });
    await page.getByRole('button', { name: 'Publicar relatório', exact: true }).click();
    await page.getByText('Falha simulada no envio do relatório', { exact: true }).first().waitFor();
    assert.match(postedReport, /name="linkedTaskIds"[\s\S]*\["done"\]/);
    await page.reload();
    await page.getByRole('button', { name: 'Novo relatório', exact: true }).click();
    assert.equal(await page.getByLabel('Título do relatório', { exact: true }).inputValue(), 'Aprendizados dos testes');
    assert.equal(await page.getByLabel('Sensor validado', { exact: true }).isChecked(), true);
    await page.getByText(/Fotos e arquivos precisam ser selecionados novamente/).waitFor();
    reportMode = 'success';
    await page.locator('input[type=file]').setInputFiles({ name: 'teste.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nFixture') });
    await page.getByRole('button', { name: 'Publicar relatório', exact: true }).click();
    await page.getByText(/Relatório publicado\./).waitFor();

    await page.getByRole('button', { name: 'status', exact: true }).click();
    await page.locator('textarea[name=learning]').fill('Texto mantido durante falta de internet');
    await context.setOffline(true);
    await page.getByRole('button', { name: 'Enviar registro', exact: true }).click();
    await page.getByText(/Você está sem conexão/).waitFor();
    assert.equal(await page.locator('textarea[name=learning]').inputValue(), 'Texto mantido durante falta de internet');
    await context.setOffline(false);
    await page.evaluate(() => { window.originalStorageWrite = Storage.prototype.setItem; Storage.prototype.setItem = () => { throw Error('Storage blocked for test'); }; });
    await page.locator('textarea[name=learning]').fill('Texto com armazenamento indisponível');
    await page.getByText('O rascunho não pôde ser salvo neste dispositivo. Mantenha esta página aberta.', { exact: true }).waitFor();
    await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageWrite; });

    await page.getByRole('button', { name: 'Registrar descoberta', exact: true }).click();
    await page.waitForFunction(() => document.activeElement?.matches('[data-draft-kind="logbook"] textarea[name="entry"]'));
    await page.evaluate(() => { scrollTo(0, 0); document.querySelector('[aria-label="Cenários de verificação"]').hidden = true; });
    await require('node:fs/promises').mkdir('test/artifacts.local', { recursive: true });
    await page.screenshot({ path: 'test/artifacts.local/workflow-mobile.png' });

    assert.deepEqual(errors, [], 'the real components must render without browser exceptions');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'mobile layout must fit the viewport');
    await page.setViewportSize({ width: 1440, height: 900 });
    assert.equal(await page.getByRole('navigation', { name: 'Ações rápidas do treino' }).isVisible(), false, 'quick training controls are reserved for mobile');

    // Exercise the actual App wiring, using a local Firestore implementation.
    const appContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    appContext.setDefaultTimeout(10000);
    await appContext.route('https://**/*', (route) => route.abort());
    await appContext.route('**/api/**', (route) => route.fulfill({ status: 503, json: { error: 'API simulada' } }));
    await appContext.route('**/src/firebase.js*', (route) => route.fulfill({ contentType: 'application/javascript', body: 'export const db={};export const auth=null;export const FIREBASE_AUTH_ENABLED=false;' }));
    const firestoreMock = await require('node:fs/promises').readFile('test/fixtures/workflowFirestoreMock.js', 'utf8');
    await appContext.route('**/node_modules/.vite/deps/firebase_firestore.js*', (route) => route.fulfill({ contentType: 'application/javascript', body: firestoreMock }));
    await appContext.addInitScript(() => {
      const student = location.search.includes('fixtureRole=student');
      localStorage.setItem('roboquest_user', JSON.stringify(student ? { type: 'student', data: { id: 'alice', name: 'Alice', username: 'alice' } } : { type: 'admin', name: 'Fixture' }));
      localStorage.setItem('roboquest_last_activity', String(Date.now()));
    });
    const app = await appContext.newPage();
    app.on('pageerror', (error) => errors.push(error.message));
    for (const [label, expected] of [['Tarefas vencidas ou para hoje', 'urgent'], ['Tarefas bloqueadas', 'blocked'], ['Tarefas aguardando revisão', 'review']]) {
      await app.goto(base);
      await app.getByRole('button', { name: new RegExp(label) }).click();
      assert.equal(await app.getByRole('combobox', { name: 'Filtrar tarefas por pendência' }).inputValue(), expected);
      assert.deepEqual(await app.locator('[data-task-id]').evaluateAll((nodes) => nodes.map((node) => node.dataset.taskId)), [expected]);
    }
    await app.goto(base);
    await app.getByRole('button', { name: /Cadastros incompletos/ }).click();
    assert.equal(await app.getByLabel('Mostrar somente cadastros incompletos').isChecked(), true);
    await app.getByText('Mostrando 1 de 2 alunos', { exact: true }).waitFor();
    await app.goto(base);
    await app.getByRole('button', { name: /Avaliações semanais pendentes/ }).click();
    assert.equal(await app.getByLabel('Mostrar somente alunos ainda não avaliados').isChecked(), true);
    await app.getByRole('button', { name: 'Registrar teste', exact: true }).click();
    await app.waitForFunction(() => document.activeElement?.matches('[data-draft-kind="full-round-test"] input[name="score"]'));
    await app.goto(`${base}/?fixtureRole=student`);
    await app.getByRole('button', { name: 'Registrar descoberta', exact: true }).click();
    await app.waitForFunction(() => document.activeElement?.matches('[data-draft-kind="logbook"] textarea[name="entry"]'));
    assert.deepEqual(errors, [], 'the full app must navigate without browser exceptions');
    console.log('ok - workflow browser: handoff, focused filters, evidence links, drafts, mobile shortcuts and report upload');
  } catch (error) { console.error("Current screen:", await page?.locator("body").innerText()); console.error("Local drafts:", await page?.evaluate(() => Object.entries(localStorage))); throw error; } finally { await browser.close(); }
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
