import { useCallback, useEffect, useRef, useState } from 'react';
import { chooseGiroVoice, giroSpeechChunks, giroVoiceId, giroVoicePreferences, portugueseGiroVoices, readGiroVoicePreferences } from '../utils/giroSpeech';

export default function useGiroSpeech(text, messageId, scope = 'default') {
  const supported = typeof window !== 'undefined' && typeof window.speechSynthesis?.speak === 'function' && typeof window.SpeechSynthesisUtterance === 'function';
  const storageKey = `newgears_giro_voice_v2:${scope}`;
  const [preferences, setPreferences] = useState(() => { try { return readGiroVoicePreferences(localStorage, storageKey); } catch { return giroVoicePreferences(); } });
  const [voices, setVoices] = useState([]);
  const [playback, setPlayback] = useState(null);
  const current = useRef(null);

  const cancel = useCallback(() => {
    const request = current.current;
    if (!request) return;
    current.current = null;
    window.clearTimeout(request.timeout);
    window.clearTimeout(request.gap);
    for (const utterance of request.utterances) {
      utterance.onstart = null;
      utterance.onend = null;
      utterance.onerror = null;
    }
    window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (!supported) return;
    let active = true;
    const refresh = () => { if (active) { try { setVoices(portugueseGiroVoices(window.speechSynthesis.getVoices())); } catch { /* The next voiceschanged event can retry. */ } } };
    queueMicrotask(refresh);
    window.speechSynthesis.addEventListener?.('voiceschanged', refresh);
    return () => { active = false; window.speechSynthesis.removeEventListener?.('voiceschanged', refresh); };
  }, [supported]);

  useEffect(() => cancel, [text, messageId, cancel]);

  const stop = useCallback(() => { cancel(); setPlayback(null); }, [cancel]);
  const configure = (patch) => {
    stop();
    const next = giroVoicePreferences({ ...preferences, ...patch });
    setPreferences(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* The selection remains usable in this session. */ }
  };

  const speak = () => {
    if (!supported || !text) return;
    cancel();
    const synthesis = window.speechSynthesis;
    const chunks = giroSpeechChunks(text);
    if (!chunks.length) return;
    const request = { utterances: [], timeout: null, gap: null, activeUtterance: null };
    current.current = request;
    const update = (phase, error = '') => setPlayback({ text, messageId, phase, error });
    const fail = (event) => {
      if (current.current !== request) return;
      cancel();
      const error = event?.error === 'network' ? 'Esta voz precisa de conexão. Tente outra voz ou confira a internet.'
        : ['voice-unavailable', 'language-unavailable', 'synthesis-unavailable'].includes(event?.error) ? 'Esta voz não está disponível agora. Escolha outra opção em Voz e ritmo.'
          : 'Não consegui iniciar a voz. Confira o áudio do navegador e tente outra opção em Voz e ritmo.';
      update('error', error);
    };
    let available;
    try { available = synthesis.getVoices(); } catch { available = voices; }
    const voice = chooseGiroVoice(available, preferences.voice, navigator.onLine !== false);
    const play = (index) => {
      if (current.current !== request) return;
      const utterance = new window.SpeechSynthesisUtterance(chunks[index]);
      request.utterances.push(utterance);
      request.activeUtterance = utterance;
      utterance.lang = voice?.lang || 'pt-BR';
      if (voice) utterance.voice = voice;
      utterance.rate = preferences.rate;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => {
        if (current.current !== request || request.activeUtterance !== utterance) return;
        window.clearTimeout(request.timeout);
        update('speaking');
      };
      utterance.onend = () => {
        if (current.current !== request || request.activeUtterance !== utterance) return;
        request.activeUtterance = null;
        window.clearTimeout(request.timeout);
        if (index + 1 < chunks.length) {
          update('between');
          request.gap = window.setTimeout(() => play(index + 1), 110);
        } else { current.current = null; update('idle'); }
      };
      utterance.onerror = (event) => { if (request.activeUtterance === utterance) fail(event); };
      update('starting');
      request.timeout = window.setTimeout(fail, 10000);
      try { synthesis.speak(utterance); if (synthesis.paused) synthesis.resume(); } catch { fail(); }
    };
    play(0);
  };

  const active = playback?.text === text && playback?.messageId === messageId;
  const phase = active ? playback.phase : 'idle';
  const selected = chooseGiroVoice(voices, preferences.voice, typeof navigator === 'undefined' || navigator.onLine !== false);
  return {
    supported, speak, stop, configure, voices,
    voice: voices.some((voice) => giroVoiceId(voice) === preferences.voice) ? preferences.voice : 'auto',
    voiceName: selected?.name || 'Padrão em português', rate: preferences.rate,
    speaking: phase === 'speaking', playing: ['starting', 'speaking', 'between'].includes(phase), starting: phase === 'starting', error: active ? playback.error : '',
  };
}
