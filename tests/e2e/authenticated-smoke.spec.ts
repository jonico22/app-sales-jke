import { test, expect } from '@playwright/test';
import { bootstrapAuthenticatedSession } from './utils/authenticated-session';
import { openProtectedDashboard, openPosAndGoToAdvancedSearch } from './flows/protected-shell.flow';

test.describe('Authenticated Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapAuthenticatedSession(page);
  });

  test('should open a protected route with an authenticated session', async ({ page }) => {
    await openProtectedDashboard(page);
  });

  test('should navigate from POS to advanced search with the protected shell loaded', async ({ page }) => {
    await openPosAndGoToAdvancedSearch(page);
  });
});
