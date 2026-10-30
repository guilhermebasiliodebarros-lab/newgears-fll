import { safeGiroURL } from './giroAI.js';

export function validateGiroReply(data) {
  if (typeof data?.text !== 'string' || !data.text.trim() || data.text.length > 16000) throw new Error('O Giro não recebeu uma resposta completa. Sua pergunta foi mantida para tentar novamente.');
  const sources = (Array.isArray(data.sources) ? data.sources : []).filter((source) => source && (source.type === 'internal' ? (typeof source.materialId === 'string' && /^[a-zA-Z0-9_-]{1,200}$/.test(source.materialId) && Number.isInteger(source.page) && source.page >= 1 && source.page <= 200) : safeGiroURL(source.url))).slice(0, 12).map((source) => ({
    ...(source.type === 'internal' ? { type: 'internal', materialId: source.materialId, page: source.page, number: Number.isInteger(source.number) && source.number >= 1 && source.number <= 4 ? source.number : undefined, system: source.system === true } : {}),
    title: String(source.title || 'Fonte').slice(0, 240), url: safeGiroURL(source.url) || '',
  }));
  return { text: data.text.trim(), sources, searched: data.searched === true, mode: typeof data.mode === 'string' ? data.mode.slice(0, 32) : '' };
}

// The deadline covers authentication, headers and the response body, not just fetch().
export async function requestGiroJSON(url, { signal, timeoutMs = 100000, getToken, fetcher = fetch, ...options } = {}) {
  const abort = new AbortController();
  let timedOut = false;
  const forwardAbort = () => abort.abort();
  signal?.addEventListener('abort', forwardAbort, { once: true });
  if (signal?.aborted) abort.abort();
  const timer = setTimeout(() => { timedOut = true; abort.abort(); }, timeoutMs);
  let rejectAbort;
  const cancelled = new Promise((_, reject) => { rejectAbort = () => reject(new DOMException('Cancelled', 'AbortError')); });
  abort.signal.addEventListener('abort', rejectAbort, { once: true });
  if (abort.signal.aborted) rejectAbort();
  try {
    const result = (async () => {
      if (abort.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
      const token = await getToken?.();
      if (abort.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
      const response = await fetcher(url, { ...options, signal: abort.signal, headers: { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
      let data;
      try { data = await response.json(); }
      catch (issue) { if (abort.signal.aborted || issue?.name === 'AbortError') throw issue; throw new Error('O servidor do Giro IA ainda não está disponível neste endereço. Peça ao técnico para conferir a configuração.'); }
      if (!response.ok) {
        const message = response.status === 401 ? 'Entre com uma conta autenticada para conversar com o Giro IA neste site.' : typeof data?.error === 'string' ? data.error.slice(0, 800) : 'O Giro IA não conseguiu responder agora.';
        const error = Object.assign(new Error(message), { status: response.status });
        if (response.status === 429) error.retryAfter = Math.min(120, Math.max(1, Number(response.headers.get('Retry-After')) || 60));
        throw error;
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('A resposta do Giro IA não pôde ser lida. Tente novamente.');
      return data;
    })();
    return await Promise.race([result, cancelled]);
  } catch (issue) {
    if (timedOut) throw new Error('O Giro demorou para responder. Sua pergunta foi mantida; você pode tentar novamente ou consultar as dicas locais.');
    if (abort.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    if (issue instanceof TypeError) throw new Error('Não foi possível conectar ao Giro IA. Confira sua conexão e tente novamente.');
    throw issue;
  } finally {
    clearTimeout(timer); signal?.removeEventListener('abort', forwardAbort); abort.signal.removeEventListener('abort', rejectAbort);
  }
}
