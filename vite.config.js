import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
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
