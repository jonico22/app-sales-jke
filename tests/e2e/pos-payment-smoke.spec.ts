import { test } from '@playwright/test';
import { bootstrapAuthenticatedSession } from './utils/authenticated-session';
import { registerSaleFromPos } from './flows/sale.flow';

test.describe('POS Payment Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapAuthenticatedSession(page);
  });

  test('should register a sale and complete the payment flow from POS', async ({ page }) => {
    await registerSaleFromPos(page);
  });
});
