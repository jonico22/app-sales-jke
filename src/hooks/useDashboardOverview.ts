import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardOverviewFilters, type DashboardOverviewResponse } from '@/services/dashboard.service';

export const DASHBOARD_OVERVIEW_QUERY_KEY = ['dashboard-overview'];

export function useDashboardOverview(params?: DashboardOverviewFilters) {
  return useQuery<DashboardOverviewResponse['data'], Error>({
    queryKey: [...DASHBOARD_OVERVIEW_QUERY_KEY, params],
    queryFn: async () => {
      const res = await dashboardService.getOverview(params);
      if (!res.success) throw new Error(res.message || 'Failed to fetch dashboard overview');
      return res.data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
