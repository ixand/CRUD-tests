// Оновлення сесії Google для тестів.
// Google блокує логін у браузері під керуванням Playwright ("This browser or app may not be secure"),
// тому логінимось вручну у звичайному Chrome, а сесію забираємо з його профілю.
//
// Використання: npm run auth            — зберегти playwright/.auth/user.json
//               npm run auth -- --push  — і оновити секрет PLAYWRIGHT_AUTH_STATE у GitHub
const { spawnSync } = require('child_process');
const path = require('path');
const { chromium } = require('@playwright/test');

const authDir = path.join(__dirname, '../playwright/.auth');
const profileDir = path.join(authDir, 'chrome-profile');
const authFile = path.join(authDir, 'user.json');

(async () => {
  console.log('Залогінься в Chrome, дочекайся календаря і повністю закрий вікно...');
  // окремий профіль -> окремий процес, тож spawnSync чекає саме на закриття цього вікна
  spawnSync('google-chrome', [`--user-data-dir=${profileDir}`, 'https://calendar.google.com'], { stdio: 'ignore' });

  // без цих дефолтних флагів Playwright Chrome не розшифрує cookies, збережені через системний keyring
  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: false,
    ignoreDefaultArgs: ['--password-store=basic', '--use-mock-keychain'],
  });
  const page = context.pages()[0] ?? await context.newPage();
  await page.goto('https://calendar.google.com');
  const loggedIn = await page.waitForURL('**/calendar/u/**', { timeout: 15000 }).then(() => true, () => false);
  if (loggedIn) await context.storageState({ path: authFile });
  await context.close();

  if (!loggedIn) {
    console.error('Сесії немає: календар не відкрився без логіну. Спробуй ще раз.');
    process.exit(1);
  }
  console.log('Сесію збережено:', authFile);

  if (process.argv.includes('--push')) {
    const result = spawnSync('gh', ['secret', 'set', 'PLAYWRIGHT_AUTH_STATE'], {
      input: require('fs').readFileSync(authFile),
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    process.exit(result.status ?? 1);
  }
})();
