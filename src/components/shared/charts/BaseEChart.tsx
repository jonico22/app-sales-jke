import { useEffect, useRef, useState } from 'react';
import { init, type ECharts, type EChartsCoreOption } from 'echarts/core';
import { cn } from '@/lib/utils';
import { getChartThemeTokens, type ChartThemeTokens } from './chartTheme';
import './echarts-registry';

interface BaseEChartProps {
  className?: string;
  option?: EChartsCoreOption;
  getOption?: (tokens: ChartThemeTokens) => EChartsCoreOption;
}

function getThemeSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.document.documentElement.classList.contains('dark');
}

export function BaseEChart({ className, option, getOption }: BaseEChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ECharts | null>(null);
  const [themeVersion, setThemeVersion] = useState(() => Number(getThemeSnapshot()));
  const tokens = getChartThemeTokens();

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const chart = init(node);
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    const observer = new MutationObserver(() => {
      setThemeVersion((current) => current + 1);
    });

    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const resolvedOption = getOption ? getOption(tokens) : option;
    if (!resolvedOption) return;

    chart.setOption(resolvedOption, true);
  }, [getOption, option, themeVersion, tokens]);

  return <div ref={containerRef} className={cn('h-full min-h-[180px] w-full', className)} />;
}
