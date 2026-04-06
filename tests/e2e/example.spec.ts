import { test, expect } from '@playwright/test';

test.describe('Sales App Smoke Test', () => {
  test('should load the login page and bypass Turnstile', async ({ page }) => {
    // Navigate with test=true to bypass Turnstile
    await page.goto('/auth/login?test=true');

    // Check if the title is correct
    await expect(page).toHaveTitle(/Inventario JKE/i);
    
    // Check for login header
    const loginHeader = page.getByRole('heading', { name: /Iniciar Sesión/i });
    await expect(loginHeader).toBeVisible();

    // The button should be ENABLED because of the bypass
    const loginButton = page.getByRole('button', { name: /Ingresar/i });
    await expect(loginButton).toBeEnabled();
  });

  test('should show validation errors on empty login (with bypass)', async ({ page }) => {
    await page.goto('/auth/login?test=true');
    
    // Click submit without filling anything
    await page.getByRole('button', { name: /Ingresar/i }).click();
    
    // Verify error messages
    await expect(page.getByText(/Por favor ingresa un correo válido/i)).toBeVisible();
    await expect(page.getByText(/La contraseña debe tener al menos 6 caracteres/i)).toBeVisible();
  });
});
