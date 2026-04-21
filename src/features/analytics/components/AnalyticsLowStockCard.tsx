import { AlertTriangle } from 'lucide-react';
import type { EChartsCoreOption } from 'echarts/core';
import { BaseEChart } from '@/components/shared/charts/BaseEChart';
import { type ChartThemeTokens, withAlpha } from '@/components/shared/charts/chartTheme';
import type { AnalyticsLowStockTrendData, AnalyticsGranularity } from '@/services/analytics.service';
import { AnalyticsCardState } from './AnalyticsCardState';

interface AnalyticsLowStockCardProps {
  data?: AnalyticsLowStockTrendData;
  error?: Error | null;
  isLoading?: boolean;
}

function formatLabel(label: string, granularity: AnalyticsGranularity) {
  if (granularity === 'month') return label;
  return label;
}

function buildOption(data: AnalyticsLowStockTrendData, tokens: ChartThemeTokens): EChartsCoreOption {
  const granularity = data.range.current.granularity;
  const labels = data.series.map((item) => formatLabel(item.label, granularity));
  const previousLowStock = data.previousPeriodAligned?.map((item) => item.lowStockCount) || [];
  const previousCritical = data.previousPeriodAligned?.map((item) => item.criticalCount) || [];
  const sourceLabels = data.previousPeriodAligned?.map((item) => item.sourceLabel) || [];

  return {
    animation: true,
    grid: {
      top: 30,
      left: 12,
      right: 12,
      bottom: 14,
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
        const points = params as Array<{
          axisValue: string;
          marker: string;
          seriesName: string;
          value: number;
          dataIndex: number;
        }>;
        if (!points.length) return '';
        const sourceLabel = sourceLabels[points[0].dataIndex];
        return [
          `<strong>${points[0].axisValue}</strong>`,
          ...points.map((point) => `${point.marker} ${point.seriesName}: ${Number(point.value).toLocaleString()}`),
          sourceLabel ? `Comparado con: ${sourceLabel}` : '',
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
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: tokens.textMuted,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      splitLine: {
        lineStyle: {
          color: tokens.border,
          opacity: 0.7,
        },
      },
      axisLabel: {
        color: tokens.textMuted,
        fontSize: 11,
      },
    },
    series: [
      {
        name: 'Bajo stock',
        type: 'bar',
        barMaxWidth: 20,
        data: data.series.map((item) => item.lowStockCount),
        itemStyle: {
          color: tokens.warning,
          borderRadius: [8, 8, 0, 0],
        },
      },
      {
        name: 'Crítico',
        type: 'bar',
        barMaxWidth: 20,
        data: data.series.map((item) => item.criticalCount),
        itemStyle: {
          color: tokens.danger,
          borderRadius: [8, 8, 0, 0],
        },
      },
      ...(data.previousPeriodAligned && data.previousPeriodAligned.length > 0
        ? [
            {
              name: 'Bajo stock previo',
              type: 'line',
              smooth: false,
              symbol: 'none',
              data: previousLowStock,
              lineStyle: {
                color: withAlpha(tokens.warning, 0.65),
                width: 2,
                type: 'dashed',
              },
            },
            {
              name: 'Crítico previo',
              type: 'line',
              smooth: false,
              symbol: 'none',
              data: previousCritical,
              lineStyle: {
                color: withAlpha(tokens.danger, 0.65),
                width: 2,
                type: 'dashed',
              },
            },
          ]
        : []),
    ],
  };
}

export function AnalyticsLowStockCard({
  data,
  error,
  isLoading,
}: AnalyticsLowStockCardProps) {
  const totalLowStock = (data?.series || []).reduce((sum, item) => sum + item.lowStockCount, 0);
  const totalCritical = (data?.series || []).reduce((sum, item) => sum + item.criticalCount, 0);
  const hasComparison = Boolean(data?.previousPeriodAligned?.length);

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Operativo
          </div>
          <h3 className="mt-3 text-lg font-bold text-foreground">Alertas de bajo stock</h3>
          <p className="text-sm text-muted-foreground">
            Tendencia de productos bajo mínimo y en estado crítico.
            {hasComparison ? ' Incluye comparativo previo alineado.' : ''}
          </p>
        </div>

        <div className="grid gap-2">
          <div className="rounded-2xl bg-amber-500/10 px-4 py-2 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">Bajo stock</p>
            <p className="text-lg font-black text-foreground">{totalLowStock}</p>
          </div>
          <div className="rounded-2xl bg-rose-500/10 px-4 py-2 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">Crítico</p>
            <p className="text-lg font-black text-foreground">{totalCritical}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <AnalyticsCardState title="Cargando alertas" description="Calculando tendencia de riesgo de inventario." variant="loading" heightClass="h-[320px]" />
      ) : error ? (
        <AnalyticsCardState title="No se pudieron cargar las alertas" description={error.message} variant="error" heightClass="h-[320px]" />
      ) : !data || data.series.length === 0 ? (
        <AnalyticsCardState title="Sin alertas históricas" description="No hay buckets con alertas para el rango seleccionado." variant="empty" heightClass="h-[320px]" />
      ) : (
        <div className="h-[320px] rounded-2xl border border-border/70 bg-background/60 p-2">
          <BaseEChart getOption={(tokens) => buildOption(data, tokens)} />
        </div>
      )}
    </div>
  );
}
