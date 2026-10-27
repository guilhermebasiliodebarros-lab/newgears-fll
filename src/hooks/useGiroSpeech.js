import { useCallback, useEffect, useRef, useState } from 'react';

// Speech is always started by a click, using the voices installed in the browser.
export default function useGiroSpeech(text, messageId) {
  const supported = typeof window !== 'undefined' && typeof window.speechSynthesis?.speak === 'function' && typeof window.SpeechSynthesisUtterance === 'function';
  const current = useRef(null);
  const [playback, setPlayback] = useState(null);

  const cancel = useCallback(() => {
    const request = current.current;
    if (!request) return;
    current.current = null;
    window.clearTimeout(request.timeout);
    request.utterance.onstart = null;
    request.utterance.onend = null;
    request.utterance.onerror = null;
    window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    // Asking for the list also lets browsers load their voices before the click.
    if (supported) {
      try { window.speechSynthesis.getVoices(); } catch { /* The click can retry when browser voices become available. */ }
    }
    return cancel;
  }, [supported, text, messageId, cancel]);

  const stop = useCallback(() => {
    cancel();
    setPlayback(null);
  }, [cancel]);

  const speak = () => {
    if (!supported || !text) return;
    cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    const request = { utterance, timeout: null };
    const synthesis = window.speechSynthesis;
    const update = (phase, error = '') => setPlayback({ text, messageId, phase, error });
    const fail = () => {
      if (current.current !== request) return;
      cancel();
      update('error', 'Não consegui iniciar a voz. Confira o áudio do navegador e tente novamente.');
    };
    current.current = request;
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1.12;
    utterance.volume = 1;
    utterance.onstart = () => {
      if (current.current !== request) return;
      window.clearTimeout(request.timeout);
      update('speaking');
    };
    utterance.onend = () => {
      if (current.current !== request) return;
      window.clearTimeout(request.timeout);
      current.current = null;
      update('idle');
    };
    utterance.onerror = fail;
    update('starting');
    request.timeout = window.setTimeout(fail, 8000);
    try {
      const voices = synthesis.getVoices();
      const language = (voice) => voice.lang.toLowerCase().replace('_', '-');
      const voice = voices.find((item) => language(item) === 'pt-br') || voices.find((item) => language(item).startsWith('pt'));
      if (voice) utterance.voice = voice;
      synthesis.speak(utterance);
      if (synthesis.paused) synthesis.resume();
    } catch { fail(); }
  };

  const active = playback?.text === text && playback?.messageId === messageId;
  const phase = active ? playback.phase : 'idle';
  return {
    supported, speak, stop,
    speaking: phase === 'speaking',
    playing: phase === 'starting' || phase === 'speaking',
    starting: phase === 'starting',
    error: active ? playback.error : '',
  };
}
