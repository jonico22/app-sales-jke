import api from './api.client';

export interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalClients: number;
    recentSales: {
        date: string;
        amount: number;
    }[];
    topProducts: {
        name: string;
        quantity: number;
        revenue: number;
    }[];
}

export interface DashboardStatsResponse {
    success: boolean;
    message: string;
    data: DashboardStats;
}

export const dashboardService = {
    // Get general dashboard statistics
    getStats: async (): Promise<DashboardStatsResponse> => {
        const response = await api.get<DashboardStatsResponse>('/dashboard/stats');
        return response.data;
    },
};
