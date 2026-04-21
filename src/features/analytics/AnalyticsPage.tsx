import { useEffect, useMemo, useState } from 'react';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import type { MiniTrendDatum } from '@/components/shared/charts/MiniTrendChart';
import { AnalyticsFiltersBar } from './components/AnalyticsFiltersBar';
import { AnalyticsCashFlowTrendCard } from './components/AnalyticsCashFlowTrendCard';
import { AnalyticsHero } from './components/AnalyticsHero';
import { AnalyticsLowStockCard } from './components/AnalyticsLowStockCard';
import { AnalyticsPaymentsDistributionCard } from './components/AnalyticsPaymentsDistributionCard';
import { AnalyticsSalesTrendCard } from './components/AnalyticsSalesTrendCard';
import { AnalyticsSalesByBranchCard } from './components/AnalyticsSalesByBranchCard';
import { AnalyticsSalesByCategoryCard } from './components/AnalyticsSalesByCategoryCard';
import { AnalyticsSummaryStrip } from './components/AnalyticsSummaryStrip';
import { AnalyticsTopProductsCard } from './components/AnalyticsTopProductsCard';
import {
  useAnalyticsCashFlowTrend,
  useAnalyticsLowStockTrend,
  useAnalyticsPaymentsDistribution,
  useAnalyticsSalesByBranch,
  useAnalyticsSalesByCategory,
  useAnalyticsSalesTrend,
  useAnalyticsSummary,
  useAnalyticsTopProducts,
} from '@/hooks/useAnalytics';
import { useBranches } from '@/hooks/useBranches';
import type { AnalyticsGranularity, AnalyticsQueryParams } from '@/services/analytics.service';
import { useSocietyStore } from '@/store/society.store';

type AnalyticsPageFilters = {
  societyId?: string;
  societyCode?: string;
  branchId?: string;
  dateFrom: string;
  dateTo: string;
  granularity: AnalyticsGranularity;
  comparePrevious: boolean;
  limit?: number;
};

const GRANULARITY_LABELS: Record<AnalyticsGranularity, string> = {
  day: 'Granularidad diaria',
  week: 'Granularidad semanal',
  month: 'Granularidad mensual',
};

