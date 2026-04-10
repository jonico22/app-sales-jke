import { test } from '@playwright/test';
import { bootstrapAuthenticatedSession } from './utils/authenticated-session';
import { registerSaleFromSearch } from './flows/search.flow';

test.describe('Search Payment Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapAuthenticatedSession(page);
  });

  test('should register a sale and complete payment from advanced search', async ({ page }) => {
    await registerSaleFromSearch(page);
  });
});
