import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // open: 'never' — інакше при падінні репортер піднімає сервер і CI висить до таймауту
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'https://calendar.google.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.CI ? true : false
  },

    projects: [
       {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // готовий auth state: в CI з секрету, локально — з npm run auth
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});
