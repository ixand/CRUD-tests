import { Page, Locator} from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly emailNextBtn: Locator;
  readonly passwordInput: Locator;
  readonly passwordNextBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    // точні інпути
    this.emailInput = page.locator('input[name="identifier"]');
    this.emailNextBtn = page.locator('#identifierNext');
    this.passwordInput = page.locator('input[type="password"][name="Passwd"]');
    this.passwordNextBtn = page.locator('#passwordNext');
  }

  async login(email: string, password: string): Promise<void> {
    if (!email || !password) throw new Error('Missing GOOGLE_EMAIL/GOOGLE_PASSWORD');

    await this.page.goto('https://accounts.google.com/signin');
    // email
    await this.emailInput.fill(email);
    await this.emailNextBtn.click();

    // пароль
    await this.passwordInput.fill(password);
    await this.passwordNextBtn.click();
  }
}
