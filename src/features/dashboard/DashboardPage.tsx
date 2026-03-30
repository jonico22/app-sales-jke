import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatsGrid } from './components/StatsGrid';
import { BusinessHeader } from './components/BusinessHeader';
import { dashboardService } from '@/services/dashboard.service';
import { useSocietyStore } from '@/store/society.store';

// Lazy load heavy chart components
const SalesPerformanceChart = lazy(() => import('./components/SalesPerformanceChart').then(m => ({ default: m.SalesPerformanceChart })));
const RevenueByCategoryChart = lazy(() => import('./components/RevenueByCategoryChart').then(m => ({ default: m.RevenueByCategoryChart })));
const TopProductsChart = lazy(() => import('./components/TopProductsChart').then(m => ({ default: m.TopProductsChart })));
const PaymentMethodsChart = lazy(() => import('./components/PaymentMethodsChart').then(m => ({ default: m.PaymentMethodsChart })));

export default function DashboardPage() {
  const society = useSocietyStore(state => state.society);
  const currencySymbol = society?.mainCurrency?.symbol || 'S/';
  const {
    data: salesPerformance = [],
    isLoading: isLoadingSales
  } = useQuery({
    queryKey: ['salesPerformance'],
    queryFn: () => dashboardService.getSalesPerformance().catch(() => [])
  });

  const {
    data: revenueByCategory = [],
    isLoading: isLoadingRevenue
  } = useQuery({
    queryKey: ['revenueByCategory'],
    queryFn: () => dashboardService.getRevenueByCategory().catch(() => [])
  });

  const {
    data: topProducts = [],
    isLoading: isLoadingProducts
  } = useQuery({
    queryKey: ['topProducts'],
    queryFn: () => dashboardService.getTopProducts().catch(() => [])
  });

  const {
    data: paymentMethods = [],
    isLoading: isLoadingPayments
  } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => dashboardService.getPaymentMethods().catch(() => [])
  });

  return (
    <div className="space-y-6">
      {/* 0. Business Header */}
      <BusinessHeader />

      {/* 1. Stats Grid */}
      <StatsGrid />

      {/* 3. Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-2xl border border-border/50 lg:col-span-2" />}>
          <SalesPerformanceChart
            data={salesPerformance as any}
            isLoading={isLoadingSales}
            currencySymbol={currencySymbol}
          />
        </Suspense>
        <Suspense fallback={<div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-2xl border border-border/50 col-span-1" />}>
          <RevenueByCategoryChart
            data={revenueByCategory}
            isLoading={isLoadingRevenue}
            currencySymbol={currencySymbol}
          />
        </Suspense>
      </div>

      {/* 4. Bottom Cards Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-2xl border border-border/50" />}>
          <TopProductsChart
            data={topProducts as any}
            isLoading={isLoadingProducts}
          />
        </Suspense>
        <Suspense fallback={<div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-2xl border border-border/50" />}>
          <PaymentMethodsChart
            data={paymentMethods as any}
            isLoading={isLoadingPayments}
            currencySymbol={currencySymbol}
          />
        </Suspense>
      </div>
    </div>
  );
}
