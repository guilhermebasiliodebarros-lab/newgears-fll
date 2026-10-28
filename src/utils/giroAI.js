export const GIRO_AI_MAX_QUESTION = 4000;
export const GIRO_AI_MAX_HISTORY = 16;
export const GIRO_AI_SUGGESTIONS = [
  'Como preparar o robô para fazer curvas mais precisas?',
  'Como funciona a avaliação no torneio FLL?',
  'Me ajude a explicar o nosso projeto de inovação.',
  'Como usar os sensores no SPIKE ou no Pybricks?',
];

export const safeGiroURL = (value) => {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
};

// Explicit technical fields only: never forward student records, grades, passwords or wallets.
export const sanitizeGiroContext = (source = {}) => {
  let remaining = 16000;
  const text = (value, max = 1200) => {
    if (typeof value !== 'string') return '';
    const result = value.trim().slice(0, Math.min(max, remaining));
    remaining -= result.length;
    return result;
  };
  const pick = (record, fields) => Object.fromEntries(fields.map((key) => [key, text(record?.[key])]).filter(([, value]) => value));
  const list = (values, fields) => Array.isArray(values) ? values.slice(0, 3).map((record) => pick(record, fields)).filter((record) => Object.keys(record).length) : [];
  return {
    team: 'New Gears',
    season: text(source?.season, 160),
    project: pick(source?.project, ['title', 'problem', 'solution', 'impact', 'sharing']),
    robots: list(source?.robots, ['version', 'name', 'description', 'strategy', 'mechanism', 'programming', 'notes']),
    attachments: list(source?.attachments, ['name', 'purpose', 'materials', 'mechanism', 'programming', 'notes']),
    codes: list(source?.codes, ['title', 'description', 'language', 'code']),
  };
};

export const restoreGiroConversation = (storage, key) => {
  try {
    const saved = JSON.parse(storage.getItem(key));
    if (saved?.version !== 1) return { messages: [], draft: '' };
    const messages = (Array.isArray(saved.messages) ? saved.messages : []).filter((item) => ['user', 'assistant'].includes(item?.role) && typeof item.text === 'string').slice(-32).map((item) => ({
      id: String(item.id || ''), role: item.role, text: item.text.slice(0, 16000), searched: item.searched === true,
      sources: (Array.isArray(item.sources) ? item.sources : []).filter((source) => (source?.type === 'internal' && typeof source.materialId === 'string' && source.materialId.length <= 240 && Number.isInteger(source.page) && source.page > 0 && source.page <= 200) || safeGiroURL(source?.url)).slice(0, 12).map((source) => source.type === 'internal' ? { type: 'internal', number: Number.isInteger(source.number) && source.number >= 1 && source.number <= 4 ? source.number : undefined, materialId: source.materialId, title: String(source.title || 'Material').slice(0, 240), page: source.page, url: safeGiroURL(source.url) || '', system: source.system === true } : { url: safeGiroURL(source.url), title: String(source.title || 'Fonte').slice(0, 240) }),
    }));
    return { messages, draft: typeof saved.draft === 'string' ? saved.draft.slice(0, GIRO_AI_MAX_QUESTION) : '' };
  } catch { return { messages: [], draft: '' }; }
};

export const giroSpeechText = (text) => text.replace(/```[\s\S]*?```/g, ' Trecho de programação disponível na conversa. ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#*_`]/g, '');
