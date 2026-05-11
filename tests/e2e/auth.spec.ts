import { test, expect } from '@playwright/test';
import { loginAsDefaultUser } from './utils/auth';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';
import { POSPage } from './pages/pos.page';
import { AdvancedSearchPage } from './pages/advanced-search.page';

test.describe('Authentication Flow', () => {
  test.beforeEach(async () => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'Test credentials not found in environment variables');
    }
  });

  test('should login successfully with valid credentials @manual', async ({ page }) => {
    await loginAsDefaultUser(page);

    await expect(page).toHaveURL(/^(?!.*\/auth\/login).*/);
    
    await expect(page.getByRole('heading', { name: /Iniciar Sesión/i })).not.toBeVisible();
    await expect(page).toHaveURL(/^(?!.*\/auth\/login).*/);
  });

  test('should open protected POS and search routes after real login @manual', async ({ page }) => {
    await loginAsDefaultUser(page);

    const posPage = new POSPage(page);
    const advancedSearchPage = new AdvancedSearchPage(page);

    await posPage.goto();
    await posPage.expectLoaded();

    await advancedSearchPage.goto();
    await advancedSearchPage.expectLoaded();
  });

  test('should logout and return to login screen @manual', async ({ page }) => {
    await loginAsDefaultUser(page);

    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    await dashboardPage.goto();
    await dashboardPage.logout();

    await loginPage.expectLoginScreen();
  });
});
