import type { Page } from '@playwright/test';
import { AdvancedSearchPage } from '../pages/advanced-search.page';
import { PaymentModalPage } from '../pages/payment-modal.page';
import { SaleCartPage } from '../pages/sale-cart.page';
import { SaleSuccessPage } from '../pages/sale-success.page';

export async function addProductToCartFromSearch(page: Page, productName = 'Lapiz Azul') {
  const searchPage = new AdvancedSearchPage(page);

  await searchPage.goto();
  await searchPage.expectLoaded();
  await searchPage.searchProduct('lapiz');
  await searchPage.addProductToCart(productName);
  await searchPage.expectCartFooterVisible();
}

export async function openCartFromSearch(page: Page, productName = 'Lapiz Azul') {
  const searchPage = new AdvancedSearchPage(page);
  const cartPage = new SaleCartPage(page);

  await addProductToCartFromSearch(page, productName);
  await searchPage.openEditOrder();
  await cartPage.expectOpen();
}

export async function registerPendingOrderFromSearch(page: Page, productName = 'Lapiz Azul') {
  const searchPage = new AdvancedSearchPage(page);
  const cartPage = new SaleCartPage(page);

  await openCartFromSearch(page, productName);
  await cartPage.registerPendingOrder();
  await searchPage.expectCartFooterHidden();
}

export async function registerSaleFromSearch(page: Page, productName = 'Lapiz Azul') {
  const searchPage = new AdvancedSearchPage(page);
  const paymentModal = new PaymentModalPage(page);
  const successPage = new SaleSuccessPage(page);

  await addProductToCartFromSearch(page, productName);
  await searchPage.payOrder();
  await paymentModal.expectOpen();
  await paymentModal.confirm();
  await successPage.expectOpen();
}
