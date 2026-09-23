import { defineConfig, devices } from '@playwright/test'

// Port can be overridden (e.g. when 5173 is occupied by another dev server):
//   E2E_PORT=5174 npm run test:e2e
// Host is pinned to 127.0.0.1: Vite may bind IPv6 ::1 while the browser
// resolves localhost to IPv4, and other servers may hold 0.0.0.0:5173.
const port = Number(process.env.E2E_PORT) || 5173
const host = '127.0.0.1'
const baseURL = `http://${host}:${port}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${port} --host ${host} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
})
