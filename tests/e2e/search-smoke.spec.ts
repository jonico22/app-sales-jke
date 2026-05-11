import { test } from '@playwright/test';
import { bootstrapAuthenticatedSession } from './utils/authenticated-session';
import { addProductToCartFromSearch } from './flows/search.flow';

test.describe('Search Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapAuthenticatedSession(page);
  });

  test('should add a product from advanced search and show the cart footer', async ({ page }) => {
    await addProductToCartFromSearch(page);
  });
});
