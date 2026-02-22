import api from './api.client';

export interface DashboardStats {
    totalStockValue: number;
    lowStockItems: number;
    netSales: number;
    newProducts: number;
}

export interface DashboardStatsResponse {
    success: boolean;
    message: string;
    data: DashboardStats;
}

export const dashboardService = {
    // Get general dashboard statistics
    getStats: async (): Promise<DashboardStatsResponse> => {
        const response = await api.get<DashboardStatsResponse>('/sales/dashboard/stats');
        return response.data;
    },
};
