import type { EChartsCoreOption } from 'echarts/core';
import { cn } from '@/lib/utils';
import { BaseEChart } from './BaseEChart';
import { buildAreaGradient, type ChartThemeTokens } from './chartTheme';

export interface MiniTrendDatum {
  label: string;
  value: number;
}

interface MiniTrendChartProps {
  className?: string;
  color?: string;
  data: MiniTrendDatum[];
  showArea?: boolean;
  smooth?: boolean;
}

function buildMiniTrendOption(
  data: MiniTrendDatum[],
  color: string | undefined,
  showArea: boolean,
  smooth: boolean,
  tokens: ChartThemeTokens,
): EChartsCoreOption {
  const lineColor = color || tokens.primary;

  return {
    animation: true,
    grid: {
      top: 8,
      right: 0,
      bottom: 8,
      left: 0,
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
          width: 1,
        },
      },
      formatter: (params: unknown) => {
        const [point] = params as Array<{ axisValueLabel: string; value: number }>;
        return `${point.axisValueLabel}<br/>${point.value.toLocaleString()}`;
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((item) => item.label),
      show: false,
    },
    yAxis: {
      type: 'value',
      show: false,
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        type: 'line',
        data: data.map((item) => item.value),
        smooth,
        symbol: 'none',
        lineStyle: {
          width: 3,
          color: lineColor,
        },
        areaStyle: showArea
          ? {
              color: buildAreaGradient(lineColor),
            }
          : undefined,
      },
    ],
  };
}

export function MiniTrendChart({
  className,
  color,
  data,
  showArea = true,
  smooth = false,
}: MiniTrendChartProps) {
  return (
    <BaseEChart
      className={cn('h-full min-h-0', className)}
      getOption={(tokens) => buildMiniTrendOption(data, color, showArea, smooth, tokens)}
    />
  );
}
