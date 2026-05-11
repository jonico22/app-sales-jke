import { PieChart } from 'lucide-react';
import type { EChartsCoreOption } from 'echarts/core';
import { BaseEChart } from '@/components/shared/charts/BaseEChart';
import { type ChartThemeTokens, withAlpha } from '@/components/shared/charts/chartTheme';
import type { AnalyticsSalesByCategoryData } from '@/services/analytics.service';
import { AnalyticsCardState } from './AnalyticsCardState';

interface AnalyticsSalesByCategoryCardProps {
  currencySymbol: string;
  data?: AnalyticsSalesByCategoryData;
  error?: Error | null;
  isLoading?: boolean;
}

function buildOption(
  items: AnalyticsSalesByCategoryData['items'],
  currencySymbol: string,
  tokens: ChartThemeTokens,
): EChartsCoreOption {
  const visibleItems = items.slice(0, 6);

  return {
    animation: true,
    grid: {
      top: 20,
      left: 12,
      right: 12,
      bottom: 12,
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
        const category = points[0].axisValue;
        const rows = points.map(
          (point) => `${point.marker} ${point.seriesName}: ${currencySymbol}${Number(point.value).toLocaleString()}`,
        );
        return [`<strong>${category}</strong>`, ...rows].join('<br/>');
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
    yAxis: {
      type: 'category',
      data: visibleItems.map((item) => item.category),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: tokens.textMuted,
        fontSize: 11,
      },
    },
    series: [
      {
        name: 'Actual',
        type: 'bar',
        data: visibleItems.map((item) => item.revenue),
        barMaxWidth: 18,
        itemStyle: {
          color: tokens.primary,
          borderRadius: [0, 8, 8, 0],
        },
      },
      {
        name: 'Anterior',
        type: 'bar',
        data: visibleItems.map((item) => item.previous?.revenue ?? 0),
        barMaxWidth: 18,
        itemStyle: {
          color: withAlpha(tokens.textMuted, 0.45),
          borderRadius: [0, 8, 8, 0],
        },
      },
    ],
  };
}

export function AnalyticsSalesByCategoryCard({
  currencySymbol,
  data,
  error,
  isLoading,
}: AnalyticsSalesByCategoryCardProps) {
  const items = data?.items || [];

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-border bg-card px-6 pb-6 pt-4 shadow-sm">
      <div className="mb-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">
          <PieChart className="h-3.5 w-3.5" />
          Mix
        </div>
        <h3 className="mt-2 text-lg font-bold leading-tight text-foreground">Ventas por categoría</h3>
        <p className="mt-0.5 text-sm leading-tight text-muted-foreground">
          Composición del ingreso por familia de productos.
        </p>
      </div>

      {isLoading ? (
        <AnalyticsCardState title="Cargando categorías" description="Calculando el mix comercial del rango actual." variant="loading" />
      ) : error ? (
        <AnalyticsCardState title="No se pudo cargar el mix" description={error.message} variant="error" />
      ) : items.length === 0 ? (
        <AnalyticsCardState title="Sin categorías con ventas" description="Prueba otro rango o sucursal para reconstruir la composición de ingresos." variant="empty" />
      ) : (
        <div className="h-[320px] rounded-2xl border border-border/70 bg-background/60 p-2">
          <BaseEChart getOption={(tokens) => buildOption(items, currencySymbol, tokens)} />
        </div>
      )}
    </div>
  );
}
