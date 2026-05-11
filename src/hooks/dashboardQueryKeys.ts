import type { QueryClient } from '@tanstack/react-query';
import { DASHBOARD_CATALOG_SUMMARY_QUERY_KEY } from './useDashboardCatalogSummary';
import { DASHBOARD_LOW_STOCK_QUERY_KEY } from './useDashboardLowStockAlerts';
import { DASHBOARD_OVERVIEW_QUERY_KEY } from './useDashboardOverview';
import { DASHBOARD_STATS_QUERY_KEY } from './useDashboardStats';

export function invalidateDashboardQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: DASHBOARD_OVERVIEW_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: DASHBOARD_LOW_STOCK_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: DASHBOARD_CATALOG_SUMMARY_QUERY_KEY });
}
