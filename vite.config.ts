/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Pre-bundle core deps at server start so the first page load doesn't
    // trigger mid-session re-optimization reloads (breaks E2E cold starts).
    include: ['react', 'react-dom', 'react-router-dom', 'clsx', 'lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: resolve(__dirname, './src/test/setup.ts'),
    // Only pick up tests from src/ — the repo checkout can contain
    // symlinked tooling directories (e.g. .claude) whose own tests
    // must not run as part of this project's suite.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/components/layout/**',
        '**/e2e/**',
      ],
    },
  },
})
