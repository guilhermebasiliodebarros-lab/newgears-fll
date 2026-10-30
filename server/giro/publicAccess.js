import { ApiError } from '../reports/firebase.js';

const cookieName = 'giro_public_client';
const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// This cookie identifies a browser for throttling only; it grants no account access.
export function publicGiroClient(request) {
  const existing = request.headers.get('Cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const id = validId.test(existing || '') ? existing : crypto.randomUUID();
  return { id, headers: existing === id ? {} : { 'Set-Cookie': `${cookieName}=${id}; Path=/api/giro-ai; Max-Age=86400; HttpOnly; Secure; SameSite=Strict` } };
}

// Best-effort limits per Worker isolate. No Firebase credentials, database writes,
// student identifiers, or paid services are needed for this explicitly public mode.
export function createPublicGiroLimiter(now = Date.now) {
  let window = -1; let total = 0; let active = 0;
  const browsers = new Map(); const networks = new Map();
  return (request, clientId) => {
    const nextWindow = Math.floor(now() / 60000);
    if (window !== nextWindow) { window = nextWindow; total = 0; browsers.clear(); networks.clear(); }
    // Cloudflare supplies this header. Do not trust client-supplied forwarding headers.
    const network = request.headers.get('CF-Connecting-IP') || 'unknown';
    const browserCount = browsers.get(clientId) || 0;
    const networkCount = networks.get(network) || 0;
    if (browserCount >= 8 || networkCount >= 60 || total >= 120 || active >= 6) throw new ApiError(429, 'O Giro está atendendo várias perguntas. Aguarde um minuto e tente novamente.');
    browsers.set(clientId, browserCount + 1); networks.set(network, networkCount + 1); total++; active++;
    let released = false;
    return () => { if (!released) { released = true; active--; } };
  };
}

export const reservePublicGiroUsage = createPublicGiroLimiter();
