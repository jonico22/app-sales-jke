import { expect, type Page } from '@playwright/test';

export class AdvancedSearchPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/pos/search');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/pos\/search/);
    await expect(
      this.page.getByPlaceholder(/buscar productos por nombre, sku o c[oó]digo de barras/i),
    ).toBeVisible();
    await expect(this.page.getByRole('button', { name: /todos/i }).first()).toBeVisible();
  }

  async searchProduct(query: string) {
    await this.page
      .getByPlaceholder(/buscar productos por nombre, sku o c[oó]digo de barras/i)
      .fill(query);
  }

  async addProductToCart(productName: string) {
    const productHeading = this.page.getByRole('heading', { name: new RegExp(productName, 'i') }).first();
    const card = productHeading.locator('xpath=ancestor::div[contains(@class,"group")][1]');

    await card.getByRole('button').last().click();
  }

  async expectCartFooterVisible() {
    await expect(this.page.getByRole('button', { name: /editar pedido/i })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /pagar/i })).toBeVisible();
  }

  async openEditOrder() {
    await this.page.getByRole('button', { name: /editar pedido/i }).click();
  }

  async payOrder() {
    await this.page.getByRole('button', { name: /pagar/i }).click();
  }

  async clearCart() {
    await this.page.getByRole('button', { name: /cancelar/i }).click();
  }

  async expectCartFooterHidden() {
    await expect(this.page.getByRole('button', { name: /editar pedido/i })).not.toBeVisible();
    await expect(this.page.getByRole('button', { name: /pagar/i })).not.toBeVisible();
  }
}
