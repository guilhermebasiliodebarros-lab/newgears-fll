export const TRAINING_TRACKS = [
  { id: 'robot', label: 'Robô', tag: 'Construir e testar', minutes: 25, description: 'Uma melhoria por vez, um teste que ensina.', placeholder: 'Ex.: conseguir três saídas seguidas sem perder o alinhamento.', destination: 'rounds', destinationLabel: 'Abrir área do robô', checks: ['Conferir bateria, conexões e montagem', 'Repetir o teste nas mesmas condições', 'Comparar o resultado com o objetivo', 'Registrar o que funcionou e o próximo ajuste'] },
  { id: 'code', label: 'Programação', tag: 'Programar e repetir', minutes: 25, description: 'Transforme uma hipótese em um teste de código.', placeholder: 'Ex.: ajustar a leitura do sensor para reconhecer a linha.', destination: 'rounds', destinationLabel: 'Abrir códigos e saídas', checks: ['Definir o comportamento esperado', 'Salvar uma versão antes de alterar o código', 'Testar uma mudança de cada vez', 'Anotar o resultado e a versão testada'] },
  { id: 'innovation', label: 'Inovação', tag: 'Investigar e criar', minutes: 30, description: 'Uma pergunta real. Uma ideia para experimentar.', placeholder: 'Ex.: validar com um usuário se o protótipo resolve a dificuldade.', destination: 'strategy', destinationLabel: 'Abrir projeto e estratégia', checks: ['Escolher uma pergunta para investigar', 'Reunir uma fonte ou uma evidência', 'Experimentar a ideia com o protótipo', 'Registrar o feedback e a próxima melhoria'] },
  { id: 'presentation', label: 'Apresentação', tag: 'Contar e escutar', minutes: 10, description: 'Dê voz ao processo, às escolhas e aos aprendizados.', placeholder: 'Ex.: explicar o problema, a solução e o impacto sem ler o roteiro.', destination: 'rubrics', destinationLabel: 'Consultar as rubricas', checks: ['Combinar a participação de cada integrante', 'Ensaiar a explicação com um exemplo real', 'Ouvir uma pergunta ou um feedback', 'Definir o ajuste para o próximo ensaio'] },
];

export const trainingTrack = (id) => TRAINING_TRACKS.find((track) => track.id === id) || TRAINING_TRACKS[0];
export const trainingStorageKey = (scope) => `newgears_training_v1:${encodeURIComponent(scope)}`;
const boundedText = (value, length) => typeof value === 'string' ? value.slice(0, length) : '';
const timestamp = (value) => Number.isFinite(value) && value > 0 && value <= 8640000000000000;

export function createTrainingSession(trackId = 'robot', now = Date.now()) {
  const track = trainingTrack(trackId);
  return { id: `training-${now}`, trackId: track.id, goal: '', notes: '', durationSeconds: track.minutes * 60, remainingSeconds: track.minutes * 60, status: 'ready', deadline: null, startedAt: null, completedAt: null, checked: [] };
}

export function remainingTrainingSeconds(session, now = Date.now()) {
  return Math.max(0, Math.min(session.durationSeconds, session.status === 'running' ? Math.ceil((session.deadline - now) / 1000) : session.remainingSeconds));
}

