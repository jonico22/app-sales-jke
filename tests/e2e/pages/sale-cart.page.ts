import { expect, type Page } from '@playwright/test';

export class SaleCartPage {
  constructor(private readonly page: Page) {}

  async expectOpen() {
    await expect(this.page.getByText(/venta actual/i)).toBeVisible();
  }

  async expectClosed() {
    await expect(this.page.getByText(/venta actual/i)).not.toBeVisible();
  }

  async registerPendingOrder() {
    await this.page.getByRole('button', { name: /registar pedido/i }).click();
  }

  async registerSale() {
    await this.page.getByRole('button', { name: /registar venta/i }).click();
  }
}
