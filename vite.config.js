import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { giroAIDevPlugin } from './server/giro/vite.js'

export default defineConfig({
  plugins: [react(), giroAIDevPlugin()],
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
