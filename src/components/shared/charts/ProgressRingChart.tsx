import type { EChartsCoreOption } from 'echarts/core';
import { BaseEChart } from './BaseEChart';
import type { ChartThemeTokens } from './chartTheme';

interface ProgressRingChartProps {
  className?: string;
  color?: string;
  current: number;
  total: number;
  subtitle?: string;
}

function buildProgressRingOption(
  current: number,
  total: number,
  subtitle: string | undefined,
  color: string | undefined,
  tokens: ChartThemeTokens,
): EChartsCoreOption {
  const safeTotal = total <= 0 ? 1 : total;
  const clampedCurrent = Math.min(Math.max(current, 0), safeTotal);
  const progressColor = color || tokens.primary;
  const percentage = Math.round((clampedCurrent / safeTotal) * 100);

  return {
    animation: true,
    title: {
      text: `${percentage}%`,
      subtext: subtitle,
      left: 'center',
      top: '38%',
      textStyle: {
        color: tokens.text,
        fontSize: 18,
        fontWeight: 700,
        fontFamily: 'Montserrat, sans-serif',
      },
      subtextStyle: {
        color: tokens.textMuted,
        fontSize: 11,
        fontFamily: 'Montserrat, sans-serif',
      },
    },
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
    series: [
      {
        type: 'pie',
        radius: ['68%', '84%'],
        center: ['50%', '50%'],
        startAngle: 90,
        silent: true,
        label: {
          show: false,
        },
        data: [
          {
            value: clampedCurrent,
            name: 'Actual',
            itemStyle: {
              color: progressColor,
              borderRadius: 999,
            },
          },
          {
            value: Math.max(safeTotal - clampedCurrent, 0),
            name: 'Restante',
            itemStyle: {
              color: tokens.muted,
              borderRadius: 999,
            },
          },
        ],
      },
    ],
  };
}

export function ProgressRingChart({
  className,
  color,
  current,
  total,
  subtitle,
}: ProgressRingChartProps) {
  return (
    <BaseEChart
      className={className}
      getOption={(tokens) => buildProgressRingOption(current, total, subtitle, color, tokens)}
    />
  );
}
