import {
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { MiniTrendChart, type MiniTrendDatum } from '@/components/shared/charts/MiniTrendChart';
import type { AnalyticsSummaryData, AnalyticsSummaryMetricKey } from '@/services/analytics.service';
import { cn } from '@/lib/utils';

interface AnalyticsSummaryStripProps {
  comparePrevious: boolean;
  currencySymbol: string;
  dateLabel: string;
  granularityLabel: string;
  isLoading?: boolean;
  trends?: {
    averageTicket: MiniTrendDatum[];
    orders: MiniTrendDatum[];
    sales: MiniTrendDatum[];
  };
  summary?: AnalyticsSummaryData;
}

interface SummaryItemProps {
  changeTone: 'positive' | 'negative' | 'neutral';
  compactChangeLabel: string;
  isLoading?: boolean;
  label: string;
  previousText: string;
  detailText?: string;
  trendContextLabel: string;
  trendColor: string;
  trendData: MiniTrendDatum[];
  value: string;
}

function SummaryItem({
  changeTone,
  compactChangeLabel,
  isLoading,
  label,
  previousText,
  detailText,
  trendContextLabel,
  trendColor,
  trendData,
  value,
}: SummaryItemProps) {
  const toneClassName = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-muted-foreground',
  }[changeTone];

  return (
    <div className="rounded-[24px] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <div
            className={cn(
              'mt-2 inline-flex items-center gap-1 text-xs font-bold tracking-wide',
              toneClassName
            )}
          >
            {changeTone === 'positive' ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : changeTone === 'negative' ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
            <span>{compactChangeLabel}</span>
          </div>
        </div>
        {isLoading ? (
          <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
        ) : (
          <p className="whitespace-nowrap text-right text-[28px] font-black leading-none tracking-tight text-foreground sm:text-[32px]">
            {value}
          </p>
        )}
      </div>

      <div className="mt-3 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_176px] lg:items-center">
        <div className="min-w-0">
          {isLoading ? (
            <>
              <div className="mt-2 h-4 w-48 animate-pulse rounded-lg bg-muted" />
              <div className="mt-2 h-4 w-44 animate-pulse rounded-lg bg-muted" />
            </>
          ) : (
            <>
              <p className="text-sm font-medium leading-snug text-muted-foreground">{previousText}</p>
              {detailText ? (
                <p className="mt-1 text-sm font-medium leading-snug text-muted-foreground">{detailText}</p>
              ) : null}
            </>
          )}
        </div>

        {!isLoading ? (
          <div className="rounded-2xl border border-border/70 bg-background/60 p-2">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary/80">
              {trendContextLabel}
            </p>
            <div className="mt-1.5 h-14 overflow-hidden rounded-xl bg-muted/25 px-1">
              <MiniTrendChart
                className="translate-y-0.5"
                color={trendColor}
                data={trendData.length > 1 ? trendData : [...trendData, ...trendData]}
              />
            </div>
          </div>
        ) : (
          <div className="h-20 animate-pulse rounded-2xl bg-muted" />
        )}
      </div>
    </div>
  );
}

function getChangeState(
  comparePrevious: boolean,
  value?: number | null
): { compactLabel: string; label: string; tone: 'positive' | 'negative' | 'neutral' } {
  if (!comparePrevious || value === null || value === undefined || Number.isNaN(value)) {
    return { compactLabel: '--', label: 'Variación --', tone: 'neutral' };
  }

  if (value > 0) {
    return { compactLabel: `+${value.toFixed(1)}%`, label: `Variación +${value.toFixed(1)}%`, tone: 'positive' };
  }

  if (value < 0) {
    return { compactLabel: `${value.toFixed(1)}%`, label: `Variación ${value.toFixed(1)}%`, tone: 'negative' };
  }

  return { compactLabel: '0.0%', label: 'Variación 0.0%', tone: 'neutral' };
}

function formatPreviousText(
  comparePrevious: boolean,
  previous: number | null | undefined,
  formatter: (value: number) => string,
  fallbackText: string,
) {
  if (!comparePrevious || previous === null || previous === undefined || Number.isNaN(previous)) {
    return fallbackText;
  }

  return `Anterior: ${formatter(previous)}`;
}

export function AnalyticsSummaryStrip({
  comparePrevious,
  currencySymbol,
  dateLabel,
  granularityLabel,
  isLoading = false,
  trends,
  summary,
}: AnalyticsSummaryStripProps) {
  const trendContextLabel = granularityLabel.includes('mensual')
    ? 'Mes'
    : granularityLabel.includes('semanal')
      ? 'Semana'
      : 'Día';

  const getMetric = (metric: AnalyticsSummaryMetricKey) => {
    const comparisonMetric = summary?.comparisonByMetric?.[metric];
    return {
      current: comparisonMetric?.current ?? summary?.totals?.[metric] ?? 0,
      previous: comparePrevious ? (comparisonMetric?.previous ?? null) : null,
      delta: comparePrevious ? (comparisonMetric?.delta ?? null) : null,
      deltaPct: comparePrevious ? (comparisonMetric?.deltaPct ?? null) : null,
    };
  };

  const salesMetric = getMetric('sales');
  const ordersMetric = getMetric('orders');
  const averageTicketMetric = getMetric('averageTicket');

  const formatCurrency = (value: number) =>
    `${currencySymbol} ${new Intl.NumberFormat('es-PE', {
      maximumFractionDigits: 2,
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value)}`;

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      maximumFractionDigits: 0,
    }).format(value);

  const salesChange = getChangeState(
    comparePrevious,
    salesMetric.deltaPct ?? summary?.comparison?.salesPct
  );
  const ordersChange = getChangeState(
    comparePrevious,
    ordersMetric.deltaPct ?? summary?.comparison?.ordersPct
  );
  const averageTicketChange = getChangeState(
    comparePrevious,
    averageTicketMetric.deltaPct ?? summary?.comparison?.averageTicketPct
  );

  const items = [
    {
      label: 'Ventas',
      value: formatCurrency(salesMetric.current),
      subtitle: formatPreviousText(
        comparePrevious,
        salesMetric.previous,
        formatCurrency,
        `${granularityLabel} · ${dateLabel}`
      ),
      detail: comparePrevious && salesMetric.delta !== null && salesMetric.delta !== undefined
        ? `Diferencia: ${formatCurrency(salesMetric.delta)}`
        : '',
      trendContextLabel,
      trendColor: '#3b82f6',
      trendData: trends?.sales || [],
      change: salesChange,
    },
    {
      label: 'Pedidos',
      value: formatNumber(ordersMetric.current),
      subtitle: formatPreviousText(
        comparePrevious,
        ordersMetric.previous,
        formatNumber,
        'Cantidad de órdenes del periodo'
      ),
      detail: comparePrevious && ordersMetric.delta !== null && ordersMetric.delta !== undefined
        ? `Diferencia: ${formatNumber(ordersMetric.delta)}`
        : '',
      trendContextLabel,
      trendColor: '#0f766e',
      trendData: trends?.orders || [],
      change: ordersChange,
    },
    {
      label: 'Ticket promedio',
      value: formatCurrency(averageTicketMetric.current),
      subtitle: formatPreviousText(
        comparePrevious,
        averageTicketMetric.previous,
        formatCurrency,
        'Promedio por venta del rango actual'
      ),
      detail: comparePrevious && averageTicketMetric.delta !== null && averageTicketMetric.delta !== undefined
        ? `Diferencia: ${formatCurrency(averageTicketMetric.delta)}`
        : '',
      trendContextLabel,
      trendColor: '#7c3aed',
      trendData: trends?.averageTicket || [],
      change: averageTicketChange,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {items.map((item) => (
        <SummaryItem
          key={item.label}
          changeTone={item.change.tone}
          compactChangeLabel={item.change.compactLabel}
          isLoading={isLoading}
          label={item.label}
          previousText={item.subtitle}
          detailText={item.detail}
          trendContextLabel={item.trendContextLabel}
          trendColor={item.trendColor}
          trendData={item.trendData}
          value={item.value}
        />
      ))}
    </div>
  );
}
