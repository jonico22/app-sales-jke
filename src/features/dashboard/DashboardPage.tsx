import { useEffect, useState } from 'react';
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
import { useBranchStore } from '@/store/branch.store';
import { useSocietyStore } from '@/store/society.store';

export default function DashboardPage() {
  const society = useSocietyStore((state) => state.society);
  const currencySymbol = society?.mainCurrency?.symbol || 'S/';
  const today = new Date();
  const currentYear = today.getFullYear();
  const [granularity, setGranularity] = useState<DashboardGranularity>('month');
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const { data: branchesData = [] } = useBranches();
  const { branches, selectedBranch, selectBranch, setBranches } = useBranchStore();

  useEffect(() => {
    if (branchesData.length > 0 && (branches.length === 0 || branches.length !== branchesData.length)) {
      setBranches(branchesData);
    }
  }, [branches.length, branchesData, setBranches]);

  const branchId = selectedBranch?.id || undefined;
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
    granularity,
  });
  const operationalOverviewQuery = useDashboardOverview({
    ...dashboardFilters,
    granularity,
  });
  const lowStockQuery = useDashboardLowStockAlerts({
    ...dashboardFilters,
    limit: 6,
  });
  const catalogSummaryQuery = useDashboardCatalogSummary(dashboardFilters);

  const isInitialLoading =
    !statsQuery.data ||
    !trendOverviewQuery.data ||
    !operationalOverviewQuery.data ||
    !lowStockQuery.data ||
    !catalogSummaryQuery.data;

  const handleBranchChange = (value: string) => {
    if (value === 'all') {
      useBranchStore.setState({ selectedBranch: null });
      return;
    }

    const branch = branches.find((item) => item.id === value);
    if (branch) selectBranch(branch);
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    setGranularity('month');
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setGranularity('month');
  };

  const paymentMethodsRange =
    formatDashboardDateRange(operationalOverviewQuery.data?.salesTrend.map((item) => item.label) || []) ||
    `${format(selectedMonthDate, 'dd MMM yyyy')} - ${format(selectedMonthEndDate, 'dd MMM yyyy')}`;

  return (
    <div className="space-y-6">
      <BusinessHeader />

      <DashboardFiltersBar
        branches={branches}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedBranchId={selectedBranch?.id}
        onBranchChange={handleBranchChange}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
      />

      <StatsGrid
        stats={statsQuery.data}
        overview={trendOverviewQuery.data}
        currencySymbol={currencySymbol}
        granularity={granularity}
        isLoading={isInitialLoading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SalesTrendOverviewCard
          currencySymbol={currencySymbol}
          data={trendOverviewQuery.data?.salesTrend || []}
          granularity={granularity}
          isLoading={trendOverviewQuery.isLoading}
          onGranularityChange={setGranularity}
        />
        <CashFlowOverviewCard
          currencySymbol={currencySymbol}
          data={trendOverviewQuery.data?.cashFlowMini || []}
          granularity={granularity}
          isLoading={trendOverviewQuery.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <PaymentMethodsOverviewCard
          currencySymbol={currencySymbol}
          data={operationalOverviewQuery.data?.paymentMethods || []}
          dateRangeLabel={paymentMethodsRange}
          isLoading={operationalOverviewQuery.isLoading}
        />
        <TopProductsListCard
          currencySymbol={currencySymbol}
          data={operationalOverviewQuery.data?.topProducts || []}
          dateRangeLabel={paymentMethodsRange}
          isLoading={operationalOverviewQuery.isLoading}
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
