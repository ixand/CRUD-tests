import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TEST_USER } from '../data/testData';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate with Google', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  // Виконуємо логін
  await loginPage.login(TEST_USER.email!, TEST_USER.password!);
  
  // Чекаємо на завантаження календаря (значить логін успішний)
  // 60с — щоб встигнути вручну підтвердити вхід, якщо Google попросить
  await page.waitForURL('**/myaccount.google.com/**', { timeout: 60000 });
  
  // Зберігаємо стан авторизації
  await page.context().storageState({ path: authFile });
  
  console.log('Auth state saved to:', authFile);
});