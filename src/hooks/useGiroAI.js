import { useEffect, useRef, useState } from 'react';
import { askGiroAI, getGiroAIStatus } from '../services/giroAI';
import { GIRO_AI_MAX_QUESTION, restoreGiroConversation } from '../utils/giroAI';
import { prepareGiroAIRequest } from '../utils/giroConversation';

export default function useGiroAI(scope, knowledge, context) {
  const key = `newgears_giro_nvidia_v1:${encodeURIComponent(scope)}`;
  const [session, setSession] = useState(() => restoreGiroConversation(localStorage, key));
  const latest = useRef(session);
  const [storageError, setStorageError] = useState(false);
  const [status, setStatus] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const [retry, setRetry] = useState(0);
  const [useKnowledge, setUseKnowledge] = useState(true);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const controller = useRef(null);
  const commit = (next) => {
    latest.current = next; setSession(next);
    try { localStorage.setItem(key, JSON.stringify({ version: 1, ...next })); setStorageError(false); }
    catch { setStorageError(true); }
  };
  useEffect(() => {
    const abort = new AbortController();
    getGiroAIStatus(abort.signal).then((data) => { if (!abort.signal.aborted) { setStatus(data); setConnectionError(''); } }).catch((issue) => { if (!abort.signal.aborted) setConnectionError(issue.message); });
    return () => abort.abort();
  }, [retry]);
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);
  const cancel = () => { controller.current?.abort(); controller.current = null; setPending(null); };
  const ready = Boolean(status?.ready && !connectionError && (!useKnowledge || (!knowledge.loading && !knowledge.error)));
  const send = async (images = []) => {
    const question = latest.current.draft.trim() || (images.length ? 'Analise as fotos anexadas e me ajude a entender o que está visível.' : '');
    if (!question || question.length > GIRO_AI_MAX_QUESTION || controller.current || !ready) return false;
    const abort = new AbortController(); controller.current = abort; setError(''); setPending(question);
    try {
      const payload = prepareGiroAIRequest({ question, messages: latest.current.messages, knowledge, context, useKnowledge, attachments: images });
      const answer = await askGiroAI(payload, abort.signal);
      if (controller.current !== abort || abort.signal.aborted) return false;
      commit({ draft: '', messages: [...latest.current.messages, { id: crypto.randomUUID(), role: 'user', text: question, media: images.map((image) => ({ kind: 'image', name: image.name })) }, { id: crypto.randomUUID(), role: 'assistant', ...answer }].slice(-32) });
      return true;
    } catch (issue) { if (controller.current === abort && !abort.signal.aborted) setError(issue.message); }
    finally { if (controller.current === abort) { controller.current = null; setPending(null); } }
  };
  return { ...session, pending, ready, error, status, connectionError, storageError, useKnowledge, setUseKnowledge,
    appendTranscript: (text) => {
      const draft = [latest.current.draft.trim(), text.trim()].filter(Boolean).join('\n\n');
      if (draft.length > GIRO_AI_MAX_QUESTION) return false;
      commit({ ...latest.current, draft }); return true;
    },
    setDraft: (draft) => commit({ ...latest.current, draft: draft.slice(0, GIRO_AI_MAX_QUESTION) }),
    send, cancel, reconnect: () => { if (knowledge.error) knowledge.retry(); setRetry((value) => value + 1); },
    clear: () => { cancel(); setError(''); commit({ draft: '', messages: [] }); },
  };
}
