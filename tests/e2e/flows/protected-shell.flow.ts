import type { Page } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { POSPage } from '../pages/pos.page';
import { AdvancedSearchPage } from '../pages/advanced-search.page';

export async function openProtectedDashboard(page: Page) {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.goto();
  await dashboardPage.expectLoaded();
}

export async function openPosAndGoToAdvancedSearch(page: Page) {
  const posPage = new POSPage(page);
  const advancedSearchPage = new AdvancedSearchPage(page);

  await posPage.goto();
  await posPage.expectLoaded();
  await posPage.openAdvancedSearch();
  await advancedSearchPage.expectLoaded();
}
