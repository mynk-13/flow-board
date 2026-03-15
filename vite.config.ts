import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React runtime — tiny, keep in main
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react'
          }
          // Firebase — largest dependency, lazy-load separately
          if (id.includes('node_modules/firebase/') || id.includes('node_modules/@firebase/')) {
            return 'firebase'
          }
          // Socket.io client
          if (id.includes('node_modules/socket.io-client') || id.includes('node_modules/engine.io-client')) {
            return 'socket'
          }
          // dnd-kit
          if (id.includes('node_modules/@dnd-kit/')) {
            return 'dndkit'
          }
          // TanStack (Query + Virtual)
          if (id.includes('node_modules/@tanstack/')) {
            return 'tanstack'
          }
          // Lucide icons — imported selectively but the tree can be large
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide'
          }
          // Routing
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run/')) {
            return 'router'
          }
        },
      },
    },
  },
})
