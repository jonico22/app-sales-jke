import { test } from '@playwright/test';
import { bootstrapAuthenticatedSession } from './utils/authenticated-session';
import { registerPendingOrderFromSearch } from './flows/search.flow';

test.describe('Search Order Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapAuthenticatedSession(page);
  });

  test('should register a pending order from advanced search', async ({ page }) => {
    await registerPendingOrderFromSearch(page);
  });
});
