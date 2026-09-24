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
    // Page suites render 150-item lists; under coverage instrumentation and
    // CI's 2-core runners the 5s default is too tight. Still short enough to
    // catch genuine hangs.
    testTimeout: 15_000,
    // Only pick up tests from src/ — the repo checkout can contain
    // symlinked tooling directories (e.g. .claude) whose own tests
    // must not run as part of this project's suite.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/components/layout/**',
        '**/e2e/**',
      ],
      // Ratchet, not a target: each threshold is pinned just below the
      // measured value at the time it was set, so coverage can only move up.
      // Measured 2026-09-23: stmts 62.63 / branch 58.30 / funcs 62.23 / lines 65.24
      // Measured 2026-09-24: stmts 65.51 / branch 59.25 / funcs 65.88 / lines 68.08
      // Measured 2026-09-24 (post campaign): stmts 91.02 / branch 81.34 / funcs 89.22 / lines 92.78
      // (see docs/decisions/0004-coverage-ratchet-policy.md).
      thresholds: {
        statements: 90.5,
        branches: 80.5,
        functions: 88.5,
        lines: 92,
      },
    },
  },
})
