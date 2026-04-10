import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/auth/login?test=true');
  }

  async expectVisible() {
    await expect(this.page.getByRole('heading', { name: /iniciar sesi[oó]n/i })).toBeVisible();
  }

  async fillCredentials(email: string, password: string) {
    await this.page.locator('input#email').fill(email);
    await this.page.locator('input#password').fill(password);
  }

  async submitWithBypass() {
    await this.page.setExtraHTTPHeaders({
      'x-turnstile-token': 'test-turnstile-bypass',
    });
    await this.page.getByRole('button', { name: /ingresar/i }).click();
  }

  async expectLoginScreen() {
    await expect(this.page).toHaveURL(/\/auth\/login/);
    await this.expectVisible();
  }
}
