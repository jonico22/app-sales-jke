import type { EChartsCoreOption } from 'echarts/core';
import { cn } from '@/lib/utils';
import { BaseEChart } from './BaseEChart';
import { buildAreaGradient, type ChartThemeTokens } from './chartTheme';

export interface ComparisonLineDatum {
  label: string;
  primary: number;
  secondary: number;
}

interface ComparisonLineChartProps {
  className?: string;
  data: ComparisonLineDatum[];
  primaryColor?: string;
  secondaryColor?: string;
}

function buildComparisonLineOption(
  data: ComparisonLineDatum[],
  primaryColor: string | undefined,
  secondaryColor: string | undefined,
  tokens: ChartThemeTokens,
): EChartsCoreOption {
  const incomeColor = primaryColor || tokens.success;
  const expenseColor = secondaryColor || tokens.danger;

  return {
    animation: true,
    grid: {
      top: 10,
      left: 8,
      right: 8,
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
        type: 'line',
        lineStyle: {
          color: tokens.border,
        },
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
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
    series: [
      {
        type: 'line',
        data: data.map((item) => item.primary),
        smooth: false,
        step: 'end',
        symbol: 'none',
        lineStyle: {
          color: incomeColor,
          width: 3,
        },
        areaStyle: {
          color: buildAreaGradient(incomeColor),
        },
      },
      {
        type: 'line',
        data: data.map((item) => item.secondary),
        smooth: false,
        step: 'end',
        symbol: 'none',
        lineStyle: {
          color: expenseColor,
          width: 2,
        },
      },
    ],
  };
}

export function ComparisonLineChart({
  className,
  data,
  primaryColor,
  secondaryColor,
}: ComparisonLineChartProps) {
  return (
    <BaseEChart
      className={cn('h-full min-h-0', className)}
      getOption={(tokens) => buildComparisonLineOption(data, primaryColor, secondaryColor, tokens)}
    />
  );
}
