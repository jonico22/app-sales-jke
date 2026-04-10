import { test } from '@playwright/test';
import { bootstrapAuthenticatedSession } from './utils/authenticated-session';
import { registerPendingOrderFromPos } from './flows/sale.flow';

test.describe('POS Order Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapAuthenticatedSession(page);
  });

  test('should register a pending order from the POS cart', async ({ page }) => {
    await registerPendingOrderFromPos(page);
  });
});
