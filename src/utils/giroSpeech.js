export const giroVoiceId = (voice) => voice.voiceURI || `${voice.lang}:${voice.name}`;
const language = (voice) => `${voice.lang || ''}`.toLowerCase().replace('_', '-');
export const giroVoiceScore = (voice) => {
  const name = `${voice.name || ''}`;
  return (language(voice) === 'pt-br' ? 100 : 0)
    + (/natural|neural|premium|enhanced/i.test(name) ? 45 : 0)
    + (/google/i.test(name) ? 30 : 0)
    + (voice.localService === false ? 8 : 0) + (voice.default ? 2 : 0);
};
export const portugueseGiroVoices = (voices = []) => [...new Map(voices.filter((voice) => /^pt(?:-|$)/.test(language(voice))).map((voice) => [giroVoiceId(voice), voice])).values()]
  .sort((a, b) => giroVoiceScore(b) - giroVoiceScore(a) || a.name.localeCompare(b.name));
export function chooseGiroVoice(voices, preference = 'auto', online = true) {
  const candidates = portugueseGiroVoices(voices);
  const selected = candidates.find((voice) => giroVoiceId(voice) === preference);
  if (selected) return selected;
  return (!online && candidates.find((voice) => voice.localService !== false)) || candidates[0];
}
export const giroVoicePreferences = (value = {}) => ({
  voice: typeof value?.voice === 'string' ? value.voice : 'auto',
  rate: Number.isFinite(Number(value?.rate)) ? Math.min(1.2, Math.max(.8, Number(value.rate))) : .98,
});
export function readGiroVoicePreferences(storage, key) {
  try { return giroVoicePreferences(JSON.parse(storage.getItem(key))); } catch { return giroVoicePreferences(); }
}

export function giroSpeechChunks(value, maximum = 220) {
  const text = `${value || ''}`.replace(/\+\s*(\d+)\s+Gears conquistados!?/gi, 'Você ganhou $1 Gears.')
    .replace(/\bXP\b/g, 'pontos de experiência').replace(/\s*[·|]\s*/g, ', ').replace(/…/g, '.').replace(/\s+/g, ' ').trim();
  const chunks = [];
  let current = '';
  const add = (part) => {
    if (current && current.length + part.length + 1 > maximum) { chunks.push(current); current = ''; }
    current += `${current ? ' ' : ''}${part}`;
  };
  for (let sentence of text.split(/(?<=[.!?])\s+/)) {
    while (sentence.length > maximum) {
      const space = sentence.lastIndexOf(' ', maximum);
      const cut = space > 0 ? space : maximum;
      add(sentence.slice(0, cut));
      sentence = sentence.slice(cut).trim();
    }
    if (sentence) add(sentence);
  }
  if (current) chunks.push(current);
  return chunks;
}
