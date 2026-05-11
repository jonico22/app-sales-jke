import type { EChartsCoreOption } from 'echarts/core';
import { BarChart3 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BaseEChart } from '@/components/shared/charts/BaseEChart';
import { buildAreaGradient, type ChartThemeTokens } from '@/components/shared/charts/chartTheme';
import type { DashboardSalesTrendPoint } from '@/services/dashboard.service';
import type { DashboardGranularity } from './dashboardFormatting';
import { formatTrendAxisLabel, getGranularityCopy } from './dashboardFormatting';

interface SalesTrendOverviewCardProps {
  currencySymbol: string;
  data: DashboardSalesTrendPoint[];
  granularity: DashboardGranularity;
  isLoading?: boolean;
  onGranularityChange: (value: DashboardGranularity) => void;
}

function buildOption(
  currencySymbol: string,
  data: DashboardSalesTrendPoint[],
  granularity: DashboardGranularity,
  tokens: ChartThemeTokens,
): EChartsCoreOption {
  return {
    animation: true,
    grid: {
      top: 24,
      left: 12,
      right: 12,
      bottom: 12,
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
      valueFormatter: (value: number | string) => `${currencySymbol}${Number(value).toLocaleString()}`,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((item) => formatTrendAxisLabel(item.label, granularity)),
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
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: 7,
        data: data.map((item) => item.value),
        lineStyle: {
          color: tokens.primary,
          width: 3,
        },
        itemStyle: {
          color: tokens.primary,
          borderWidth: 2,
          borderColor: tokens.card,
        },
        areaStyle: {
          color: buildAreaGradient(tokens.primary),
        },
      },
    ],
  };
}

export function SalesTrendOverviewCard({
  currencySymbol,
  data,
  granularity,
  isLoading,
  onGranularityChange,
}: SalesTrendOverviewCardProps) {
  const copy = getGranularityCopy(granularity);

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm lg:col-span-2">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[320px] space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            <BarChart3 className="h-3.5 w-3.5" />
            Ventas Compactas
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight text-foreground sm:text-xl">
              Tendencia {copy.longLabel.toLowerCase()}
            </h3>
            <p className="mt-1 text-sm leading-snug text-muted-foreground">
              Vista resumida segun el periodo seleccionado.
            </p>
          </div>
        </div>

        <Tabs
          value={granularity}
          onValueChange={(value) => onGranularityChange(value as DashboardGranularity)}
          className="w-auto"
        >
          <TabsList className="h-auto w-auto rounded-2xl border border-border bg-muted/50 p-1">
            <TabsTrigger value="day" className="min-w-[74px] rounded-xl border-none px-4 py-2 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Día
            </TabsTrigger>
            <TabsTrigger value="week" className="min-w-[92px] rounded-xl border-none px-4 py-2 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Semana
            </TabsTrigger>
            <TabsTrigger value="month" className="min-w-[74px] rounded-xl border-none px-4 py-2 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Mes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="h-[320px] animate-pulse rounded-[24px] bg-muted" />
      ) : data.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center rounded-[24px] border border-dashed border-border bg-muted/20 text-sm font-medium text-muted-foreground">
          Sin datos de tendencia para este filtro.
        </div>
      ) : (
        <div className="h-[320px]">
          <BaseEChart getOption={(tokens) => buildOption(currencySymbol, data, granularity, tokens)} />
        </div>
      )}
    </div>
  );
}
