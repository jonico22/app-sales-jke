import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardStats } from '@/services/dashboard.service';

export const DASHBOARD_STATS_QUERY_KEY = ['dashboard-stats'];

export function useDashboardStats() {
    return useQuery<DashboardStats, Error>({
        queryKey: DASHBOARD_STATS_QUERY_KEY,
        queryFn: async () => {
            const res = await dashboardService.getStats();
            if (!res.success) throw new Error(res.message || 'Failed to fetch dashboard stats');
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}
