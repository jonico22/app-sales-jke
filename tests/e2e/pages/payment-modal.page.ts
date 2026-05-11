import { expect, type Page } from '@playwright/test';

export class PaymentModalPage {
  constructor(private readonly page: Page) {}

  async expectOpen() {
    await expect(this.page.getByText(/procesar pago/i)).toBeVisible();
  }

  async confirm() {
    await this.page.getByRole('button', { name: /confirmar pago/i }).click();
  }
}
