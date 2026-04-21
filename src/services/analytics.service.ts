import api from './api.client';

export type AnalyticsGranularity = 'day' | 'week' | 'month';

export type AnalyticsScopeParams =
    | {
          societyId: string;
          societyCode?: string;
      }
    | {
          societyCode: string;
          societyId?: string;
      };

export type AnalyticsQueryParams = AnalyticsScopeParams & {
    branchId?: string;
    dateFrom?: string;
    dateTo?: string;
    granularity?: AnalyticsGranularity;
    comparePrevious?: boolean;
    limit?: number;
};

export interface AnalyticsResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface AnalyticsComparisonMetric {
    current: number;
    previous?: number | null;
    variation?: number | null;
    percentageChange?: number | null;
    trend?: 'up' | 'down' | 'neutral' | string;
}

export interface AnalyticsSummaryRangeWindow {
    dateFrom: string;
    dateTo: string;
    granularity: AnalyticsGranularity;
}

export interface AnalyticsSummaryRange {
    current: AnalyticsSummaryRangeWindow;
    previous?: AnalyticsSummaryRangeWindow;
}

export interface AnalyticsSummaryTotals {
    sales: number;
    expenses: number;
    grossProfitEstimate: number;
    orders: number;
    averageTicket: number;
    unitsSold: number;
}

export interface AnalyticsSummaryComparison {
    salesPct?: number | null;
    ordersPct?: number | null;
    averageTicketPct?: number | null;
}

export interface AnalyticsSummaryMetricComparison {
    current: number;
    previous?: number | null;
    delta?: number | null;
    deltaPct?: number | null;
}

export type AnalyticsSummaryMetricKey =
    | 'sales'
    | 'expenses'
    | 'grossProfitEstimate'
    | 'orders'
    | 'averageTicket'
    | 'unitsSold';

export interface AnalyticsSummaryData {
    range: AnalyticsSummaryRange;
    totals: AnalyticsSummaryTotals;
    previousTotals?: AnalyticsSummaryTotals;
    comparison?: AnalyticsSummaryComparison;
    comparisonByMetric?: Partial<Record<AnalyticsSummaryMetricKey, AnalyticsSummaryMetricComparison>>;
}

export interface AnalyticsSeriesRange {
    dateFrom: string;
    dateTo: string;
    granularity: AnalyticsGranularity;
}

export interface AnalyticsSalesTrendSeriesPoint {
    label: string;
    sales: number;
    orders: number;
    averageTicket: number;
}

export interface AnalyticsSalesTrendPreviousPoint {
    label: string;
    sales: number;
}

export interface AnalyticsSalesTrendPreviousAlignedPoint {
    label: string;
    sourceLabel: string;
    sales: number;
}

export interface AnalyticsSalesTrendData {
    range: {
        current: AnalyticsSeriesRange;
        previous?: AnalyticsSeriesRange;
    };
    series: AnalyticsSalesTrendSeriesPoint[];
    previousPeriod?: AnalyticsSalesTrendPreviousPoint[];
    previousPeriodAligned?: AnalyticsSalesTrendPreviousAlignedPoint[];
}

export interface AnalyticsCashFlowTrendPoint {
    income: number;
    expense: number;
    net: number;
    label: string;
}

export interface AnalyticsCashFlowTrendPreviousAlignedPoint {
    label: string;
    sourceLabel: string;
    income: number;
    expense: number;
    net: number;
}

export interface AnalyticsCashFlowTrendData {
    range: {
        current: AnalyticsSeriesRange;
        previous?: AnalyticsSeriesRange;
    };
    series: AnalyticsCashFlowTrendPoint[];
    previousPeriod?: AnalyticsCashFlowTrendPoint[];
    previousPeriodAligned?: AnalyticsCashFlowTrendPreviousAlignedPoint[];
}

export interface AnalyticsRangeData {
    dateFrom: string;
    dateTo: string;
}

export interface AnalyticsSalesByCategoryItem {
    categoryId?: string;
    category: string;
    revenue: number;
    unitsSold: number;
    percentage: number;
    previous?: {
        revenue: number;
        unitsSold: number;
        percentage: number;
    };
    comparison?: {
        revenue?: AnalyticsSummaryMetricComparison;
        unitsSold?: AnalyticsSummaryMetricComparison;
    };
}

export interface AnalyticsSalesByCategoryData {
    range: {
        current: AnalyticsSeriesRange;
        previous?: AnalyticsSeriesRange;
    };
    items: AnalyticsSalesByCategoryItem[];
}

export interface AnalyticsSalesByBranchItem {
    branchId: string;
    branch: string;
    revenue: number;
    orders: number;
    averageTicket: number;
    previous?: {
        revenue: number;
        orders: number;
        averageTicket: number;
    };
    comparison?: {
        revenue?: AnalyticsSummaryMetricComparison;
        orders?: AnalyticsSummaryMetricComparison;
        averageTicket?: AnalyticsSummaryMetricComparison;
    };
}

export interface AnalyticsSalesByBranchData {
    range: {
        current: AnalyticsSeriesRange;
        previous?: AnalyticsSeriesRange;
    };
    items: AnalyticsSalesByBranchItem[];
}

export interface AnalyticsPaymentDistributionItem {
    method: string;
    amount: number;
    percentage: number;
    transactions: number;
    previous?: {
        amount: number;
        percentage: number;
        transactions: number;
    };
    comparison?: {
        amount?: AnalyticsSummaryMetricComparison;
    };
}

