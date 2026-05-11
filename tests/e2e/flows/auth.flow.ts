import { expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

export async function loginWithDefaultUser(page: Page) {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing TEST_USER_EMAIL or TEST_USER_PASSWORD for authenticated Playwright tests.');
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.expectVisible();
  await loginPage.fillCredentials(email, password);
  await loginPage.submitWithBypass();

  await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), { timeout: 20_000 });
  await expect(page).toHaveURL(/^(?!.*\/auth\/login).*/);
}
