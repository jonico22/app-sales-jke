import { CreditCard } from 'lucide-react';
import { DonutBreakdownChart } from '@/components/shared/charts/DonutBreakdownChart';
import type { DashboardPaymentMethodSummary } from '@/services/dashboard.service';
import { formatCompactCurrency, formatMethodLabel } from './dashboardFormatting';

interface PaymentMethodsOverviewCardProps {
  currencySymbol: string;
  data: DashboardPaymentMethodSummary[];
  dateRangeLabel?: string;
  isLoading?: boolean;
}

export function PaymentMethodsOverviewCard({
  currencySymbol,
  data,
  dateRangeLabel,
  isLoading,
}: PaymentMethodsOverviewCardProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const legendColors = ['#4ea8e8', '#58c267', '#f4a11a', '#6172f3', '#ef4444'];

  return (
    <div className="rounded-[28px] border border-border bg-card px-6 pb-6 pt-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            <CreditCard className="h-3.5 w-3.5" />
            Cobros
          </div>
          <h3 className="mt-2 text-lg font-bold leading-tight text-foreground">Métodos de Pago</h3>
          <p className="mt-0.5 text-sm leading-tight text-muted-foreground">
            {dateRangeLabel || 'Distribución compacta de cobros del período.'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[320px] animate-pulse rounded-[24px] bg-muted" />
      ) : data.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center rounded-[24px] border border-dashed border-border bg-muted/20 text-sm font-medium text-muted-foreground">
          Sin métodos de pago registrados.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mx-auto h-[220px] w-full max-w-[220px]">
            <DonutBreakdownChart
              data={data.map((item, index) => ({
                name: formatMethodLabel(item.method),
                value: item.amount,
                color: legendColors[index % legendColors.length],
              }))}
              centerLabel={formatCompactCurrency(total, currencySymbol)}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {data.map((item, index) => (
              <div key={`${item.method}-${index}`} className="rounded-2xl border border-border/80 bg-background/80 px-4 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: legendColors[index % legendColors.length] }}
                    />
                    <p className="truncate text-sm font-bold text-foreground">{formatMethodLabel(item.method)}</p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-foreground">
                    {formatCompactCurrency(item.amount, currencySymbol)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
