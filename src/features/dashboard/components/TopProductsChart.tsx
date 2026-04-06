import { Star } from 'lucide-react';
import { ChartContainer } from '@/components/shared/charts/ChartContainer';
import { BaseBarChart } from '@/components/shared/charts/BaseBarChart';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface ProductData {
  name: string;
  soldUnits: number;
  stockRemaining: number;
  [key: string]: string | number;
}

interface TopProductsChartProps {
  data: ProductData[];
  isLoading: boolean;
}

export function TopProductsChart({ data, isLoading }: TopProductsChartProps) {
  return (
    <ChartContainer
      title="Productos Más Vendidos"
      isLoading={isLoading}
      isEmpty={data.length === 0}
      headerColor="border-emerald-500"
      emptyIcon={<Star className="h-6 w-6 text-muted-foreground/30 mb-2" />}
      emptyMessage="AÚN NO HAY PRODUCTOS VENDIDOS"
    >
      <BaseBarChart
        data={data}
        layout="vertical"
        showLegend
        tooltipFormatter={(value: ValueType | undefined, name: NameType | undefined) => [value || 0, name === 'soldUnits' ? 'Vendidos' : 'Stock']}
        bars={[
          {
            dataKey: 'soldUnits',
            name: 'Vendidos',
            fill: '#10b981',
            radius: [0, 4, 4, 0],
            barSize: 12
          },
          {
            dataKey: 'stockRemaining',
            name: 'Stock',
            fill: '#94a3b8',
            radius: [0, 4, 4, 0],
            barSize: 12
          }
        ]}
      />
    </ChartContainer>
  );
}
