import type { EChartsCoreOption } from 'echarts/core';
import { cn } from '@/lib/utils';
import { BaseEChart } from './BaseEChart';
import type { ChartThemeTokens } from './chartTheme';

export interface CompactBarDatum {
  label: string;
  income?: number;
  expense?: number;
  value?: number;
}

interface CompactBarChartProps {
  className?: string;
  data: CompactBarDatum[];
  mode?: 'single' | 'comparison';
}

function buildCompactBarOption(
  data: CompactBarDatum[],
  mode: 'single' | 'comparison',
  tokens: ChartThemeTokens,
): EChartsCoreOption {
  return {
    animation: true,
    grid: {
      top: 8,
      left: 4,
      right: 4,
      bottom: 4,
      containLabel: false,
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
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
    },
    yAxis: {
      type: 'value',
      show: false,
      splitLine: { show: false },
    },
    series: mode === 'comparison'
      ? [
          {
            type: 'bar',
            data: data.map((item) => item.income ?? 0),
            barMaxWidth: 10,
            barGap: '20%',
            itemStyle: {
              color: tokens.success,
              borderRadius: [6, 6, 0, 0],
            },
          },
          {
            type: 'bar',
            data: data.map((item) => item.expense ?? 0),
            barMaxWidth: 10,
            itemStyle: {
              color: tokens.danger,
              borderRadius: [6, 6, 0, 0],
            },
          },
        ]
      : [
          {
            type: 'bar',
            data: data.map((item) => item.value ?? 0),
            barMaxWidth: 12,
            itemStyle: {
              color: tokens.primary,
              borderRadius: [6, 6, 0, 0],
            },
          },
        ],
  };
}

export function CompactBarChart({
  className,
  data,
  mode = 'single',
}: CompactBarChartProps) {
  return (
    <BaseEChart
      className={cn('h-full min-h-0', className)}
      getOption={(tokens) => buildCompactBarOption(data, mode, tokens)}
    />
  );
}
