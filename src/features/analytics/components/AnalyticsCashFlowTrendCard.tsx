import type { EChartsCoreOption } from 'echarts/core';
import { Scale } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { BaseEChart } from '@/components/shared/charts/BaseEChart';
import { type ChartThemeTokens, withAlpha } from '@/components/shared/charts/chartTheme';
import type { AnalyticsCashFlowTrendData, AnalyticsGranularity } from '@/services/analytics.service';
import { AnalyticsCardState } from './AnalyticsCardState';

interface AnalyticsCashFlowTrendCardProps {
  currencySymbol: string;
  data?: AnalyticsCashFlowTrendData;
  error?: Error | null;
  isLoading?: boolean;
}

function formatCashFlowLabel(label: string, granularity: AnalyticsGranularity) {
  try {
    const parsed = parseISO(label);
    if (granularity === 'month') return format(parsed, 'MMM yyyy');
    if (granularity === 'week') return format(parsed, 'dd MMM');
    return format(parsed, 'dd MMM');
  } catch {
    return label;
  }
}

function buildOption(
  currencySymbol: string,
  data: AnalyticsCashFlowTrendData,
  tokens: ChartThemeTokens,
): EChartsCoreOption {
  const currentGranularity = data.range.current.granularity;
  const comparisonAligned = data.previousPeriodAligned || [];
  const sourceLabels = comparisonAligned.map((item) => item.sourceLabel);
  const values = [
    ...data.series.flatMap((item) => [item.income, item.expense, item.net]),
    ...comparisonAligned.flatMap((item) => [item.income, item.expense, item.net]),
  ];
  const maxValue = Math.max(...values, 0);
  const getAxisStep = (value: number) => {
    if (value <= 100) return 10;
    if (value <= 1000) return 100;
    if (value <= 5000) return 500;
    if (value <= 10000) return 1000;
    if (value <= 50000) return 5000;
    return 10000;
  };
  const axisStep = getAxisStep(maxValue);
  const yAxisMax = maxValue > 0 ? Math.ceil((maxValue * 1.15) / axisStep) * axisStep : axisStep;

  return {
    animation: true,
    grid: {
      top: 18,
      left: 12,
      right: 12,
      bottom: 6,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
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

        const currentLabel = points[0].axisValue;
        const dataIndex = points[0].dataIndex;
        const sourceLabel = sourceLabels[dataIndex];
        const previous = comparisonAligned[dataIndex];
        const lines = [
          `<strong>${currentLabel}</strong>`,
          ...points.map(
            (point) => `${point.marker} ${point.seriesName}: ${currencySymbol}${Number(point.value).toLocaleString()}`
          ),
          previous
            ? `Ingresos previos: ${currencySymbol}${previous.income.toLocaleString()}`
            : '',
          previous
            ? `Egresos previos: ${currencySymbol}${previous.expense.toLocaleString()}`
            : '',
          previous
            ? `Neto previo: ${currencySymbol}${previous.net.toLocaleString()}`
            : '',
          sourceLabel ? `Comparado con: ${sourceLabel}` : '',
        ].filter(Boolean);

        return lines.join('<br/>');
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
      boundaryGap: true,
      data: data.series.map((item) => formatCashFlowLabel(item.label, currentGranularity)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: tokens.textMuted,
        fontSize: 11,
        interval: 'auto',
        hideOverlap: true,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: yAxisMax,
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
        name: 'Ingresos',
        type: 'bar',
        barMaxWidth: 28,
        barGap: '20%',
        data: data.series.map((item) => item.income),
        label: data.series.length === 1
          ? {
              show: true,
              position: 'top',
              color: tokens.textMuted,
              fontSize: 11,
              formatter: ({ value }: { value: number }) => `${currencySymbol}${Math.round(value)}`,
            }
          : undefined,
        itemStyle: {
          color: tokens.success,
          borderRadius: [8, 8, 0, 0],
        },
      },
      {
        name: 'Egresos',
        type: 'bar',
        barMaxWidth: 28,
        data: data.series.map((item) => item.expense),
        label: data.series.length === 1
          ? {
              show: true,
              position: 'top',
              color: tokens.textMuted,
              fontSize: 11,
              formatter: ({ value }: { value: number }) => `${currencySymbol}${Math.round(value)}`,
            }
          : undefined,
        itemStyle: {
          color: tokens.danger,
          borderRadius: [8, 8, 0, 0],
        },
      },
      {
        name: 'Neto',
        type: 'bar',
        barMaxWidth: 28,
        data: data.series.map((item) => item.net),
        label: data.series.length === 1
          ? {
              show: true,
              position: 'top',
              color: tokens.text,
              fontSize: 11,
              fontWeight: 700,
              formatter: ({ value }: { value: number }) => `${currencySymbol}${Math.round(value)}`,
            }
          : undefined,
        itemStyle: {
          color: tokens.primary,
          borderRadius: [8, 8, 0, 0],
        },
      },
      ...(comparisonAligned.length > 0
        ? [
            {
              name: 'Neto previo',
              type: 'bar',
              barMaxWidth: 28,
              data: comparisonAligned.map((item) => item.net),
              label: data.series.length === 1
                ? {
                    show: true,
                    position: 'top',
                    color: tokens.textMuted,
                    fontSize: 11,
                    formatter: ({ value }: { value: number }) => `${currencySymbol}${Math.round(value)}`,
                  }
                : undefined,
              itemStyle: {
                color: withAlpha(tokens.textMuted, 0.82),
                borderRadius: [8, 8, 0, 0],
              },
            },
          ]
        : []),
    ],
  };
}

function formatDateSafe(value?: string) {
  if (!value) return '--';
  try {
    return format(parseISO(value), 'dd/MM/yyyy');
  } catch {
    return value;
  }
}

export function AnalyticsCashFlowTrendCard({
  currencySymbol,
  data,
  error,
  isLoading,
}: AnalyticsCashFlowTrendCardProps) {
  const hasComparison = Boolean(data?.previousPeriodAligned?.length);
  const dateLabel = data
    ? `${formatDateSafe(data.range.current.dateFrom)} al ${formatDateSafe(data.range.current.dateTo)}`
    : 'Sin rango';

  return (
    <section className="flex h-full flex-col rounded-[28px] border border-border bg-card p-6 shadow-sm">
      <div className="mb-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
          <Scale className="h-3.5 w-3.5" />
          Flujo
        </div>
        <h3 className="mt-3 text-lg font-bold text-foreground">Flujo de caja</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ingresos, egresos y neto del periodo actual
          {hasComparison ? ' comparado con el periodo previo alineado.' : '.'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1">
            {dateLabel}
          </span>
        </div>
      </div>

      {isLoading ? (
        <AnalyticsCardState title="Cargando flujo de caja" description="Estamos preparando ingresos, egresos y neto del periodo." variant="loading" />
      ) : error ? (
        <AnalyticsCardState title="No se pudo cargar el flujo" description={error.message} variant="error" />
      ) : !data || data.series.length === 0 ? (
        <AnalyticsCardState title="Sin movimientos de caja" description="Ajusta los filtros globales para revisar otro periodo o sucursal." variant="empty" />
      ) : (
        <div className="h-[380px]">
          <BaseEChart getOption={(tokens) => buildOption(currencySymbol, data, tokens)} />
        </div>
      )}
    </section>
  );
}
