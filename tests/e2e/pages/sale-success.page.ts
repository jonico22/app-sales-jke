import { expect, type Page } from '@playwright/test';

export class SaleSuccessPage {
  constructor(private readonly page: Page) {}

  async expectOpen() {
    await expect(this.page.getByText(/venta realizada con [ée]xito/i)).toBeVisible();
  }

  async close() {
    await this.page.getByRole('button', { name: /iniciar nueva venta/i }).click();
  }
}
