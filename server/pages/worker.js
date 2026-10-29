import { handleNvidiaGiroRequest } from '../giro/nvidia.js';
import { handleReportsRequest } from '../reports/api.js';

// Advanced-mode Pages entry for prebuilt uploads. Secrets are supplied at runtime.
export default {
  fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/giro-ai' || path.startsWith('/api/giro-ai/')) return handleNvidiaGiroRequest(request, env);
    if (path === '/api/reports' || path.startsWith('/api/reports/')) return handleReportsRequest(request, env);
    return env.ASSETS.fetch(request);
  },
};
