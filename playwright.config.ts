import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });


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
        // готовий auth state
        storageState: process.env.CI 
          ? 'playwright/.auth/user.json'  // В CI з секрету
          : 'playwright/.auth/user.json', // Локально теж звідси
      },
    },
    {
      // локальне отримання сесії: npx playwright test --project=auth
      name: 'auth',
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
