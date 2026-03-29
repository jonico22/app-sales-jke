import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type TooltipProps
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  name?: string;
  fill?: string;
  radius?: [number, number, number, number];
  barSize?: number;
}

interface BaseBarChartProps {
  data: DataPoint[];
  bars: BarConfig[];
  layout?: 'horizontal' | 'vertical';
  xAxisDataKey?: string;
  yAxisTickFormatter?: (value: any) => string;
  tooltipFormatter?: TooltipProps<ValueType, NameType>['formatter'];
  showLegend?: boolean;
  gridVertical?: boolean;
  gridHorizontal?: boolean;
}

export const BaseBarChart = memo(({
  data,
  bars,
  layout = 'horizontal',
  xAxisDataKey = 'name',
  yAxisTickFormatter,
  tooltipFormatter,
  showLegend = false,
  gridVertical = false,
  gridHorizontal = true
}: BaseBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={gridVertical}
          horizontal={gridHorizontal}
          stroke="#E5E7EB"
        />
        {layout === 'horizontal' ? (
          <>
            <XAxis
              dataKey={xAxisDataKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={yAxisTickFormatter}
            />
          </>
        ) : (
          <>
            <XAxis type="number" hide />
            <YAxis
              dataKey={xAxisDataKey}
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
              width={120}
            />
          </>
        )}
        <Tooltip
          cursor={{ fill: '#F3F4F6' }}
          contentStyle={{
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={tooltipFormatter}
        />
        {showLegend && (
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        )}
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.fill || '#3b82f6'}
            radius={bar.radius || [4, 4, 0, 0]}
            barSize={bar.barSize || 40}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
});

BaseBarChart.displayName = 'BaseBarChart';
