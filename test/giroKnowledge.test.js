import assert from 'node:assert/strict';
import { GIRO_MATERIAL_MAX_TEXT, answerGiroKnowledge, buildGiroKnowledgeIndex, giroSystemMaterials, searchGiroKnowledge, validateGiroFile, validateGiroMaterial } from '../src/utils/giroKnowledge.js';
import { importGiroMaterial, pdfPageText } from '../src/utils/giroMaterialImport.js';
import { restoreGiroConversation } from '../src/utils/giroAI.js';
import { saveGiroMaterial, subscribeGiroMaterials } from '../src/services/giroKnowledge.js';
import { onRequest } from '../functions/api/giro-ai/[[path]].js';
import { memoryStore } from './teamProcesses.test.js';

export async function runGiroKnowledgeTests() {
  const material = { title: 'Rúbrica de inovação — treino', category: 'rubric', tags: 'pesquisa, evidências', sourceURL: '', status: 'published', pages: [{ number: 1, text: 'IDENTIFICAR: a equipe deve apresentar o problema do projeto de inovação e as fontes pesquisadas.' }, { number: 2, text: 'COMPARTILHAR: a equipe apresenta a solução do projeto de inovação para receber feedback. Evidências de pesquisa precisam ser documentadas.' }] };
  assert.equal(validateGiroMaterial(material).pages[1].number, 2);
  for (const changes of [{ title: ' ' }, { category: 'toString' }, { status: 'invalid' }, { pages: [{ number: 2, text: 'Texto' }] }, { pages: [{ number: 1, text: 'curto' }] }, { pages: [{ number: 1, text: 'x'.repeat(GIRO_MATERIAL_MAX_TEXT + 1) }] }, { sourceURL: 'javascript:alert(1)' }, { sourceURL: 'https://user:password@example.com' }]) assert.throws(() => validateGiroMaterial({ ...material, ...changes }));
  assert.throws(() => validateGiroFile({ name: 'file.docx', size: 40 }), /PDF/);
  assert.throws(() => validateGiroFile({ name: 'file.pdf', size: 16 * 1024 * 1024 }), /15 MB/);
  assert.throws(() => validateGiroFile({ name: 'file.pdf', size: 0 }), /vazio/);
  const documents = [
    { ...material, id: 'rubric', seasonId: 'current' },
    { ...material, id: 'draft', title: 'Rascunho secreto', status: 'draft', seasonId: 'current' },
    { ...material, id: 'old', title: 'Rúbrica da temporada passada', seasonId: 'old' },
    { ...material, id: 'archived', status: 'archived', seasonId: 'current' },
    { id: 'robot', title: 'Programação do robô', status: 'published', category: 'robot', seasonId: 'current', pages: [{ number: 1, text: 'O sensor de cor é calibrado antes dos testes. A programação usa as leituras do sensor de cor para corrigir a direção do robô.' }] },
  ];
  const index = buildGiroKnowledgeIndex(documents, 'current');
  assert.equal(index.length, 3);
  const found = searchGiroKnowledge('Quais evidencias de pesquisa precisamos documentar?', index);
  assert.equal(found[0].page, 2);
  assert.equal(found[0].materialId, 'rubric');
  assert.equal(searchGiroKnowledge('COMO CALIBRAR OS SENSORES DE COR?', index)[0].materialId, 'robot');
  assert.deepEqual(searchGiroKnowledge('Qual a capital da França?', index), []);
  assert.deepEqual(searchGiroKnowledge('   ', index), []);
  assert.equal(searchGiroKnowledge('mais detalhes', index, 'sensor de cor')[0].materialId, 'robot');
  const answer = answerGiroKnowledge('solução do projeto de inovação', index);
  assert.equal(answer.sources[0].type, 'internal');
  assert.match(answer.text, /página 2/);
  assert.match(answer.text, /COMPARTILHAR/);
  assert.doesNotMatch(answer.text, /secreto|passada/);
  assert.match(answerGiroKnowledge('Capital da França', index).text, /Não encontrei/);
  assert.match(answerGiroKnowledge('Regras', []).text, /ainda não tem conteúdo publicado/);
  const noAccess = giroSystemMaterials({ project: { title: 'Filtro', problem: 'Falta de água', solution: 'Reuso', password: 'secret', grades: 5 }, robots: [{ name: 'V2', notes: 'Sensor', private: 'hidden' }], students: [{ password: 'secret' }] }, 'current');
  assert.doesNotMatch(JSON.stringify(noAccess), /secret|hidden|grades/);
  assert.equal(giroSystemMaterials({ project: { title: 'Nome do Projeto' } }, 'current').length, 0);
  const restored = restoreGiroConversation({ getItem: () => JSON.stringify({ version: 1, messages: [{ role: 'assistant', text: answer.text, sources: answer.sources }] }) }, 'library');
  assert.equal(restored.messages[0].sources[0].materialId, 'rubric');
  assert.equal(restored.messages[0].sources[0].page, 2);

  const memory = memoryStore({ 'settings/workspace_season': { activeSeasonId: 'current' } });
  const context = { db: {}, user: { type: 'admin' }, seasonId: 'current', store: memory.store };
  await assert.rejects(saveGiroMaterial({ ...context, user: { type: 'student' }, material }), /Somente o técnico/);
  const id = await saveGiroMaterial({ ...context, material: { ...material, status: 'draft', password: 'never-save' } });
  const path = `giroKnowledgeMaterials/${id}`;
  const draft = memory.records.get(path);
  assert.equal(draft.status, 'draft');
  assert.equal(draft.revision, 1);
  assert.equal(draft.password, undefined);
  await saveGiroMaterial({ ...context, id, expectedUpdatedAt: draft.updatedAt, expectedRevision: draft.revision, material });
  assert.equal(memory.records.get(path).status, 'published');
  assert.equal(memory.records.get(path).createdAt, draft.createdAt);
  await assert.rejects(saveGiroMaterial({ ...context, id, expectedUpdatedAt: draft.updatedAt, expectedRevision: draft.revision, material }), /Outro técnico/);
  const published = memory.records.get(path);
  await saveGiroMaterial({ ...context, id, expectedUpdatedAt: published.updatedAt, expectedRevision: published.revision, material: { ...material, status: 'archived' } });
  assert.equal(buildGiroKnowledgeIndex([{ ...memory.records.get(path), id }], 'current').length, 0);
  await assert.rejects(saveGiroMaterial({ ...context, seasonId: 'other', material }), /temporada mudou/);
  memory.records.set('settings/workspace_season', { activeSeasonId: 'current', transitionLock: {} });
  await assert.rejects(saveGiroMaterial({ ...context, material }), /encerrada/);
  let constraints; let listener;
  const subscribeStore = { collection: () => 'materials', where: (...args) => args, query: (...args) => { constraints = args; return args; }, onSnapshot: (_query, callback) => { listener = callback; return () => {}; } };
  let received;
  subscribeGiroMaterials({ db: {}, seasonId: 'current', user: { type: 'student' }, onData: (items) => { received = items; }, onError: () => {}, store: subscribeStore });
  assert.deepEqual(constraints.slice(1), [['seasonId', '==', 'current'], ['status', '==', 'published']]);
  listener({ docs: documents.map((item) => ({ id: item.id, data: () => item })) });
  assert.deepEqual(received.map((item) => item.id), ['rubric', 'robot']);
  subscribeGiroMaterials({ db: {}, seasonId: 'current', user: { type: 'admin' }, onData: () => {}, onError: () => {}, store: subscribeStore });
  assert.equal(constraints.length, 2);

  const txt = new File(['Conteúdo da temporada cadastrado pela equipe.'], 'guia.txt', { type: 'text/plain' });
  assert.match((await importGiroMaterial(txt)).pages[0].text, /Conteúdo da temporada/);
  assert.equal(pdfPageText([{ str: 'Linha 1', hasEOL: true }, { str: 'Linha 2', hasEOL: false }, { other: true }]), 'Linha 1\nLinha 2');
  const file = new File(['fake-pdf'], 'rubrica.pdf', { type: 'application/pdf' });
  let destroyed = 0;
  const pdfLoader = async () => ({ getDocument: () => ({ promise: Promise.resolve({ numPages: 2, getPage: async (number) => ({ getTextContent: async () => ({ items: [{ str: `Página ${number}: conteúdo da rúbrica para avaliar o projeto.`, hasEOL: true }] }), cleanup: () => {} }) }), destroy: async () => { destroyed++; } }) });
  const imported = await importGiroMaterial(file, { pdfLoader });
  assert.equal(imported.pages.length, 2); assert.equal(imported.pages[1].number, 2); assert.equal(destroyed, 1);
  const emptyLoader = async () => ({ getDocument: () => ({ promise: Promise.resolve({ numPages: 1, getPage: async () => ({ getTextContent: async () => ({ items: [] }), cleanup: () => {} }) }), destroy: async () => {} }) });
  await assert.rejects(importGiroMaterial(file, { pdfLoader: emptyLoader }), /OCR/);
  const abort = new AbortController(); abort.abort();
  await assert.rejects(importGiroMaterial(file, { signal: abort.signal, pdfLoader }), { name: 'AbortError' });
  const missingNvidia = await onRequest({ request: new Request('https://team.example/api/giro-ai/status'), env: { OPENAI_API_KEY: 'never-used' } });
  assert.equal((await missingNvidia.json()).configured, false, 'An OpenAI key cannot activate the NVIDIA integration');
}
