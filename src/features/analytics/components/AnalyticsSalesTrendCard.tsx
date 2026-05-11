import type { EChartsCoreOption } from 'echarts/core';
import { BarChart3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { BaseEChart } from '@/components/shared/charts/BaseEChart';
import { type ChartThemeTokens, withAlpha } from '@/components/shared/charts/chartTheme';
import type { AnalyticsSalesTrendData } from '@/services/analytics.service';
import { AnalyticsCardState } from './AnalyticsCardState';

interface AnalyticsSalesTrendCardProps {
  comparePrevious: boolean;
  currencySymbol: string;
  data?: AnalyticsSalesTrendData;
  error?: Error | null;
  isLoading?: boolean;
}

function formatSalesTrendLabel(label: string, granularity: AnalyticsSalesTrendData['range']['current']['granularity']) {
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
  data: AnalyticsSalesTrendData,
  comparePrevious: boolean,
  tokens: ChartThemeTokens,
): EChartsCoreOption {
  const isSinglePoint = data.series.length === 1;
  const labels = data.series.map((item) => formatSalesTrendLabel(item.label, data.range.current.granularity));
  const previousSales = comparePrevious
    ? data.series.map((_, index) => data.previousPeriodAligned?.[index]?.sales ?? null)
    : [];
  const previousSourceLabels = comparePrevious
    ? data.series.map((_, index) => data.previousPeriodAligned?.[index]?.sourceLabel || '-')
    : [];
  const chartValues = [
    ...data.series.map((item) => item.sales),
    ...previousSales.filter((value): value is number => value !== null),
  ];
  const maxValue = Math.max(...chartValues, 0);
  const getAxisStep = (value: number) => {
    if (value <= 100) return 10;
    if (value <= 1000) return 100;
    if (value <= 5000) return 500;
    if (value <= 10000) return 1000;
    if (value <= 50000) return 5000;
    return 10000;
  };
  const axisStep = getAxisStep(maxValue);
  const yAxisMax = maxValue > 0 ? Math.ceil((maxValue * 1.2) / axisStep) * axisStep : axisStep;

  return {
    animation: true,
    grid: {
      top: 12,
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
          seriesIndex: number;
          dataIndex: number;
        }>;
        if (!points.length) return '';

        const currentPoint = points.find((point) => point.seriesName === 'Ventas');
        const previousPoint = points.find((point) => point.seriesName === 'Periodo previo');
        const sourceLabel =
          typeof previousPoint?.dataIndex === 'number'
            ? previousSourceLabels[previousPoint.dataIndex] || '-'
            : '-';
        const currentLabel = points[0].axisValue;

        const lines = [
          `<strong>${currentLabel}</strong>`,
          currentPoint
            ? `${currentPoint.marker} ${currentPoint.seriesName}: ${currencySymbol}${Number(currentPoint.value).toLocaleString()}`
            : '',
          previousPoint
            ? `${previousPoint.marker} ${previousPoint.seriesName}: ${currencySymbol}${Number(previousPoint.value).toLocaleString()}`
            : '',
          previousPoint ? `Comparado con: ${sourceLabel}` : '',
        ].filter(Boolean);

        return lines.join('<br/>');
      },
    },
    legend: {
      show: false,
      textStyle: {
        color: tokens.textMuted,
        fontSize: 11,
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: labels,
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
      ...(comparePrevious && data.previousPeriodAligned && data.previousPeriodAligned.length > 0
        ? [
            {
              name: 'Periodo previo',
              type: 'bar',
              barMaxWidth: isSinglePoint ? 42 : 28,
              barMinHeight: 4,
              data: previousSales,
              itemStyle: {
                color: withAlpha(tokens.textMuted, 0.75),
                borderRadius: [10, 10, 0, 0],
              },
            },
          ]
        : []),
      {
        name: 'Ventas',
        type: 'bar',
        barMaxWidth: isSinglePoint ? 42 : 28,
        barMinHeight: 4,
        data: data.series.map((item) => item.sales),
        itemStyle: {
          color: tokens.primary,
          borderRadius: [10, 10, 0, 0],
        },
      },
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

export function AnalyticsSalesTrendCard({
  comparePrevious,
  currencySymbol,
  data,
  error,
  isLoading,
}: AnalyticsSalesTrendCardProps) {
  const dateLabel = data
    ? `${formatDateSafe(data.range.current.dateFrom)} al ${formatDateSafe(data.range.current.dateTo)}`
    : 'Sin rango';
  const hasComparison = comparePrevious && Boolean(data?.previousPeriodAligned?.length);

  return (
    <section className="flex h-full flex-col rounded-[28px] border border-border bg-card p-6 shadow-sm xl:col-span-2">
      <div className="mb-1.5 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              <BarChart3 className="h-3.5 w-3.5" />
              Serie principal
            </div>
            <h3 className="text-lg font-bold leading-tight text-foreground sm:text-xl">
              Tendencia de ventas
            </h3>
          </div>
          <div className="flex items-center gap-3 pt-1 text-xs font-medium text-muted-foreground">
            {hasComparison ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/70" />
                Periodo previo
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
              Ventas
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>{dateLabel}</span>
        </div>
      </div>

      {isLoading ? (
        <AnalyticsCardState title="Cargando tendencia" description="Preparando la serie principal de ventas del rango actual." variant="loading" heightClass="h-[300px]" />
      ) : error ? (
        <AnalyticsCardState title="No se pudo cargar la tendencia" description={error.message} variant="error" heightClass="h-[300px]" />
      ) : !data || data.series.length === 0 ? (
        <AnalyticsCardState title="Sin datos de ventas" description="Prueba con otro rango, sucursal o granularidad para visualizar la serie." variant="empty" heightClass="h-[300px]" />
      ) : (
        <div className="h-[300px]">
          <BaseEChart getOption={(tokens) => buildOption(currencySymbol, data, comparePrevious, tokens)} />
        </div>
      )}
    </section>
  );
}
