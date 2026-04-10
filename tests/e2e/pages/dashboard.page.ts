import { expect, type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL('/');
    await expect(this.page.getByText(/dashboard/i).first()).toBeVisible();
    await expect(this.page.getByText(/jke solutions/i).first()).toBeVisible();
  }

  async logout() {
    await this.page.getByRole('button', { name: /cerrar sesi[oó]n/i }).click();
  }
}
