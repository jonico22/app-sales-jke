import type { EChartsCoreOption } from 'echarts/core';
import { BaseEChart } from './BaseEChart';
import type { ChartThemeTokens } from './chartTheme';

export interface DonutBreakdownDatum {
  name: string;
  value: number;
  color?: string;
}

interface DonutBreakdownChartProps {
  className?: string;
  centerLabel?: string;
  data: DonutBreakdownDatum[];
}

function buildDonutOption(
  data: DonutBreakdownDatum[],
  centerLabel: string | undefined,
  tokens: ChartThemeTokens,
): EChartsCoreOption {
  return {
    animation: true,
    tooltip: {
      trigger: 'item',
      backgroundColor: tokens.tooltipBackground,
      borderColor: tokens.tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: tokens.text,
        fontFamily: 'Montserrat, sans-serif',
      },
    },
    title: centerLabel
      ? {
          text: centerLabel,
          left: 'center',
          top: '42%',
          textStyle: {
            color: tokens.text,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'Montserrat, sans-serif',
          },
        }
      : undefined,
    series: [
      {
        type: 'pie',
        radius: ['62%', '82%'],
        center: ['50%', '50%'],
        label: { show: false },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color || tokens.series[index % tokens.series.length],
            borderWidth: 0,
          },
        })),
      },
    ],
  };
}

export function DonutBreakdownChart({
  className,
  centerLabel,
  data,
}: DonutBreakdownChartProps) {
  return (
    <BaseEChart
      className={className}
      getOption={(tokens) => buildDonutOption(data, centerLabel, tokens)}
    />
  );
}