export function formatTrainingTime(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

function normalizeSession(value, now) {
  if (!value || !TRAINING_TRACKS.some((track) => track.id === value.trackId)) return null;
  const track = trainingTrack(value.trackId);
  const base = createTrainingSession(track.id, now);
  const durationSeconds = Number.isInteger(value.durationSeconds) && value.durationSeconds >= 60 && value.durationSeconds <= 10800 ? value.durationSeconds : base.durationSeconds;
  const startedAt = timestamp(value.startedAt) ? value.startedAt : null;
  let status = ['ready', 'running', 'paused', 'reflection', 'completed'].includes(value.status) ? value.status : 'ready';
  if (status !== 'ready' && !startedAt) status = 'ready';
  if (status === 'running' && !timestamp(value.deadline)) status = 'paused';
  if (status === 'completed' && !timestamp(value.completedAt)) return null;
  const session = { ...base, id: boundedText(value.id, 100) || base.id, goal: boundedText(value.goal, 180), notes: boundedText(value.notes, 2000), durationSeconds, remainingSeconds: Number.isFinite(value.remainingSeconds) ? Math.max(0, Math.min(durationSeconds, Math.ceil(value.remainingSeconds))) : durationSeconds, status, startedAt: status === 'ready' ? null : startedAt, completedAt: status === 'completed' ? value.completedAt : null, deadline: status === 'running' ? value.deadline : null, checked: [...new Set(Array.isArray(value.checked) ? value.checked.filter((index) => Number.isInteger(index) && index >= 0 && index < track.checks.length) : [])] };
  if (status === 'ready') session.remainingSeconds = durationSeconds;
  if (status === 'reflection') session.remainingSeconds = 0;
  if (status === 'running' && remainingTrainingSeconds(session, now) === 0) return { ...session, remainingSeconds: 0, deadline: null, status: 'reflection' };
  return session;
}

export function readTrainingWorkspace(serialized, now = Date.now()) {
  const fallback = { version: 1, session: createTrainingSession('robot', now), history: [] };
  try {
    const data = JSON.parse(serialized);
    if (data?.version !== 1) return fallback;
    const history = (Array.isArray(data.history) ? data.history : []).map((item) => normalizeSession(item, now)).filter((item) => item?.status === 'completed');
    return { version: 1, session: normalizeSession(data.session, now) || fallback.session, history: [...new Map(history.map((item) => [item.id, item])).values()].sort((left, right) => right.completedAt - left.completedAt).slice(0, 20) };
  } catch { return fallback; }
}

export function reduceTrainingWorkspace(workspace, action) {
  const { session } = workspace;
  const now = action.now ?? Date.now();
  const update = (patch) => ({ ...workspace, session: { ...session, ...patch } });
  switch (action.type) {
    case 'track': return session.status === 'ready' ? { ...workspace, session: { ...createTrainingSession(action.id, now), goal: session.goal, notes: session.notes } } : workspace;
    case 'duration': return session.status === 'ready' && [10, 15, 25, 30, 45, 60].includes(action.minutes) ? update({ durationSeconds: action.minutes * 60, remainingSeconds: action.minutes * 60 }) : workspace;
    case 'goal': return session.status === 'completed' ? workspace : update({ goal: boundedText(action.value, 180) });
    case 'notes': return session.status === 'completed' ? workspace : update({ notes: boundedText(action.value, 2000) });
    case 'check': return session.status === 'completed' || !Number.isInteger(action.index) || action.index < 0 || action.index >= trainingTrack(session.trackId).checks.length ? workspace : update({ checked: session.checked.includes(action.index) ? session.checked.filter((index) => index !== action.index) : [...session.checked, action.index] });
    case 'start': return ['ready', 'paused'].includes(session.status) && session.goal.trim() && session.remainingSeconds > 0 ? update({ status: 'running', startedAt: session.startedAt || now, deadline: now + session.remainingSeconds * 1000 }) : workspace;
    case 'pause': {
      if (session.status !== 'running') return workspace;
      const remainingSeconds = remainingTrainingSeconds(session, now);
      return update({ remainingSeconds, deadline: null, status: remainingSeconds ? 'paused' : 'reflection' });
    }
    case 'tick': return session.status === 'running' && remainingTrainingSeconds(session, now) === 0 ? update({ status: 'reflection', remainingSeconds: 0, deadline: null }) : workspace;
    case 'finish': {
      if (!['running', 'paused', 'reflection'].includes(session.status) || !session.startedAt) return workspace;
      const completed = { ...session, status: 'completed', remainingSeconds: remainingTrainingSeconds(session, now), deadline: null, completedAt: now };
      return { ...workspace, session: completed, history: [completed, ...workspace.history.filter((item) => item.id !== completed.id)].slice(0, 20) };
    }
    case 'new': return ['ready', 'completed'].includes(session.status) ? { ...workspace, session: createTrainingSession(session.trackId, now) } : workspace;
    default: return workspace;
  }
}

export function trainingReport(sessions) {
  return ['NEW GEARS · REGISTRO DE TREINOS', 'Registros pessoais deste dispositivo.', '', ...sessions.flatMap((session) => {
    const track = trainingTrack(session.trackId);
    return [`${track.label} · ${new Date(session.completedAt).toLocaleString('pt-BR')}`, `Objetivo: ${session.goal}`, `Tempo de foco: ${formatTrainingTime(session.durationSeconds - session.remainingSeconds)} / ${formatTrainingTime(session.durationSeconds)} planejados`, `Checklist: ${session.checked.length}/${track.checks.length}`, ...track.checks.map((check, index) => `[${session.checked.includes(index) ? 'x' : ' '}] ${check}`), `Aprendizados: ${session.notes || 'Sem anotação.'}`, '', '────────────────────────────────', ''];
  })].join('\n');
}
