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

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

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

export const dashboardService = {
    // Get general dashboard statistics
    getStats: async (): Promise<DashboardStatsResponse> => {
        const response = await api.get<DashboardStatsResponse>('/sales/dashboard/stats');
        return response.data;
    },

    // Sales Performance (Tendencia de ventas por mes)
    getSalesPerformance: async (): Promise<SalesPerformanceData[]> => {
        const response = await api.get<ApiResponse<SalesPerformanceData[]>>('/sales/dashboard/charts/sales-performance');
        return response.data.data;
    },

    // Revenue Report (Ingresos por categoría)
    getRevenueByCategory: async (): Promise<RevenueByCategoryData[]> => {
        const response = await api.get<ApiResponse<RevenueByCategoryData[]>>('/sales/dashboard/charts/revenue-by-category');
        return response.data.data;
    },

    // Best Sellers (Top 5 productos más vendidos)
    getTopProducts: async (): Promise<TopProductData[]> => {
        const response = await api.get<ApiResponse<TopProductData[]>>('/sales/dashboard/charts/top-products');
        return response.data.data;
    },

    // Payment Methods (Métodos de pago preferidos)
    getPaymentMethods: async (): Promise<PaymentMethodData[]> => {
        const response = await api.get<ApiResponse<PaymentMethodData[]>>('/sales/dashboard/charts/payment-methods');
        return response.data.data;
    },
};
