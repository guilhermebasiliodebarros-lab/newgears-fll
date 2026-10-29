import { build } from 'vite';

// First build the application; then add a bundled Pages Worker for direct upload.
// This second build does not load .env files or substitute any runtime secrets.
await build();
await build({
  configFile: false,
  envFile: false,
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: { entry: 'server/pages/worker.js', formats: ['es'], fileName: () => '_worker.js' },
    minify: false,
  },
});
console.log('Cloudflare Pages: dist inclui o site, _routes.json e _worker.js. As credenciais devem ser configuradas no painel Cloudflare.');
