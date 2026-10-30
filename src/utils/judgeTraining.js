import { QUESTION_BANK } from './judgeQuestions.js';

export const TRAINING_VERSION = 1;
export const TRAINING_AREAS = [
  { id: 'all', label: 'Todas as áreas' }, { id: 'project', label: 'Projeto de Inovação' },
  { id: 'robot', label: 'Design do Robô' }, { id: 'values', label: 'Core Values' }, { id: 'game', label: 'Robot Game · treino interno' },
];
const GAME_QUESTIONS = [
  ['g1', 'Como vocês decidiram a ordem das saídas e onde ainda precisam ganhar consistência?'],
  ['g2', 'Que verificação vocês fazem antes de cada saída para repetir a posição inicial?'],
  ['g3', 'Como o registro de tentativas ajudou a escolher uma alteração no robô?'],
  ['g4', 'Como a equipe prepara a troca de garras e ajuda quem está na mesa?'],
  ['g5', 'Se uma saída falhar no treino, como vocês decidem o próximo teste?'],
].map(([id, question]) => ({ id, area: 'game', stage: 'Reflexão interna de treino', question, answer: () => 'Usem um teste real: objetivo, configuração, resultado, decisão e próximo passo. Não inventem evidências ou regras.' }));
export const TRAINING_QUESTIONS = [...QUESTION_BANK, ...GAME_QUESTIONS];
export const TRAINING_RATINGS = [
  { id: 0, label: 'Ainda não conseguimos responder' }, { id: 1, label: 'Precisamos de apoio' },
  { id: 2, label: 'Resposta clara; falta uma evidência' }, { id: 3, label: 'Resposta com exemplo e aprendizado' },
];

export function trainingDeck(area, count, random = Math.random) {
  if (!TRAINING_AREAS.some((item) => item.id === area)) throw Error('Selecione uma categoria válida.');
  if (!Number.isInteger(count) || count < 1 || count > 10) throw Error('Escolha de uma a dez perguntas.');
  const pool = TRAINING_QUESTIONS.filter((item) => area === 'all' || item.area === area).map((item) => item.id);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.max(0, Math.min(.999999, random())) * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, count);
}
export const questionById = (id) => TRAINING_QUESTIONS.find((question) => question.id === id);
export function validateTrainingResult(input) {
  if (!input || input.version !== TRAINING_VERSION || typeof input.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(input.id) || !['individual', 'team'].includes(input.mode)) throw Error('Simulação inválida.');
  if (!Array.isArray(input.participants) || !input.participants.length || input.participants.length > 40 || input.participants.some((person) => typeof person.id !== 'string' || !person.id || typeof person.name !== 'string' || person.name.length > 120)) throw Error('Escolha quem participou do treino.');
  if (!Array.isArray(input.answers) || !input.answers.length || input.answers.length > 10) throw Error('Registre pelo menos uma resposta.');
  const ids = new Set();
  const answers = input.answers.map((answer) => {
    if (!questionById(answer?.questionId) || ids.has(answer.questionId) || !Number.isInteger(answer.rating) || answer.rating < 0 || answer.rating > 3 || typeof answer.note !== 'string' || answer.note.length > 1200 || !Number.isFinite(answer.seconds) || answer.seconds < 0 || answer.seconds > 3600) throw Error('Confira os resultados de cada pergunta.');
    ids.add(answer.questionId);
    return { questionId: answer.questionId, rating: answer.rating, note: answer.note.trim(), seconds: Math.round(answer.seconds), helped: answer.helped === true };
  });
  if (!TRAINING_AREAS.some((area) => area.id === input.area) || typeof input.finishedAt !== 'string' || !Number.isFinite(Date.parse(input.finishedAt))) throw Error('Data ou categoria inválida.');
  return { version: TRAINING_VERSION, id: input.id, mode: input.mode, participants: input.participants.map(({ id, name }) => ({ id, name })), area: input.area, answers, finishedAt: new Date(input.finishedAt).toISOString() };
}
export function readTrainingHistory(storage, key) {
  try { const value = JSON.parse(storage.getItem(key)); return (Array.isArray(value) ? value : []).flatMap((item) => { try { return [validateTrainingResult(item)]; } catch { return []; } }).slice(-50); } catch { return []; }
}
export function appendTrainingResult(storage, key, result) {
  const clean = validateTrainingResult(result);
  const records = [...readTrainingHistory(storage, key).filter((record) => record.id !== clean.id), clean].slice(-50);
  storage.setItem(key, JSON.stringify(records));
  return records;
}
export const trainingSeconds = ({ elapsed, startedAt }, now) => elapsed + (startedAt === null ? 0 : Math.max(0, now - startedAt) / 1000);
export function trainingSummary(record) {
  const clean = validateTrainingResult(record);
  return `Simulação de perguntas · treino interno\nParticipantes: ${clean.participants.map((person) => person.name).join(', ')}\nData: ${clean.finishedAt.slice(0, 10)}\n${clean.answers.map((answer, index) => `${index + 1}. ${questionById(answer.questionId).question}\nAutoavaliação interna: ${TRAINING_RATINGS[answer.rating].label} · ${answer.seconds}s${answer.helped ? ' · consultou orientação' : ''}\nPróximo passo: ${answer.note || 'Não registrado'}`).join('\n\n')}`;
}
