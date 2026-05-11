import { useQuery } from '@tanstack/react-query';
import { dashboardService, type CatalogSummaryResponse, type DashboardFilters } from '@/services/dashboard.service';

export const DASHBOARD_CATALOG_SUMMARY_QUERY_KEY = ['dashboard-catalog-summary'];

export function useDashboardCatalogSummary(params?: DashboardFilters) {
  return useQuery<CatalogSummaryResponse['data'], Error>({
    queryKey: [...DASHBOARD_CATALOG_SUMMARY_QUERY_KEY, params],
    queryFn: async () => {
      const res = await dashboardService.getCatalogSummary(params);
      if (!res.success) throw new Error(res.message || 'Failed to fetch catalog summary');
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}
