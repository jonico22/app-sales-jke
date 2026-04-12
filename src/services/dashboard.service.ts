import api from './api.client';

export interface DashboardStats {
    salesToday: number;
    salesThisWeek: number;
    salesThisMonth: number;
    completedOrdersToday: number;
    completedOrdersThisWeek: number;
    completedOrdersThisMonth: number;
    averageTicketToday: number;
    averageTicketThisWeek: number;
    averageTicketThisMonth: number;
}

export interface DashboardFilters {
    branchId?: string;
}

export interface DashboardOverviewFilters extends DashboardFilters {
    dateFrom?: string;
    dateTo?: string;
    granularity?: 'day' | 'week' | 'month';
    limit?: number;
}

export interface DashboardStatsResponse {
    success: boolean;
    message: string;
    data: DashboardStats;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface DashboardSalesTrendPoint {
    label: string;
    value: number;
}

export interface DashboardPaymentMethodSummary {
    method: string;
    amount: number;
    percentage: number;
    transactions: number;
}

export interface DashboardCashFlowMiniPoint {
    label: string;
    income: number;
    expense: number;
    net: number;
}

export interface DashboardTopProduct {
    productId: string;
    productName: string;
    category: string;
    soldUnits: number;
    revenue: number;
    stockRemaining: number;
}

export interface DashboardTopBranch {
    branchId: string;
    branch: string;
    revenue: number;
    orders: number;
    averageTicket: number;
}

export interface DashboardOverviewResponse {
    success: boolean;
    message: string;
    data: {
        salesTrend: DashboardSalesTrendPoint[];
        paymentMethods: DashboardPaymentMethodSummary[];
        cashFlowMini: DashboardCashFlowMiniPoint[];
        topProducts: DashboardTopProduct[];
        topBranches: DashboardTopBranch[];
    };
}

export interface LowStockAlertItem {
    productId: string;
    productName: string;
    branchId: string;
    branchName: string;
    availableStock: number;
    minStock: number;
    status: string;
}

export interface LowStockAlertsResponse {
    success: boolean;
    message: string;
    data: {
        count: number;
        items: LowStockAlertItem[];
    };
}

export interface CatalogSummaryResponse {
    success: boolean;
    message: string;
    data: {
        totalStockValue: number;
        lowStockItems: number;
        newProductsThisMonth: number;
        activeProducts: number;
    };
}

export const dashboardService = {
    getStats: async (params?: DashboardFilters): Promise<DashboardStatsResponse> => {
        const response = await api.get<DashboardStatsResponse>('/sales/dashboard/stats', { params });
        return response.data;
    },

    getOverview: async (params?: DashboardOverviewFilters): Promise<DashboardOverviewResponse> => {
        const response = await api.get<DashboardOverviewResponse>('/sales/dashboard/overview', { params });
        return response.data;
    },

    getLowStockAlerts: async (params?: DashboardFilters & { limit?: number }): Promise<LowStockAlertsResponse> => {
        const response = await api.get<LowStockAlertsResponse>('/sales/dashboard/alerts/low-stock', { params });
        return response.data;
    },

    getCatalogSummary: async (params?: DashboardFilters): Promise<CatalogSummaryResponse> => {
        const response = await api.get<CatalogSummaryResponse>('/sales/dashboard/catalog-summary', { params });
        return response.data;
    },
};
