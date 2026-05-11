import { ReceiptText, ShoppingCart } from 'lucide-react';
import { TrendStatCard } from '@/components/shared/charts/TrendStatCard';
import type { DashboardOverviewResponse, DashboardStats } from '@/services/dashboard.service';
import type { DashboardGranularity } from './dashboardFormatting';
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatCurrency,
  getGranularityCopy,
} from './dashboardFormatting';

interface StatsGridProps {
  currencySymbol: string;
  granularity: DashboardGranularity;
  isLoading?: boolean;
  overview?: DashboardOverviewResponse['data'];
  stats?: DashboardStats;
}

interface MetricCardProps {
  icon: React.ReactNode;
  isLoading?: boolean;
  subtitle: string;
  title: string;
  value: string;
  accentClassName?: string;
}

function MetricCard({
  accentClassName = 'bg-muted text-foreground',
  icon,
  isLoading,
  subtitle,
  title,
  value,
}: MetricCardProps) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentClassName}`}>
          {icon}
        </div>
      </div>
      <p className="mt-6 text-xs font-medium text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function StatsGrid({
  currencySymbol,
  granularity,
  isLoading,
  overview,
  stats,
}: StatsGridProps) {
  const copy = getGranularityCopy(granularity);

  const salesValue = granularity === 'day'
    ? stats?.salesToday || 0
    : granularity === 'week'
      ? stats?.salesThisWeek || 0
      : stats?.salesThisMonth || 0;

  const ordersValue = granularity === 'day'
    ? stats?.completedOrdersToday || 0
    : granularity === 'week'
      ? stats?.completedOrdersThisWeek || 0
      : stats?.completedOrdersThisMonth || 0;

  const averageTicketValue = granularity === 'day'
    ? stats?.averageTicketToday || 0
    : granularity === 'week'
      ? stats?.averageTicketThisWeek || 0
      : stats?.averageTicketThisMonth || 0;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
      <TrendStatCard
        title={copy.salesTitle}
        value={formatCompactCurrency(salesValue, currencySymbol)}
        change={copy.label}
        trendLabel={`Tendencia ${copy.longLabel.toLowerCase()}`}
        data={(overview?.salesTrend || []).map((item) => ({
          label: item.label,
          value: item.value,
        }))}
        className="xl:col-span-2"
      />

      <MetricCard
        title={copy.ordersTitle}
        value={formatCompactNumber(ordersValue)}
        subtitle={`Órdenes completadas ${copy.longLabel.toLowerCase()}`}
        icon={<ReceiptText className="h-5 w-5" />}
        accentClassName="bg-primary/10 text-primary"
        isLoading={isLoading}
      />

      <MetricCard
        title={copy.ticketTitle}
        value={formatCurrency(averageTicketValue, currencySymbol)}
        subtitle={`Promedio por venta ${copy.longLabel.toLowerCase()}`}
        icon={<ShoppingCart className="h-5 w-5" />}
        accentClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        isLoading={isLoading}
      />
    </div>
  );
}
