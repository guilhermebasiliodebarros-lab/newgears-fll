import { auth } from '../firebase';

const base = '/api/giro-ai';
async function giroRequest(path, options = {}) {
  const headers = { ...options.headers };
  if (auth.currentUser) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  let response;
  try { response = await fetch(`${base}/${path}`, { ...options, headers }); }
  catch (error) { if (error.name === 'AbortError') throw error; throw new Error('Não foi possível conectar ao Giro IA. Confira sua conexão e tente novamente.'); }
  let data;
  try { data = await response.json(); }
  catch { throw new Error('O servidor do Giro IA ainda não está disponível neste endereço. Peça ao técnico para ativá-lo.'); }
  if (!response.ok) throw new Error(response.status === 401 ? 'Entre com uma conta autenticada para conversar com o Giro IA neste site.' : data.error || 'O Giro IA não conseguiu responder agora.');
  return data;
}

export const getGiroAIStatus = (signal) => giroRequest('status', { signal });
export const askGiroAI = (conversation, signal) => giroRequest('chat', { method: 'POST', signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(conversation) });
