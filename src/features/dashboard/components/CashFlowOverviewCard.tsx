import { ArrowDownCircle, ArrowUpCircle, Scale } from 'lucide-react';
import { MiniTrendChart } from '@/components/shared/charts/MiniTrendChart';
import type { DashboardCashFlowMiniPoint } from '@/services/dashboard.service';
import type { DashboardGranularity } from './dashboardFormatting';
import { formatCompactCurrency, getGranularityCopy } from './dashboardFormatting';

interface CashFlowOverviewCardProps {
  currencySymbol: string;
  data: DashboardCashFlowMiniPoint[];
  granularity: DashboardGranularity;
  isLoading?: boolean;
}

interface FlowRowProps {
  accentClassName: string;
  amount: string;
  data: Array<{ label: string; value: number }>;
  icon: React.ReactNode;
  title: string;
  trendColor: string;
}

function FlowRow({
  accentClassName,
  amount,
  data,
  icon,
  title,
  trendColor,
}: FlowRowProps) {
  return (
    <div className="grid grid-cols-[1fr_140px] items-center gap-4 rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
      <div className="min-w-0">
        <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] ${accentClassName}`}>
          {icon}
          {title}
        </div>
        <p className="mt-2 text-xl font-bold tracking-tight text-foreground">{amount}</p>
      </div>
      <div className="h-14 overflow-hidden rounded-xl bg-muted/30 px-1">
        <MiniTrendChart data={data} color={trendColor} />
      </div>
    </div>
  );
}

export function CashFlowOverviewCard({
  currencySymbol,
  data,
  granularity,
  isLoading,
}: CashFlowOverviewCardProps) {
  const copy = getGranularityCopy(granularity);
  const totals = data.reduce(
    (acc, item) => ({
      income: acc.income + item.income,
      expense: acc.expense + item.expense,
      net: acc.net + item.net,
    }),
    { income: 0, expense: 0, net: 0 },
  );

  if (isLoading) {
    return <div className="h-[430px] animate-pulse rounded-[28px] border border-border bg-card shadow-sm" />;
  }

  if (data.length === 0) {
    return (
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
            <Scale className="h-3.5 w-3.5" />
            Flujo
          </div>
          <h3 className="mt-3 text-lg font-bold text-foreground">Flujo {copy.periodLabel}</h3>
          <p className="text-sm text-muted-foreground">Sin movimientos para este período.</p>
        </div>
        <div className="flex h-[260px] items-center justify-center rounded-[24px] border border-dashed border-border bg-muted/20 text-sm font-medium text-muted-foreground">
          No hay datos de ingresos y egresos.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
          <Scale className="h-3.5 w-3.5" />
          Flujo
        </div>
        <h3 className="mt-3 text-lg font-bold text-foreground">Flujo {copy.periodLabel}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Balance neto y comportamiento compacto del período activo.</p>
      </div>

      <div className="rounded-[24px] border border-border/80 bg-muted/20 p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary">
          Neto {copy.periodLabel}
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">
          {formatCompactCurrency(totals.net, currencySymbol)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-600 dark:text-emerald-400">
            <ArrowUpCircle className="h-4 w-4" />
            {formatCompactCurrency(totals.income, currencySymbol)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-rose-600 dark:text-rose-400">
            <ArrowDownCircle className="h-4 w-4" />
            {formatCompactCurrency(totals.expense, currencySymbol)}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <FlowRow
          title="Ingresos"
          amount={formatCompactCurrency(totals.income, currencySymbol)}
          icon={<ArrowUpCircle className="h-3.5 w-3.5" />}
          accentClassName="text-emerald-600 dark:text-emerald-400"
          trendColor="#22c55e"
          data={data.map((item) => ({
            label: item.label,
            value: item.income,
          }))}
        />

        <FlowRow
          title="Egresos"
          amount={formatCompactCurrency(totals.expense, currencySymbol)}
          icon={<ArrowDownCircle className="h-3.5 w-3.5" />}
          accentClassName="text-rose-600 dark:text-rose-400"
          trendColor="#f43f5e"
          data={data.map((item) => ({
            label: item.label,
            value: item.expense,
          }))}
        />
      </div>
    </div>
  );
}
