import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    ...(process.env.CI ? [] : [
      {
        name: 'setup',
        testMatch: /.*\.setup\.ts/,
      },
    ]),
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: process.env.CI ? undefined : 'playwright/.auth/user.json',
      },
      dependencies: process.env.CI ? [] : ['setup'],
    },
  ],
  webServer: {
    command: 'PORT=3001 pnpm dev',
    url: 'http://localhost:3001',
    reuseExistingServer: true, // Reuse the dev server if running
    timeout: 120 * 1000,
  },
});
