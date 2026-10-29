import assert from 'node:assert/strict';
import { memoryStore } from './teamProcesses.test.js';
import { buildGiroKnowledgeIndex, searchGiroKnowledge } from '../src/utils/giroKnowledge.js';
import { validateGiroImages, mixGiroAudio } from '../src/utils/giroMedia.js';
import { restoreGiroConversation } from '../src/utils/giroAI.js';
import { validateGiroFeedback, giroFeedbackDraft } from '../src/utils/giroFeedback.js';
import { saveGiroFeedback, reviewGiroFeedback, subscribeGiroFeedback } from '../src/services/giroFeedback.js';
import { handleNvidiaGiroRequest, NVIDIA_GIRO_MODEL, NVIDIA_GIRO_VISION_MODEL, NVIDIA_GIRO_TEACHING } from '../server/giro/nvidia.js';

export async function runGiroImprovementsTests() {
  const image = { kind: 'image', name: 'robot.png', dataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=' };
  assert.equal(validateGiroImages([image])[0].name, 'robot.png');
  for (const input of [null, [image, image, image], [{ ...image, dataURL: 'https://attacker.example/photo.png' }], [{ ...image, dataURL: 'data:image/png;base64,SGVsbG8=' }], [{ kind: 'audio', dataURL: image.dataURL }], [{ ...image, dataURL: 'data:image/svg+xml;base64,PHN2Zy8+' }], [{ ...image, dataURL: `data:image/png;base64,${'A'.repeat(1500000)}` }]]) assert.throws(() => validateGiroImages(input));
  assert.deepEqual([...mixGiroAudio([new Float32Array([1, 1, -1, -1]), new Float32Array([0, 0, 0, 0])], 32000)], [0.5, -0.5]);
  assert.throws(() => mixGiroAudio([new Float32Array(16000 * 61)], 16000), /60 segundos/);
  assert.throws(() => mixGiroAudio([], 16000));
  const restored = restoreGiroConversation({ getItem: () => JSON.stringify({ version: 1, messages: [{ id: 'm', role: 'user', text: 'foto', media: [image] }] }) }, 'chat');
  assert.deepEqual(restored.messages[0].media, [{ kind: 'image', name: 'robot.png' }]);
  assert.doesNotMatch(JSON.stringify(restored), /base64/);

  const documents = [
    { id: 'gyro', title: 'Curvas com giroscópio', category: 'robot', status: 'published', seasonId: 'now', pages: [{ number: 1, text: 'Calibrar o giroscópio com o robô parado antes de fazer curvas. O sensor precisa estar imóvel durante a calibração.' }] },
    { id: 'other', title: 'Testes da equipe', category: 'robot', status: 'published', seasonId: 'now', pages: [{ number: 1, text: 'A equipe anota os testes e os resultados observados para comparar as versões.' }] },
    { id: 'hidden', title: 'Curvas com giroscópio', category: 'robot', status: 'draft', seasonId: 'now', pages: [{ number: 1, text: 'Giroscópio secreto.' }] },
  ];
  const index = buildGiroKnowledgeIndex(documents, 'now');
  assert.equal(searchGiroKnowledge('Como calibrar o gyro?', index)[0].materialId, 'gyro');
  assert.equal(searchGiroKnowledge('E mais detalhes da calibração?', index, 'curvas com giroscópio')[0].materialId, 'gyro');
  assert.deepEqual(searchGiroKnowledge('Quanto custa uma passagem para Marte?', index), []);

  const memory = memoryStore({ 'settings/workspace_season': { activeSeasonId: 'now' } });
  const student = { type: 'student', studentId: 'alice' };
  const context = { db: {}, user: student, seasonId: 'now', ownerId: 'alice', id: 'answer-1', store: memory.store };
  const feedback = { rating: 'incorrect', question: 'Como testar?', answer: 'Faça um teste.', note: 'Faltou indicar o sensor.', password: 'never-save', dataURL: image.dataURL };
  assert.throws(() => validateGiroFeedback({ ...feedback, rating: 'invalid' }));
  await saveGiroFeedback({ ...context, feedback });
  const saved = memory.records.get('giroAnswerFeedback/answer-1');
  assert.equal(saved.status, 'open'); assert.doesNotMatch(JSON.stringify(saved), /never-save|dataURL|base64/);
  await assert.rejects(saveGiroFeedback({ ...context, feedback }), /já foi avaliada/);
  await assert.rejects(saveGiroFeedback({ ...context, id: 'answer-2', seasonId: 'old', feedback }), /temporada mudou/);
  await assert.rejects(reviewGiroFeedback({ ...context, correction: 'Correção' }), /Somente o técnico/);
  await reviewGiroFeedback({ ...context, user: { type: 'admin' }, correction: 'Confira o tipo de sensor antes de testar.' });
  assert.equal(memory.records.get('giroAnswerFeedback/answer-1').status, 'reviewed');
  assert.equal([...memory.records.keys()].some((key) => key.startsWith('giroKnowledgeMaterials/')), false, 'Feedback never changes the knowledge library automatically');
  await assert.rejects(reviewGiroFeedback({ ...context, user: { type: 'admin' }, correction: 'outra' }), /já revisou/);
  assert.equal(giroFeedbackDraft(saved, 'Confira o tipo de sensor antes de testar.').status, 'draft');
  assert.throws(() => giroFeedbackDraft(saved, 'curto'));
  assert.throws(() => subscribeGiroFeedback({ ...context, onData: () => {}, onError: () => {} }), /Somente o técnico/);

  const body = { messages: [{ role: 'user', content: 'O que aparece nesta foto?' }], attachments: [image], seasonId: 'now', useKnowledge: false, context: {}, references: [] };
  let submitted;
  const runtime = { local: true, reserveUsage: async () => {}, fetch: async (_url, options) => { submitted = JSON.parse(options.body); return Response.json({ choices: [{ finish_reason: 'stop', message: { content: 'Vejo uma imagem branca.', reasoning_content: 'private-thought' } }] }); } };
  const request = (payload = body) => new Request('http://localhost/api/giro-ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const env = { NVIDIA_API_KEY: 'fixture-private-key' };
  const response = await handleNvidiaGiroRequest(request(), env, runtime);
  assert.equal(response.status, 200);
  assert.equal(submitted.model, NVIDIA_GIRO_VISION_MODEL);
  assert.equal(submitted.messages.at(-1).content[1].image_url.url, image.dataURL);
  assert.match(submitted.messages[0].content, /não invente funções|Não invente funções/);
  assert.doesNotMatch(await response.text(), /private-thought|base64|fixture-private-key/);
  await handleNvidiaGiroRequest(request({ ...body, attachments: [] }), env, runtime);
  assert.equal(submitted.model, NVIDIA_GIRO_MODEL);
  assert.equal(typeof submitted.messages.at(-1).content, 'string');
  assert.equal((await handleNvidiaGiroRequest(request({ ...body, attachments: [{ ...image, dataURL: 'http://localhost/private' }] }), env, runtime)).status, 400);
  assert.match(NVIDIA_GIRO_TEACHING, /aprendeu permanentemente/);
}
