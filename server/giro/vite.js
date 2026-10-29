/* global Buffer, process */
import { loadEnv } from 'vite';
import { handleNvidiaGiroRequest } from './nvidia.js';
import { GIRO_REQUEST_MAX_BYTES } from '../../src/utils/giroMedia.js';

export const giroAIDevPlugin = () => ({
  name: 'newgears-giro-ai-local',
  configureServer(server) {
    server.middlewares.use('/api/giro-ai', async (req, res) => {
      const address = req.socket.remoteAddress;
      const host = req.headers.host || '';
      if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address) || !/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)) { res.writeHead(403); res.end(); return; }
      const controller = new AbortController();
      const close = () => { if (!res.writableEnded) controller.abort(); };
      res.on('close', close);
      try {
        const chunks = []; let length = 0;
        for await (const chunk of req) { length += chunk.length; if (length > GIRO_REQUEST_MAX_BYTES) { res.writeHead(413, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'A conversa está muito grande.' })); return; } chunks.push(chunk); }
        const body = Buffer.concat(chunks);
        const request = new Request(`http://${host}${req.originalUrl || `/api/giro-ai${req.url}`}`, { method: req.method, headers: req.headers, signal: controller.signal, ...(!['GET', 'HEAD'].includes(req.method) ? { body } : {}) });
        const env = { ...loadEnv(server.config.mode, server.config.envDir, ''), ...process.env };
        const response = await handleNvidiaGiroRequest(request, env, { local: true });
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch { if (!res.writableEnded) { res.writeHead(502, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'O servidor local do Giro IA não conseguiu responder.' })); } }
      finally { res.off('close', close); }
    });
  },
});
