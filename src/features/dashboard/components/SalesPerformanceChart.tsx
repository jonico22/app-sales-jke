import { TrendingUp } from 'lucide-react';
import { ChartContainer } from '@/components/shared/charts/ChartContainer';
import { BaseBarChart } from '@/components/shared/charts/BaseBarChart';

interface SalesPerformanceChartProps {
  data: any[];
  isLoading: boolean;
  currencySymbol: string;
}

export function SalesPerformanceChart({ data, isLoading, currencySymbol }: SalesPerformanceChartProps) {
  return (
    <ChartContainer
      title="Rendimiento de Ventas"
      isLoading={isLoading}
      isEmpty={data.length === 0}
      headerColor="border-primary"
      className="col-span-1 lg:col-span-2"
      emptyIcon={<TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-2" />}
      emptyMessage="Sin datos de ventas"
    >
      <BaseBarChart
        data={data}
        yAxisTickFormatter={(value) => `${currencySymbol}${value}`}
        bars={[
          {
            dataKey: 'total',
            fill: '#3b82f6',
            radius: [4, 4, 0, 0],
            barSize: 40
          }
        ]}
      />
    </ChartContainer>
  );
}
