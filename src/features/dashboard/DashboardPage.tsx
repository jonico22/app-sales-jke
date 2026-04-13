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
  const [granularity, setGranularity] = useState<DashboardGranularity>('week');
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
  const dateFrom = format(selectedMonthDate, 'yyyy-MM-dd');
  const dateTo = format(new Date(Number(selectedYear), Number(selectedMonth), 0), 'yyyy-MM-dd');
  const dashboardFilters = {
    branchId,
    dateFrom,
    dateTo,
  };

  const statsQuery = useDashboardStats(dashboardFilters);
  const overviewQuery = useDashboardOverview({
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
    !overviewQuery.data ||
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

  const paymentMethodsRange =
    formatDashboardDateRange(overviewQuery.data?.salesTrend.map((item) => item.label) || []) ||
    `${format(selectedMonthDate, 'dd MMM yyyy')} - ${format(new Date(Number(selectedYear), Number(selectedMonth), 0), 'dd MMM yyyy')}`;

  return (
    <div className="space-y-6">
      <BusinessHeader />

      <DashboardFiltersBar
        branches={branches}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedBranchId={selectedBranch?.id}
        onBranchChange={handleBranchChange}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      <StatsGrid
        stats={statsQuery.data}
        overview={overviewQuery.data}
        currencySymbol={currencySymbol}
        granularity={granularity}
        isLoading={isInitialLoading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SalesTrendOverviewCard
          currencySymbol={currencySymbol}
          data={overviewQuery.data?.salesTrend || []}
          granularity={granularity}
          isLoading={overviewQuery.isLoading}
          onGranularityChange={setGranularity}
        />
        <CashFlowOverviewCard
          currencySymbol={currencySymbol}
          data={overviewQuery.data?.cashFlowMini || []}
          granularity={granularity}
          isLoading={overviewQuery.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <PaymentMethodsOverviewCard
          currencySymbol={currencySymbol}
          data={overviewQuery.data?.paymentMethods || []}
          dateRangeLabel={paymentMethodsRange}
          isLoading={overviewQuery.isLoading}
        />
        <TopProductsListCard
          currencySymbol={currencySymbol}
          data={overviewQuery.data?.topProducts || []}
          dateRangeLabel={paymentMethodsRange}
          isLoading={overviewQuery.isLoading}
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
