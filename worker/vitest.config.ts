import { defineConfig } from 'vitest/config'

// The worker router is tested with the platform Request/Response/Headers that
// Node provides natively; KV and D1 are exercised through typed in-memory
// fakes defined in the test file.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
