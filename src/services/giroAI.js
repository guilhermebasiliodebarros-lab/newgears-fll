import { auth } from '../firebase';
import { requestGiroJSON, validateGiroReply } from '../utils/giroTransport';

const base = '/api/giro-ai';
let publicAccess = false;
async function giroRequest(path, options = {}) {
  return requestGiroJSON(`${base}/${path}`, { ...options, timeoutMs: path === 'status' ? 12000 : 100000, getToken: path === 'status' || publicAccess ? undefined : () => auth.currentUser?.getIdToken() });
}

export const getGiroAIStatus = async (signal) => {
  const status = await giroRequest('status', { signal });
  publicAccess = status.authentication === 'public';
  return status;
};
export const askGiroAI = async (conversation, signal) => validateGiroReply(await giroRequest('chat', { method: 'POST', signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(conversation) }));
