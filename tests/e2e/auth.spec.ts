import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'Test credentials not found in environment variables');
    }

    // 1. Navigate to login page with Turnstile bypass
    await page.goto('/auth/login?test=true');

    // 2. Fill login form
    await page.fill('input#email', email!);
    await page.fill('input#password', password!);

    // 3. Submit form
    await page.click('button[type="submit"]');

    // 4. Verify successful login
    // Depending on your app, this could be a redirection to '/' or a dashboard
    // and the appearance of a specific element (like a logout button or profile)
    
    // Wait for navigation and verify URL
    await expect(page).toHaveURL('/');
    
    // Verify success toast or welcome message if applicable
    // Example: await expect(page.getByText(/¡Bienvenido!/i)).toBeVisible();
    
    // Alternatively, verify that we are no longer on the login page
    const loginHeader = page.getByRole('heading', { name: /Iniciar Sesión/i });
    await expect(loginHeader).not.toBeVisible();
  });
});
