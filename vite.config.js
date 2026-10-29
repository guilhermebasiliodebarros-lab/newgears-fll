import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { giroAIDevPlugin } from './server/giro/vite.js'
import { readFileSync } from 'node:fs'

const voiceRuntime = JSON.parse(readFileSync(new URL('./node_modules/onnxruntime-web/package.json', import.meta.url), 'utf8'))
const voiceWasmURL = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${voiceRuntime.version}/dist/ort-wasm-simd-threaded.asyncify.wasm`
const voiceCDNPlugin = {
  name: 'giro-voice-cdn-runtime',
  apply: 'build',
  generateBundle(_options, bundle) {
    // The worker explicitly sets wasmPaths to the matching CDN runtime. Vite's
    // unused fallback exceeds the 25 MiB Cloudflare Pages asset limit.
    for (const [name, asset] of Object.entries(bundle)) {
      if (asset.type === 'asset' && /ort-wasm-simd-threaded\.asyncify.*\.wasm$/.test(name)) delete bundle[name]
    }
  },
}

export default defineConfig({
  plugins: [react(), giroAIDevPlugin(), voiceCDNPlugin],
  define: { __GIRO_VOICE_WASM_URL__: JSON.stringify(voiceWasmURL) },
  optimizeDeps: { include: ['@huggingface/transformers'] },
  worker: { format: 'es' },
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('pdfjs-dist')) return 'vendor-pdf-reader'
          if (id.includes('pdf-lib') || id.includes('/pako/')) return 'vendor-pdf'
          if (id.includes('firebase')) return 'vendor-firebase'
          if (id.includes('react-confetti')) return 'vendor-confetti'
          if (id.includes('konva') || id.includes('react-konva') || id.includes('use-image')) return 'vendor-konva'
          if (id.includes('lucide-react')) return 'vendor-lucide'
          if (id.includes('react-dom') || id.includes('react')) return 'vendor-react'
          return 'vendor'
        },
      },
    },
  },
})
