import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://localhost:5176',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --host localhost --port 5176',
    env: {
      ...process.env,
      VITE_GOOGLE_MAPS_API_KEY: 'playwright-google-maps-key',
      VITE_GOOGLE_PLACES_API_KEY: 'playwright-google-places-key',
    },
    reuseExistingServer: !process.env.CI,
    url: 'http://localhost:5176/login',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
