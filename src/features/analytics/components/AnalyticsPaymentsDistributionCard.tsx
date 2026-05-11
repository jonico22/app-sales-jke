import { CreditCard } from 'lucide-react';
import type { EChartsCoreOption } from 'echarts/core';
import { BaseEChart } from '@/components/shared/charts/BaseEChart';
import { type ChartThemeTokens, withAlpha } from '@/components/shared/charts/chartTheme';
import type { AnalyticsPaymentsDistributionData } from '@/services/analytics.service';
import { AnalyticsCardState } from './AnalyticsCardState';

interface AnalyticsPaymentsDistributionCardProps {
  currencySymbol: string;
  data?: AnalyticsPaymentsDistributionData;
  error?: Error | null;
  isLoading?: boolean;
}

function buildOption(
  items: AnalyticsPaymentsDistributionData['items'],
  currencySymbol: string,
  tokens: ChartThemeTokens,
): EChartsCoreOption {
  const topItems = items.slice(0, 6);

  return {
    animation: true,
    grid: {
      top: 26,
      left: 10,
      right: 10,
      bottom: 26,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      backgroundColor: tokens.tooltipBackground,
      borderColor: tokens.tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: tokens.text,
        fontFamily: 'Montserrat, sans-serif',
      },
      formatter: (params: unknown) => {
        const points = params as Array<{ marker: string; seriesName: string; value: number; axisValue: string }>;
        if (!points.length) return '';
        return [
          `<strong>${points[0].axisValue}</strong>`,
          ...points.map((point) => `${point.marker} ${point.seriesName}: ${currencySymbol}${Number(point.value).toLocaleString()}`),
        ].join('<br/>');
      },
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: {
        color: tokens.textMuted,
        fontSize: 11,
      },
    },
    xAxis: {
      type: 'category',
      data: topItems.map((item) => item.method),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: tokens.textMuted,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: tokens.border,
          opacity: 0.7,
        },
      },
      axisLabel: {
        color: tokens.textMuted,
        fontSize: 11,
        formatter: (value: number) => `${currencySymbol}${Math.round(value)}`,
      },
    },
    series: [
      {
        name: 'Actual',
        type: 'bar',
        barMaxWidth: 28,
        data: topItems.map((item) => item.amount),
        itemStyle: {
          color: tokens.primary,
          borderRadius: [8, 8, 0, 0],
        },
      },
      {
        name: 'Anterior',
        type: 'bar',
        barMaxWidth: 28,
        data: topItems.map((item) => item.previous?.amount ?? 0),
        itemStyle: {
          color: withAlpha(tokens.textMuted, 0.45),
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
  };
}

export function AnalyticsPaymentsDistributionCard({
  currencySymbol,
  data,
  error,
  isLoading,
}: AnalyticsPaymentsDistributionCardProps) {
  const items = data?.items || [];

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-border bg-card px-6 pb-6 pt-4 shadow-sm">
      <div className="mb-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
          <CreditCard className="h-3.5 w-3.5" />
          Cobros
        </div>
        <h3 className="mt-2 text-lg font-bold leading-tight text-foreground">Distribución de pagos</h3>
        <p className="mt-0.5 text-sm leading-tight text-muted-foreground">
          Participación por método de pago en el rango filtrado.
        </p>
      </div>

      {isLoading ? (
        <AnalyticsCardState title="Cargando pagos" description="Armando la distribución por método de cobro del rango actual." variant="loading" />
      ) : error ? (
        <AnalyticsCardState title="No se pudo cargar la distribución" description={error.message} variant="error" />
      ) : items.length === 0 ? (
        <AnalyticsCardState title="Sin métodos de pago" description="Todavía no hay cobros consolidados con los filtros seleccionados." variant="empty" />
      ) : (
        <div className="h-[320px] rounded-2xl border border-border/70 bg-background/60 p-2">
          <BaseEChart getOption={(tokens) => buildOption(items, currencySymbol, tokens)} />
        </div>
      )}
    </div>
  );
}
