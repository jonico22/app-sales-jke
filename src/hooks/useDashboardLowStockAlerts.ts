import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardFilters, type LowStockAlertsResponse } from '@/services/dashboard.service';

export const DASHBOARD_LOW_STOCK_QUERY_KEY = ['dashboard-low-stock'];

export function useDashboardLowStockAlerts(params?: DashboardFilters & { limit?: number }) {
  return useQuery<LowStockAlertsResponse['data'], Error>({
    queryKey: [...DASHBOARD_LOW_STOCK_QUERY_KEY, params],
    queryFn: async () => {
      const res = await dashboardService.getLowStockAlerts(params);
      if (!res.success) throw new Error(res.message || 'Failed to fetch low stock alerts');
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 15,
  });
}
