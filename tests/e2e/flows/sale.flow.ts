import type { Page } from '@playwright/test';
import { POSPage } from '../pages/pos.page';
import { PaymentModalPage } from '../pages/payment-modal.page';
import { SaleCartPage } from '../pages/sale-cart.page';
import { SaleSuccessPage } from '../pages/sale-success.page';

export async function addProductToCartFromPos(page: Page, productName = 'Lapiz Azul') {
  const posPage = new POSPage(page);

  await posPage.goto();
  await posPage.expectLoaded();
  await posPage.searchProduct('lapiz');
  await posPage.selectProductFromResults(productName);
  await posPage.expectFloatingCartVisible();
}

export async function openCartWithProductFromPos(page: Page, productName = 'Lapiz Azul') {
  const posPage = new POSPage(page);
  const cartPage = new SaleCartPage(page);

  await addProductToCartFromPos(page, productName);
  await posPage.openFloatingCart();
  await cartPage.expectOpen();
}

export async function registerPendingOrderFromPos(page: Page, productName = 'Lapiz Azul') {
  const posPage = new POSPage(page);
  const cartPage = new SaleCartPage(page);

  await openCartWithProductFromPos(page, productName);
  await cartPage.registerPendingOrder();
  await cartPage.expectClosed();
  await posPage.expectFloatingCartHidden();
}

export async function registerSaleFromPos(page: Page, productName = 'Lapiz Azul') {
  const cartPage = new SaleCartPage(page);
  const paymentModal = new PaymentModalPage(page);
  const successPage = new SaleSuccessPage(page);

  await openCartWithProductFromPos(page, productName);
  await cartPage.registerSale();
  await paymentModal.expectOpen();
  await paymentModal.confirm();
  await successPage.expectOpen();
}
