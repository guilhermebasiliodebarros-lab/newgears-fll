import { handleDiagnosticsRequest } from './api.js';

export const diagnosticsDevPlugin = () => ({
  name: 'newgears-diagnostics-local',
  configureServer(server) {
    server.middlewares.use('/api/diagnostics', async (req, res) => {
      try {
        const host = req.headers.host || '';
        if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) { res.writeHead(403); res.end(); return; }
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 6000) { res.writeHead(413); res.end(); return; } chunks.push(chunk); }
        const request = new Request(`http://${host}/api/diagnostics`, { method: req.method, headers: req.headers, ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: Buffer.concat(chunks) }) });
        const response = await handleDiagnosticsRequest(request, {});
        res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text());
      } catch { res.writeHead(400); res.end(); }
    });
  },
});