export interface AnalyticsPaymentsDistributionData {
    range: {
        current: AnalyticsSeriesRange;
        previous?: AnalyticsSeriesRange;
    };
    items: AnalyticsPaymentDistributionItem[];
}

export interface AnalyticsTopProductItem {
    productId: string;
    productName: string;
    category: string;
    soldUnits: number;
    revenue: number;
    stockRemaining: number;
    previous?: {
        soldUnits: number;
        revenue: number;
    };
    comparison?: {
        soldUnits?: AnalyticsSummaryMetricComparison;
        revenue?: AnalyticsSummaryMetricComparison;
    };
}

export interface AnalyticsTopProductsData {
    range: {
        current: AnalyticsSeriesRange;
        previous?: AnalyticsSeriesRange;
    };
    items: AnalyticsTopProductItem[];
}

export interface AnalyticsLowStockItem {
    productId: string;
    productName: string;
    category: string;
    branchId: string;
    branchName: string;
    availableStock: number;
    physicalStock: number;
    minStock: number;
    gap: number;
}

export interface AnalyticsLowStockData {
    items: AnalyticsLowStockItem[];
}

export interface AnalyticsLowStockTrendPoint {
    label: string;
    lowStockCount: number;
    criticalCount: number;
}

export interface AnalyticsLowStockTrendAlignedPoint {
    label: string;
    sourceLabel: string;
    lowStockCount: number;
    criticalCount: number;
}

export interface AnalyticsLowStockTrendData {
    range: {
        current: AnalyticsSeriesRange;
        previous?: AnalyticsSeriesRange;
    };
    series: AnalyticsLowStockTrendPoint[];
    previousPeriod?: AnalyticsLowStockTrendPoint[];
    previousPeriodAligned?: AnalyticsLowStockTrendAlignedPoint[];
}

export type AnalyticsSummaryResponse = AnalyticsResponse<AnalyticsSummaryData>;
export type AnalyticsSalesTrendResponse = AnalyticsResponse<AnalyticsSalesTrendData>;
export type AnalyticsCashFlowTrendResponse = AnalyticsResponse<AnalyticsCashFlowTrendData>;
export type AnalyticsSalesByCategoryResponse = AnalyticsResponse<AnalyticsSalesByCategoryData>;
export type AnalyticsSalesByBranchResponse = AnalyticsResponse<AnalyticsSalesByBranchData>;
export type AnalyticsPaymentsDistributionResponse = AnalyticsResponse<AnalyticsPaymentsDistributionData>;
export type AnalyticsTopProductsResponse = AnalyticsResponse<AnalyticsTopProductsData>;
export type AnalyticsLowStockResponse = AnalyticsResponse<AnalyticsLowStockData>;
export type AnalyticsLowStockTrendResponse = AnalyticsResponse<AnalyticsLowStockTrendData>;

export const analyticsService = {
    getSummary: async (params: AnalyticsQueryParams): Promise<AnalyticsSummaryResponse> => {
        const response = await api.get<AnalyticsSummaryResponse>('/sales/analytics/summary', {
            params,
        });
        return response.data;
    },

    getSalesTrend: async (
        params: AnalyticsQueryParams
    ): Promise<AnalyticsSalesTrendResponse> => {
        const response = await api.get<AnalyticsSalesTrendResponse>(
            '/sales/analytics/sales/trend',
            { params }
        );
        return response.data;
    },

    getCashFlowTrend: async (
        params: AnalyticsQueryParams
    ): Promise<AnalyticsCashFlowTrendResponse> => {
        const response = await api.get<AnalyticsCashFlowTrendResponse>(
            '/sales/analytics/cash-flow/trend',
            { params }
        );
        return response.data;
    },

    getSalesByCategory: async (
        params: AnalyticsQueryParams
    ): Promise<AnalyticsSalesByCategoryResponse> => {
        const response = await api.get<AnalyticsSalesByCategoryResponse>(
            '/sales/analytics/sales/by-category',
            { params }
        );
        return response.data;
    },

    getSalesByBranch: async (
        params: AnalyticsQueryParams
    ): Promise<AnalyticsSalesByBranchResponse> => {
        const response = await api.get<AnalyticsSalesByBranchResponse>(
            '/sales/analytics/sales/by-branch',
            { params }
        );
        return response.data;
    },

    getPaymentsDistribution: async (
        params: AnalyticsQueryParams
    ): Promise<AnalyticsPaymentsDistributionResponse> => {
        const response = await api.get<AnalyticsPaymentsDistributionResponse>(
            '/sales/analytics/payments/distribution',
            { params }
        );
        return response.data;
    },

    getTopProducts: async (
        params: AnalyticsQueryParams
    ): Promise<AnalyticsTopProductsResponse> => {
        const response = await api.get<AnalyticsTopProductsResponse>(
            '/sales/analytics/products/top',
            { params }
        );
        return response.data;
    },

    getLowStock: async (params: AnalyticsQueryParams): Promise<AnalyticsLowStockResponse> => {
        const response = await api.get<AnalyticsLowStockResponse>(
            '/sales/analytics/inventory/low-stock',
            { params }
        );
        return response.data;
    },

    getLowStockTrend: async (
        params: AnalyticsQueryParams
    ): Promise<AnalyticsLowStockTrendResponse> => {
        const response = await api.get<AnalyticsLowStockTrendResponse>(
            '/sales/analytics/inventory/low-stock/trend',
            { params }
        );
        return response.data;
    },
};
