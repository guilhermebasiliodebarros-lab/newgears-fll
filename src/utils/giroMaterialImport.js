import { GIRO_MATERIAL_MAX_PAGES, GIRO_MATERIAL_MAX_TEXT, validateGiroFile } from './giroKnowledge.js';

export function pdfPageText(items) {
  return items.filter((item) => typeof item.str === 'string').map((item) => `${item.str}${item.hasEOL ? '\n' : ' '}`).join('').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export async function importGiroMaterial(file, { signal, onProgress = () => {}, pdfLoader } = {}) {
  const extension = validateGiroFile(file);
  const check = () => { if (signal?.aborted) throw new DOMException('Importação cancelada.', 'AbortError'); };
  check();
  if (extension !== 'pdf') {
    const text = await file.text(); check();
    if (text.length > GIRO_MATERIAL_MAX_TEXT) throw new Error('O texto ultrapassa 120.000 caracteres. Divida o material em partes.');
    if (text.includes('\u0000') || text.includes('\ufffd')) throw new Error('Salve o arquivo de texto com codificação UTF-8 antes de importar.');
    if (text.trim().length < 20) throw new Error('O arquivo precisa ter pelo menos 20 caracteres de conteúdo.');
    return { pages: [{ number: 1, text: text.trim() }], fileName: file.name };
  }
  const pdfjs = pdfLoader ? await pdfLoader() : await import('pdfjs-dist/build/pdf.mjs');
  if (!pdfLoader) pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
  check();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, useSystemFonts: true });
  const abort = () => { void task.destroy(); };
  signal?.addEventListener('abort', abort, { once: true });
  // Ask for an unlocked copy rather than leaving an unresolved password prompt.
  task.onPassword = () => { void task.destroy(); };
  try {
    check();
    const pdf = await task.promise;
    if (pdf.numPages > GIRO_MATERIAL_MAX_PAGES) throw new Error('O PDF ultrapassa 200 páginas. Divida o documento em partes.');
    const pages = []; let length = 0;
    for (let number = 1; number <= pdf.numPages; number++) {
      check();
      const page = await pdf.getPage(number);
      const content = await page.getTextContent(); check();
      const text = pdfPageText(content.items);
      length += text.length;
      if (length > GIRO_MATERIAL_MAX_TEXT) throw new Error('O PDF ultrapassa 120.000 caracteres. Divida o documento em partes.');
      pages.push({ number, text });
      page.cleanup(); onProgress(number, pdf.numPages);
    }
    if (length < 20) throw new Error('Não encontrei texto selecionável neste PDF. Use uma versão com OCR ou cole o conteúdo manualmente.');
    const empty = pages.filter((page) => !page.text.trim()).length;
    return { pages, fileName: file.name, warning: empty ? `${empty} página(s) sem texto selecionável. Confira se há imagens ou tabelas que precisam ser transcritas.` : 'Confira a ordem do texto extraído, especialmente em tabelas e rúbricas com colunas.' };
  } catch (error) {
    check();
    if (/password|destroyed/i.test(error?.message || '') || error?.name === 'PasswordException') throw new Error('Não foi possível abrir este PDF. Se estiver protegido, importe uma cópia sem senha.');
    throw error;
  } finally { signal?.removeEventListener('abort', abort); await task.destroy(); }
}
