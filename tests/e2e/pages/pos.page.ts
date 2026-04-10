import { expect, type Page } from '@playwright/test';

export class POSPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/pos');
  }

  async expectLoaded() {
    await expect(
      this.page.getByRole('heading', { name: /iniciar nueva venta|punto de venta|pos/i }).first(),
    ).toBeVisible();
  }

  async searchProduct(query: string) {
    await this.page
      .getByPlaceholder(/escanea o busca un producto para iniciar la venta/i)
      .fill(query);
  }

  async selectProductFromResults(productName: string) {
    await this.page.getByRole('button', { name: new RegExp(productName, 'i') }).click();
  }

  async expectFloatingCartVisible() {
    await expect(this.page.getByRole('button', { name: /carrito/i })).toBeVisible();
  }

  async openFloatingCart() {
    await this.page.getByRole('button', { name: /carrito/i }).click();
  }

  async expectFloatingCartHidden() {
    await expect(this.page.getByRole('button', { name: /carrito/i })).not.toBeVisible();
  }

  async openAdvancedSearch() {
    await this.page.getByRole('button', { name: /ver cat[aá]logo completo/i }).click();
  }
}
