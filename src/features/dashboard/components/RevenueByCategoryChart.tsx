import { Shapes } from 'lucide-react';
import { ChartContainer } from '@/components/shared/charts/ChartContainer';
import { BaseProgressList } from '@/components/shared/charts/BaseProgressList';

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const formatCurrency = (value: number, symbol: string = 'S/') => {
  const formatted = CURRENCY_FORMATTER.format(value).replace(/[^0-9.,]/g, '');
  return `${symbol}${formatted}`;
};

interface CategoryRevenueData {
  category: string;
  revenue: number;
  percentage: number;
}

interface RevenueByCategoryChartProps {
  data: CategoryRevenueData[];
  isLoading: boolean;
  currencySymbol: string;
}

export function RevenueByCategoryChart({ data, isLoading, currencySymbol }: RevenueByCategoryChartProps) {
  const chartItems = data.map(cat => ({
    label: cat.category,
    value: cat.revenue,
    formattedValue: formatCurrency(cat.revenue, currencySymbol),
    percentage: cat.percentage
  }));

  return (
    <ChartContainer
      title="Ingresos por Categoría"
      isLoading={isLoading}
      isEmpty={data.length === 0}
      headerColor="border-indigo-500"
      emptyIcon={<Shapes className="h-6 w-6 text-muted-foreground/30 mb-2" />}
      emptyMessage="Sin datos de categorías"
      className="min-h-[400px]"
    >
      <BaseProgressList
        items={chartItems}
        barColor="bg-indigo-500"
      />
    </ChartContainer>
  );
}
