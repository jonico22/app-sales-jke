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

// Legacy chart contracts kept for reference until the new chart library migration is complete.
export interface SalesPerformanceData {
    name: string;
    total: number;
}

export interface RevenueByCategoryData {
    category: string;
    revenue: number;
    percentage: number;
}

export interface TopProductData {
    id: string;
    name: string;
    soldUnits: number;
    stockRemaining: number;
}

export interface PaymentMethodData {
    method: string;
    value: number;
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
    // Get general dashboard statistics
    getStats: async (params?: DashboardFilters): Promise<DashboardStatsResponse> => {
        const response = await api.get<DashboardStatsResponse>('/dashboard/stats', { params });
        return response.data;
    },

    // Compact dashboard charts payload for the new chart library integration.
    getOverview: async (params?: DashboardOverviewFilters): Promise<DashboardOverviewResponse> => {
        const response = await api.get<DashboardOverviewResponse>('/dashboard/overview', { params });
        return response.data;
    },

    // Final operational block.
    getLowStockAlerts: async (params?: DashboardFilters & { limit?: number }): Promise<LowStockAlertsResponse> => {
        const response = await api.get<LowStockAlertsResponse>('/dashboard/alerts/low-stock', { params });
        return response.data;
    },

    // Secondary block for slower or accumulated metrics.
    getCatalogSummary: async (params?: DashboardFilters): Promise<CatalogSummaryResponse> => {
        const response = await api.get<CatalogSummaryResponse>('/dashboard/catalog-summary', { params });
        return response.data;
    },

    // Legacy chart endpoints kept commented out until the new dashboard chart library is fully integrated.
    // getSalesPerformance: async (): Promise<SalesPerformanceData[]> => {
    //     const response = await api.get<ApiResponse<SalesPerformanceData[]>>('/sales/dashboard/charts/sales-performance');
    //     return response.data.data;
    // },
    // getRevenueByCategory: async (): Promise<RevenueByCategoryData[]> => {
    //     const response = await api.get<ApiResponse<RevenueByCategoryData[]>>('/sales/dashboard/charts/revenue-by-category');
    //     return response.data.data;
    // },
    // getTopProducts: async (): Promise<TopProductData[]> => {
    //     const response = await api.get<ApiResponse<TopProductData[]>>('/sales/dashboard/charts/top-products');
    //     return response.data.data;
    // },
    // getPaymentMethods: async (): Promise<PaymentMethodData[]> => {
    //     const response = await api.get<ApiResponse<PaymentMethodData[]>>('/sales/dashboard/charts/payment-methods');
    //     return response.data.data;
    // },
};
