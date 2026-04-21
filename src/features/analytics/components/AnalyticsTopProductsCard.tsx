import { Package2 } from 'lucide-react';
import type { EChartsCoreOption } from 'echarts/core';
import { BaseEChart } from '@/components/shared/charts/BaseEChart';
import { type ChartThemeTokens, withAlpha } from '@/components/shared/charts/chartTheme';
import type { AnalyticsTopProductsData } from '@/services/analytics.service';
import { AnalyticsCardState } from './AnalyticsCardState';

interface AnalyticsTopProductsCardProps {
  currencySymbol: string;
  data?: AnalyticsTopProductsData;
  error?: Error | null;
  isLoading?: boolean;
}

function buildOption(
  items: AnalyticsTopProductsData['items'],
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
      bottom: 28,
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
      data: topItems.map((item) => item.productName),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: tokens.textMuted,
        fontSize: 11,
        interval: 0,
        hideOverlap: true,
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
        data: topItems.map((item) => item.revenue),
        itemStyle: {
          color: tokens.primary,
          borderRadius: [8, 8, 0, 0],
        },
      },
      {
        name: 'Anterior',
        type: 'bar',
        barMaxWidth: 28,
        data: topItems.map((item) => item.previous?.revenue ?? 0),
        itemStyle: {
          color: withAlpha(tokens.textMuted, 0.45),
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
  };
}

export function AnalyticsTopProductsCard({
  currencySymbol,
  data,
  error,
  isLoading,
}: AnalyticsTopProductsCardProps) {
  const items = (data?.items || []).slice(0, 5);

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-border bg-card px-6 pb-6 pt-4 shadow-sm">
      {isLoading ? (
        <AnalyticsCardState title="Cargando ranking" description="Buscando los productos con mejor ingreso y rotación." variant="loading" />
      ) : error ? (
        <AnalyticsCardState title="No se pudo cargar el ranking" description={error.message} variant="error" />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <div className="flex min-h-[160px] flex-col rounded-[24px] border border-dashed border-border/80 bg-muted/10 px-5 py-4">
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              <Package2 className="h-3.5 w-3.5" />
              Ranking
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold leading-tight text-foreground">Top productos</h3>
              <p className="mt-1 text-sm leading-tight text-muted-foreground">Productos líderes por ingreso y rotación.</p>
            </div>
          </div>

          {items.length === 0 ? (
            <AnalyticsCardState title="Sin top productos" description="No hay suficiente venta consolidada para construir el ranking." variant="empty" heightClass="h-[170px]" />
          ) : (
            <div className="h-[320px] rounded-2xl border border-border/70 bg-background/60 p-2">
              <BaseEChart getOption={(tokens) => buildOption(items, currencySymbol, tokens)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
