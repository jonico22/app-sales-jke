import { test } from '@playwright/test';
import { bootstrapAuthenticatedSession } from './utils/authenticated-session';
import { openCartWithProductFromPos } from './flows/sale.flow';

test.describe('POS Sale Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapAuthenticatedSession(page);
  });

  test('should add a product from POS and open the cart', async ({ page }) => {
    await openCartWithProductFromPos(page);
  });
});
