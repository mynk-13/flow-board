import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.d.ts',
        // Infrastructure / Firebase-dependent code — covered by E2E
        'src/lib/firebase.ts',
        'src/lib/firestore.ts',
        'src/lib/socket.ts',
        // Complex page & layout components — covered by E2E
        'src/pages/**',
        'src/app/**',
        'src/features/**',
        // Application entry points — not unit-testable in isolation
        'src/main.tsx',
        'src/counter.ts',
        'src/App.tsx',
        // Barrel re-export files — no logic to test
        'src/**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
