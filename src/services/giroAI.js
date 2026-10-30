import { auth } from '../firebase';
import { requestGiroJSON, validateGiroReply } from '../utils/giroTransport';

const base = '/api/giro-ai';
async function giroRequest(path, options = {}) {
  return requestGiroJSON(`${base}/${path}`, { ...options, timeoutMs: path === 'status' ? 12000 : 100000, getToken: () => auth.currentUser?.getIdToken() });
}

export const getGiroAIStatus = (signal) => giroRequest('status', { signal });
export const askGiroAI = async (conversation, signal) => validateGiroReply(await giroRequest('chat', { method: 'POST', signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(conversation) }));
