import { useQuery } from '@tanstack/react-query';
import {
    analyticsService,
    type AnalyticsCashFlowTrendData,
    type AnalyticsLowStockData,
    type AnalyticsLowStockTrendData,
    type AnalyticsPaymentsDistributionData,
    type AnalyticsQueryParams,
    type AnalyticsSalesByBranchData,
    type AnalyticsSalesByCategoryData,
    type AnalyticsSalesTrendData,
    type AnalyticsSummaryData,
    type AnalyticsTopProductsData,
} from '@/services/analytics.service';

export const ANALYTICS_SUMMARY_QUERY_KEY = ['analytics-summary'];
export const ANALYTICS_SALES_TREND_QUERY_KEY = ['analytics-sales-trend'];
export const ANALYTICS_CASH_FLOW_TREND_QUERY_KEY = ['analytics-cash-flow-trend'];
export const ANALYTICS_SALES_BY_CATEGORY_QUERY_KEY = ['analytics-sales-by-category'];
export const ANALYTICS_SALES_BY_BRANCH_QUERY_KEY = ['analytics-sales-by-branch'];
export const ANALYTICS_PAYMENTS_DISTRIBUTION_QUERY_KEY = ['analytics-payments-distribution'];
export const ANALYTICS_TOP_PRODUCTS_QUERY_KEY = ['analytics-top-products'];
export const ANALYTICS_LOW_STOCK_QUERY_KEY = ['analytics-low-stock'];
export const ANALYTICS_LOW_STOCK_TREND_QUERY_KEY = ['analytics-low-stock-trend'];

const ANALYTICS_STALE_TIME = 1000 * 60 * 5;
const ANALYTICS_GC_TIME = 1000 * 60 * 30;

function hasScope(params?: Partial<AnalyticsQueryParams>) {
    return Boolean(params?.societyId || params?.societyCode);
}

function buildParams(
    params?: AnalyticsQueryParams,
    options?: {
        supportsComparePrevious?: boolean;
        limit?: number;
    }
): AnalyticsQueryParams | undefined {
    if (!params) return undefined;

    const nextParams: AnalyticsQueryParams = { ...params };

    if (!options?.supportsComparePrevious) {
        delete nextParams.comparePrevious;
    }

    if (typeof options?.limit === 'number') {
        nextParams.limit = options.limit;
    }

    return nextParams;
}

export function useAnalyticsSummary(params?: AnalyticsQueryParams) {
    return useQuery<AnalyticsSummaryData, Error>({
        queryKey: [...ANALYTICS_SUMMARY_QUERY_KEY, buildParams(params, { supportsComparePrevious: true })],
        queryFn: async () => {
            const res = await analyticsService.getSummary(
                buildParams(params, { supportsComparePrevious: true }) as AnalyticsQueryParams
            );
            if (!res.success) throw new Error(res.message || 'Failed to fetch analytics summary');
            return res.data;
        },
        enabled: hasScope(params),
        placeholderData: (previousData) => previousData,
        staleTime: ANALYTICS_STALE_TIME,
        gcTime: ANALYTICS_GC_TIME,
    });
}

export function useAnalyticsSalesTrend(params?: AnalyticsQueryParams) {
    return useQuery<AnalyticsSalesTrendData, Error>({
        queryKey: [...ANALYTICS_SALES_TREND_QUERY_KEY, buildParams(params, { supportsComparePrevious: true })],
        queryFn: async () => {
            const res = await analyticsService.getSalesTrend(
                buildParams(params, { supportsComparePrevious: true }) as AnalyticsQueryParams
            );
            if (!res.success) throw new Error(res.message || 'Failed to fetch analytics sales trend');
            return res.data;
        },
        enabled: hasScope(params),
        placeholderData: (previousData) => previousData,
        staleTime: ANALYTICS_STALE_TIME,
        gcTime: ANALYTICS_GC_TIME,
    });
}

export function useAnalyticsCashFlowTrend(params?: AnalyticsQueryParams) {
    return useQuery<AnalyticsCashFlowTrendData, Error>({
        queryKey: [...ANALYTICS_CASH_FLOW_TREND_QUERY_KEY, buildParams(params, { supportsComparePrevious: true })],
        queryFn: async () => {
            const res = await analyticsService.getCashFlowTrend(
                buildParams(params, { supportsComparePrevious: true }) as AnalyticsQueryParams
            );
            if (!res.success) throw new Error(res.message || 'Failed to fetch analytics cash flow trend');
            return res.data;
        },
        enabled: hasScope(params),
        placeholderData: (previousData) => previousData,
        staleTime: ANALYTICS_STALE_TIME,
        gcTime: ANALYTICS_GC_TIME,
    });
}