export default function AnalyticsPage() {
  const society = useSocietyStore((state) => state.society);
  const today = new Date();
  const initialDateFrom = format(startOfMonth(today), 'yyyy-MM-dd');
  const initialDateTo = format(endOfMonth(today), 'yyyy-MM-dd');
  const { data: branches = [] } = useBranches();
  const [filters, setFilters] = useState<AnalyticsPageFilters>({
    societyId: society?.id || '',
    societyCode: society?.code,
    branchId: undefined,
    dateFrom: initialDateFrom,
    dateTo: initialDateTo,
    granularity: 'month',
    comparePrevious: true,
    limit: 5,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((previous) => ({
      ...previous,
      societyId: society?.id,
      societyCode: society?.code,
    }));
  }, [society?.code, society?.id]);

  const analyticsFilters = useMemo<AnalyticsQueryParams | undefined>(() => {
    const societyId = society?.id || filters.societyId;
    const societyCode = society?.code || filters.societyCode;

    if (societyId) {
      return {
        ...filters,
        societyId,
        ...(societyCode ? { societyCode } : {}),
      };
    }

    if (societyCode) {
      return {
        ...filters,
        societyCode,
      };
    }

    return undefined;
  }, [filters, society?.code, society?.id]);

  const summaryQuery = useAnalyticsSummary(analyticsFilters);
  const salesTrendQuery = useAnalyticsSalesTrend(analyticsFilters);
  const cashFlowTrendQuery = useAnalyticsCashFlowTrend(analyticsFilters);
  const salesByCategoryQuery = useAnalyticsSalesByCategory(analyticsFilters);
  const salesByBranchQuery = useAnalyticsSalesByBranch(analyticsFilters);
  const paymentsDistributionQuery = useAnalyticsPaymentsDistribution(analyticsFilters);
  const topProductsQuery = useAnalyticsTopProducts(analyticsFilters);
  const lowStockTrendQuery = useAnalyticsLowStockTrend(analyticsFilters);

  const selectedBranchName =
    !analyticsFilters?.branchId
      ? 'Todas las sucursales'
      : branches.find((branch) => branch.id === analyticsFilters.branchId)?.name || 'Sucursal seleccionada';
  const currencySymbol = society?.mainCurrency?.symbol || 'S/';
  const dateLabel = `${analyticsFilters?.dateFrom || initialDateFrom} al ${analyticsFilters?.dateTo || initialDateTo}`;
  const granularityLabel = GRANULARITY_LABELS[analyticsFilters?.granularity || 'month'];
  const salesTrendSeries = salesTrendQuery.data?.series || [];
  const summaryTrends = useMemo<{
    sales: MiniTrendDatum[];
    orders: MiniTrendDatum[];
    averageTicket: MiniTrendDatum[];
  }>(() => {
    if (salesTrendSeries.length > 0) {
      return {
        sales: salesTrendSeries.map((item) => ({ label: item.label, value: item.sales })),
        orders: salesTrendSeries.map((item) => ({ label: item.label, value: item.orders })),
        averageTicket: salesTrendSeries.map((item) => ({ label: item.label, value: item.averageTicket })),
      };
    }

    const fallbackLabel = analyticsFilters?.granularity === 'month'
      ? 'Mes actual'
      : analyticsFilters?.granularity === 'week'
        ? 'Semana actual'
        : 'Día actual';

    return {
      sales: [{ label: fallbackLabel, value: summaryQuery.data?.totals?.sales ?? 0 }],
      orders: [{ label: fallbackLabel, value: summaryQuery.data?.totals?.orders ?? 0 }],
      averageTicket: [{ label: fallbackLabel, value: summaryQuery.data?.totals?.averageTicket ?? 0 }],
    };
  }, [
    analyticsFilters?.granularity,
    salesTrendSeries,
    summaryQuery.data?.totals?.averageTicket,
    summaryQuery.data?.totals?.orders,
    summaryQuery.data?.totals?.sales,
  ]);
  const setFilter = <K extends keyof AnalyticsPageFilters>(key: K, value: AnalyticsPageFilters[K]) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleBranchChange = (branchId: string) => {
    setFilter('branchId', branchId === 'all' ? undefined : branchId);
  };

  const handleDateFromChange = (dateFrom: string) => {
    setFilters((previous) => ({
      ...previous,
      dateFrom,
      dateTo:
        previous.dateTo && previous.dateTo < dateFrom
          ? dateFrom
          : previous.dateTo,
    }));
  };

  const handleDateToChange = (dateTo: string) => {
    setFilters((previous) => ({
      ...previous,
      dateTo,
      dateFrom:
        previous.dateFrom && previous.dateFrom > dateTo
          ? dateTo
          : previous.dateFrom,
    }));
  };

  return (
    <div className="space-y-6">
      <AnalyticsHero
        branchLabel={selectedBranchName}
        dateFrom={analyticsFilters?.dateFrom || initialDateFrom}
        dateTo={analyticsFilters?.dateTo || initialDateTo}
        granularityLabel={granularityLabel}
      />

      <AnalyticsFiltersBar
        branches={branches}
        comparePrevious={Boolean(analyticsFilters?.comparePrevious)}
        dateFrom={analyticsFilters?.dateFrom || initialDateFrom}
        dateTo={analyticsFilters?.dateTo || initialDateTo}
        granularity={analyticsFilters?.granularity || 'month'}
        selectedBranchId={analyticsFilters?.branchId}
        onBranchChange={handleBranchChange}
        onComparePreviousChange={(value) => setFilter('comparePrevious', value)}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onGranularityChange={(value) => setFilter('granularity', value)}
      />

      <AnalyticsSummaryStrip
        comparePrevious={Boolean(analyticsFilters?.comparePrevious)}
        currencySymbol={currencySymbol}
        dateLabel={dateLabel}
        granularityLabel={granularityLabel}
        isLoading={summaryQuery.isLoading}
        summary={summaryQuery.data}
        trends={summaryTrends}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AnalyticsSalesTrendCard
            comparePrevious={Boolean(analyticsFilters?.comparePrevious)}
            currencySymbol={currencySymbol}
            data={salesTrendQuery.data}
            error={salesTrendQuery.error}
            isLoading={salesTrendQuery.isLoading}
          />
        </div>
        <AnalyticsSalesByBranchCard
          currencySymbol={currencySymbol}
          data={salesByBranchQuery.data}
          error={salesByBranchQuery.error}
          isLoading={salesByBranchQuery.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AnalyticsCashFlowTrendCard
          currencySymbol={currencySymbol}
          data={cashFlowTrendQuery.data}
          error={cashFlowTrendQuery.error}
          isLoading={cashFlowTrendQuery.isLoading}
        />
        <AnalyticsSalesByCategoryCard
          currencySymbol={currencySymbol}
          data={salesByCategoryQuery.data}
          error={salesByCategoryQuery.error}
          isLoading={salesByCategoryQuery.isLoading}
        />
        <AnalyticsPaymentsDistributionCard
          currencySymbol={currencySymbol}
          data={paymentsDistributionQuery.data}
          error={paymentsDistributionQuery.error}
          isLoading={paymentsDistributionQuery.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AnalyticsTopProductsCard
          currencySymbol={currencySymbol}
          data={topProductsQuery.data}
          error={topProductsQuery.error}
          isLoading={topProductsQuery.isLoading}
        />
        <AnalyticsLowStockCard
          data={lowStockTrendQuery.data}
          error={lowStockTrendQuery.error}
          isLoading={lowStockTrendQuery.isLoading}
        />
      </div>
    </div>
  );
}
