import { useState } from 'react';
import { format } from 'date-fns';
import { BusinessHeader } from './components/BusinessHeader';
import { CatalogSummaryGrid } from './components/CatalogSummaryGrid';
import { CashFlowOverviewCard } from './components/CashFlowOverviewCard';
import { DashboardFiltersBar } from './components/DashboardFiltersBar';
import { LowStockAlertsCard } from './components/LowStockAlertsCard';
import { PaymentMethodsOverviewCard } from './components/PaymentMethodsOverviewCard';
import { SalesTrendOverviewCard } from './components/SalesTrendOverviewCard';
import { StatsGrid } from './components/StatsGrid';
import { TopProductsListCard } from './components/TopProductsListCard';
import { formatDashboardDateRange, type DashboardGranularity } from './components/dashboardFormatting';
import { useDashboardCatalogSummary } from '@/hooks/useDashboardCatalogSummary';
import { useDashboardLowStockAlerts } from '@/hooks/useDashboardLowStockAlerts';
import { useDashboardOverview } from '@/hooks/useDashboardOverview';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useBranches } from '@/hooks/useBranches';
import { useSocietyStore } from '@/store/society.store';

export default function DashboardPage() {
  const society = useSocietyStore((state) => state.society);
  const currencySymbol = society?.mainCurrency?.symbol || 'S/';
  const today = new Date();
  const currentYear = today.getFullYear();
  const [trendGranularity, setTrendGranularity] = useState<DashboardGranularity>('month');
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedDashboardBranchId, setSelectedDashboardBranchId] = useState<string>('all');
  const dashboardGranularity: DashboardGranularity = 'month';

  const { data: branchesData = [] } = useBranches();
  const branchId = selectedDashboardBranchId === 'all' ? undefined : selectedDashboardBranchId;
  const selectedMonthDate = new Date(Number(selectedYear), Number(selectedMonth) - 1, 1);
  const selectedMonthEndDate = new Date(Number(selectedYear), Number(selectedMonth), 0);
  const dateFrom = format(selectedMonthDate, 'yyyy-MM-dd');
  const dateTo = format(selectedMonthEndDate, 'yyyy-MM-dd');
  const dashboardFilters = {
    branchId,
    dateFrom,
    dateTo,
  };

  const statsQuery = useDashboardStats(dashboardFilters);
  const trendOverviewQuery = useDashboardOverview({
    ...dashboardFilters,
    granularity: trendGranularity,
  });
  const dashboardOverviewQuery = useDashboardOverview({
    ...dashboardFilters,
    granularity: dashboardGranularity,
  });
  const lowStockQuery = useDashboardLowStockAlerts({
    ...dashboardFilters,
    limit: 6,
  });
  const catalogSummaryQuery = useDashboardCatalogSummary(dashboardFilters);

  const isInitialLoading =
    !statsQuery.data ||
    !trendOverviewQuery.data ||
    !dashboardOverviewQuery.data ||
    !lowStockQuery.data ||
    !catalogSummaryQuery.data;

  const handleBranchChange = (value: string) => {
    setSelectedDashboardBranchId(value);
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
  };

  const paymentMethodsRange =
    formatDashboardDateRange(dashboardOverviewQuery.data?.salesTrend.map((item) => item.label) || []) ||
    `${format(selectedMonthDate, 'dd MMM yyyy')} - ${format(selectedMonthEndDate, 'dd MMM yyyy')}`;

  return (
    <div className="space-y-6">
      <BusinessHeader />

      <DashboardFiltersBar
        branches={branchesData}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedBranchId={selectedDashboardBranchId === 'all' ? undefined : selectedDashboardBranchId}
        onBranchChange={handleBranchChange}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
      />

      <StatsGrid
        stats={statsQuery.data}
        overview={dashboardOverviewQuery.data}
        currencySymbol={currencySymbol}
        granularity={dashboardGranularity}
        isLoading={isInitialLoading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SalesTrendOverviewCard
          currencySymbol={currencySymbol}
          data={trendOverviewQuery.data?.salesTrend || []}
          granularity={trendGranularity}
          isLoading={trendOverviewQuery.isLoading}
          onGranularityChange={setTrendGranularity}
        />
        <CashFlowOverviewCard
          currencySymbol={currencySymbol}
          data={dashboardOverviewQuery.data?.cashFlowMini || []}
          granularity={dashboardGranularity}
          isLoading={dashboardOverviewQuery.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <PaymentMethodsOverviewCard
          currencySymbol={currencySymbol}
          data={dashboardOverviewQuery.data?.paymentMethods || []}
          dateRangeLabel={paymentMethodsRange}
          isLoading={dashboardOverviewQuery.isLoading}
        />
        <TopProductsListCard
          currencySymbol={currencySymbol}
          data={dashboardOverviewQuery.data?.topProducts || []}
          dateRangeLabel={paymentMethodsRange}
          isLoading={dashboardOverviewQuery.isLoading}
        />
      </div>

      <CatalogSummaryGrid
        summary={catalogSummaryQuery.data}
        currencySymbol={currencySymbol}
        isLoading={catalogSummaryQuery.isLoading}
      />

      <LowStockAlertsCard
        count={lowStockQuery.data?.count}
        data={lowStockQuery.data?.items || []}
        isLoading={lowStockQuery.isLoading}
      />
    </div>
  );
}
