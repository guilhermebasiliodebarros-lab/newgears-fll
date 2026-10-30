// Optional integration check. Start `npm run dev`, then execute this file with Node.
// Use PLAYWRIGHT_MODULE to point to an existing Playwright installation if needed.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

async function run() {
  const browser = await chromium.launch({ channel: process.env.GIRO_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
    await context.route('https://**/*', (route) => route.abort());
    await context.route('**/src/firebase.js*', (route) => route.fulfill({ contentType: 'application/javascript', body: 'export const db={};export const auth={currentUser:{getIdToken:()=>Promise.reject(Error("Public mode must not request an account token"))}};export const FIREBASE_AUTH_ENABLED=false;' }));
    let calls = 0;
    let mode = 'pending';
    let stalled;
    await context.route('**/api/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/giro-ai/status') return route.fulfill({ json: { ready: true, configured: true, authentication: 'public' } });
      if (url.pathname !== '/api/giro-ai/chat') return route.fulfill({ status: 403, json: { error: 'No production API access in tests.' } });
      calls++;
      if (mode === 'pending') { stalled = route; return; }
      if (mode === 'rate') return route.fulfill({ status: 429, headers: { 'Retry-After': '1' }, json: { error: 'Limite fictício.' } });
      if (mode === 'invalid') return route.fulfill({ json: {} });
      return route.fulfill({ json: { text: 'Resposta fictícia para testar a interface.', sources: [] } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const base = process.env.GIRO_TEST_BASE || 'http://127.0.0.1:5173';
    await page.goto(`${base}/test/fixtures/giro-interactions.html`);
    const companion = page.getByRole('complementary', { name: 'Giro, mascote da New Gears' });
    await companion.waitFor();
    assert.equal(await page.locator('.gear-companion__notice').count(), 0);
    await page.getByRole('button', { name: 'Concluir tarefa fictícia', exact: true }).click();
    await companion.locator('[data-reaction="task"]').waitFor();
    await companion.getByRole('button', { name: 'Conversar com Giro', exact: true }).click();
    const local = companion.getByRole('region', { name: 'Dica contextual do Giro' });
    const first = await local.innerText();
    await local.getByRole('button', { name: 'Outra dica', exact: true }).click();
    assert.notEqual(await local.innerText(), first);
    assert.equal(calls, 0, 'local advice must not use the API');
    await companion.getByRole('button', { name: 'Modo tranquilo', exact: true }).click();
    assert.equal(await companion.locator('.gear-mascot__eyes').evaluate((node) => getComputedStyle(node).animationName), 'none');
    for (const [label, animation] of [['Dançar', 'gear-dance'], ['Pular', 'gear-celebrate'], ['Giro especial', 'gear-spin'], ['Mais uma dança!', 'gear-dance']]) {
      const previous = await companion.locator('.gear-mascot').elementHandle();
      await companion.getByRole('button', { name: label, exact: true }).click();
      await page.waitForFunction(() => document.querySelector('.gear-companion .gear-mascot')?.dataset.paused !== 'true');
      assert.equal(await previous.evaluate((node) => node.isConnected), false, 'Each explicit action restarts its animation');
      assert.equal(await companion.locator('.gear-mascot__character').evaluate((node) => getComputedStyle(node).animationName), animation, 'Manual actions also work in quiet mode');
      assert.equal(await companion.locator('.gear-mascot__character').evaluate((node) => getComputedStyle(node).animationPlayState), 'running');
      const moved = await companion.locator('.gear-mascot__character').evaluate(async (node) => {
        const before = getComputedStyle(node).transform;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return before !== getComputedStyle(node).transform;
      });
      assert.equal(moved, true, 'The SVG character actually moves between frames');
      await previous.dispose();
    }
    await page.waitForFunction(() => document.querySelector('.gear-companion')?.classList.contains('gear-companion--quiet'));
    assert.equal(await companion.locator('.gear-mascot__character').evaluate((node) => getComputedStyle(node).animationName), 'none', 'Quiet mode resumes when the action finishes');
    await companion.getByRole('button', { name: 'Comemorar', exact: true }).click();
    await page.locator('.giro-celebration:not(.giro-celebration--calm)').waitFor();
    await page.waitForFunction(() => !document.querySelector('.giro-celebration'));
    assert.equal(await companion.locator('.gear-mascot__character').evaluate((node) => getComputedStyle(node).animationName), 'none');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await companion.getByRole('button', { name: 'Dançar', exact: true }).click();
    await companion.getByText(/Movimentos reduzidos ativos no dispositivo/).waitFor();
    assert.equal(await companion.locator('.gear-mascot__character').evaluate((node) => getComputedStyle(node).animationName), 'none', 'Operating system reduced motion is still respected');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await companion.getByRole('button', { name: 'Fechar mensagem do Giro', exact: true }).click();
    await companion.getByRole('button', { name: 'Giro IA', exact: true }).click();
    const chat = page.getByRole('dialog', { name: 'Giro IA', exact: true });
    const field = chat.getByRole('textbox', { name: 'Sua pergunta para o Giro IA', exact: true });
    const send = chat.getByRole('button', { name: 'Enviar pergunta ao Giro IA', exact: true });
    await field.fill('Como comparar dois testes?');
    await page.waitForFunction(() => !document.querySelector('.giro-ai__send').disabled);
    await send.click();
    const cancel = chat.getByRole('button', { name: 'Cancelar resposta do Giro IA', exact: true });
    await cancel.waitFor();
    assert.equal(await chat.locator('.gear-mascot').getAttribute('data-expression'), 'thinking');
    assert.equal(await chat.locator('.gear-mascot__eyes').evaluate((node) => getComputedStyle(node).animationName), 'none', 'quiet mode also applies to the chat');
    await cancel.click();
    await chat.getByText('Resposta cancelada. Sua pergunta e os anexos foram mantidos.', { exact: true }).waitFor();
    assert.equal(calls, 1, 'Cancel must never submit the form again when the button changes type');
    assert.equal(await field.inputValue(), 'Como comparar dois testes?');
    await stalled.fulfill({ json: { text: 'Resposta tardia descartada.' } }).catch(() => {});
    assert.equal(await chat.getByText('Resposta tardia descartada.', { exact: true }).count(), 0);
    mode = 'rate';
    await send.click();
    await chat.getByText(/Aguarde 1s para enviar/).waitFor();
    assert.equal(await send.isDisabled(), true);
    await page.waitForFunction(() => !document.querySelector('.giro-ai__send').disabled);
    mode = 'invalid';
    await send.click();
    await chat.getByText('O Giro não recebeu uma resposta completa. Sua pergunta foi mantida para tentar novamente.', { exact: true }).waitFor();
    mode = 'success';
    await chat.getByRole('button', { name: 'Tentar enviar novamente', exact: true }).click();
    await chat.getByText('Resposta fictícia para testar a interface.', { exact: true }).waitFor();
    assert.equal(await field.inputValue(), '');
    assert.equal(calls, 4);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await chat.locator('.gear-mascot__eyes').evaluate((node) => getComputedStyle(node).animationName), 'none');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.activeElement === document.querySelector('.gear-companion__button'));
    assert.deepEqual(errors, []);
    console.log('ok - Giro browser regressions: local advice, task, manual dance/jump/spin, restart, quiet mode recovery, reduced motion, cancellation, late reply, rate limit, invalid reply, retry, mobile and keyboard');
  } finally { await browser.close(); }
}

run().catch((error) => { console.error(error.stack); process.exitCode = 1; });
