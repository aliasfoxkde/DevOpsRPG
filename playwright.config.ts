import { defineConfig, devices } from '@playwright/test'

// E2E gets its own dedicated port, decoupled from the dev-server default:
// 5173 is Vite's default, so any other checkout running `vite` on this
// machine (local `reuseExistingServer`) would otherwise silently serve the
// wrong app to every test. Override with E2E_PORT if this one is taken.
// Host is pinned to 127.0.0.1: Vite may bind IPv6 ::1 while the browser
// resolves localhost to IPv4, and other servers may hold 0.0.0.0.
const port = Number(process.env.E2E_PORT) || 5299
const host = '127.0.0.1'
const baseURL = `http://${host}:${String(port)}`

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
    command: `npm run dev -- --port ${String(port)} --host ${host} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
})