export function useAnalyticsSalesByCategory(params?: AnalyticsQueryParams) {
    return useQuery<AnalyticsSalesByCategoryData, Error>({
        queryKey: [...ANALYTICS_SALES_BY_CATEGORY_QUERY_KEY, buildParams(params, { supportsComparePrevious: true })],
        queryFn: async () => {
            const res = await analyticsService.getSalesByCategory(
                buildParams(params, { supportsComparePrevious: true }) as AnalyticsQueryParams
            );
            if (!res.success) throw new Error(res.message || 'Failed to fetch analytics sales by category');
            return res.data;
        },
        enabled: hasScope(params),
        placeholderData: (previousData) => previousData,
        staleTime: ANALYTICS_STALE_TIME,
        gcTime: ANALYTICS_GC_TIME,
    });
}

export function useAnalyticsSalesByBranch(params?: AnalyticsQueryParams) {
    return useQuery<AnalyticsSalesByBranchData, Error>({
        queryKey: [...ANALYTICS_SALES_BY_BRANCH_QUERY_KEY, buildParams(params, { supportsComparePrevious: true })],
        queryFn: async () => {
            const res = await analyticsService.getSalesByBranch(
                buildParams(params, { supportsComparePrevious: true }) as AnalyticsQueryParams
            );
            if (!res.success) throw new Error(res.message || 'Failed to fetch analytics sales by branch');
            return res.data;
        },
        enabled: hasScope(params),
        placeholderData: (previousData) => previousData,
        staleTime: ANALYTICS_STALE_TIME,
        gcTime: ANALYTICS_GC_TIME,
    });
}

export function useAnalyticsPaymentsDistribution(params?: AnalyticsQueryParams) {
    return useQuery<AnalyticsPaymentsDistributionData, Error>({
        queryKey: [...ANALYTICS_PAYMENTS_DISTRIBUTION_QUERY_KEY, buildParams(params, { supportsComparePrevious: true })],
        queryFn: async () => {
            const res = await analyticsService.getPaymentsDistribution(
                buildParams(params, { supportsComparePrevious: true }) as AnalyticsQueryParams
            );
            if (!res.success) throw new Error(res.message || 'Failed to fetch analytics payments distribution');
            return res.data;
        },
        enabled: hasScope(params),
        placeholderData: (previousData) => previousData,
        staleTime: ANALYTICS_STALE_TIME,
        gcTime: ANALYTICS_GC_TIME,
    });
}

export function useAnalyticsTopProducts(params?: AnalyticsQueryParams) {
    return useQuery<AnalyticsTopProductsData, Error>({
        queryKey: [...ANALYTICS_TOP_PRODUCTS_QUERY_KEY, buildParams(params, { supportsComparePrevious: true, limit: params?.limit ?? 5 })],
        queryFn: async () => {
            const res = await analyticsService.getTopProducts(
                buildParams(params, { supportsComparePrevious: true, limit: params?.limit ?? 5 }) as AnalyticsQueryParams
            );
            if (!res.success) throw new Error(res.message || 'Failed to fetch analytics top products');
            return res.data;
        },
        enabled: hasScope(params),
        placeholderData: (previousData) => previousData,
        staleTime: ANALYTICS_STALE_TIME,
        gcTime: ANALYTICS_GC_TIME,
    });
}

export function useAnalyticsLowStock(params?: AnalyticsQueryParams) {
    return useQuery<AnalyticsLowStockData, Error>({
        queryKey: [...ANALYTICS_LOW_STOCK_QUERY_KEY, buildParams(params, { supportsComparePrevious: false, limit: params?.limit ?? 6 })],
        queryFn: async () => {
            const res = await analyticsService.getLowStock(
                buildParams(params, { supportsComparePrevious: false, limit: params?.limit ?? 6 }) as AnalyticsQueryParams
            );
            if (!res.success) throw new Error(res.message || 'Failed to fetch analytics low stock');
            return res.data;
        },
        enabled: hasScope(params),
        placeholderData: (previousData) => previousData,
        staleTime: ANALYTICS_STALE_TIME,
        gcTime: ANALYTICS_GC_TIME,
    });
}

export function useAnalyticsLowStockTrend(params?: AnalyticsQueryParams) {
    return useQuery<AnalyticsLowStockTrendData, Error>({
        queryKey: [...ANALYTICS_LOW_STOCK_TREND_QUERY_KEY, buildParams(params, { supportsComparePrevious: true })],
        queryFn: async () => {
            const res = await analyticsService.getLowStockTrend(
                buildParams(params, { supportsComparePrevious: true }) as AnalyticsQueryParams
            );
            if (!res.success) throw new Error(res.message || 'Failed to fetch analytics low stock trend');
            return res.data;
        },
        enabled: hasScope(params),
        placeholderData: (previousData) => previousData,
        staleTime: ANALYTICS_STALE_TIME,
        gcTime: ANALYTICS_GC_TIME,
    });
}
