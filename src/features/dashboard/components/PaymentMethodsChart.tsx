import { CreditCard } from 'lucide-react';
import { ChartContainer } from '@/components/shared/charts/ChartContainer';
import { BasePieChart } from '@/components/shared/charts/BasePieChart';

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

interface PaymentMethodData {
  method: string;
  value: number;
  [key: string]: string | number;
}

interface PaymentMethodsChartProps {
  data: PaymentMethodData[];
  isLoading: boolean;
  currencySymbol: string;
}

export function PaymentMethodsChart({ data, isLoading, currencySymbol }: PaymentMethodsChartProps) {
  return (
    <ChartContainer
      title="Métodos de Pago Preferidos"
      isLoading={isLoading}
      isEmpty={data.length === 0}
      headerColor="border-amber-500"
      emptyIcon={<CreditCard className="h-6 w-6 text-muted-foreground/30 mb-2" />}
      emptyMessage="AÚN NO HAY PAGOS REGISTRADOS"
    >
      <BasePieChart
        data={data}
        dataKey="value"
        nameKey="method"
        tooltipFormatter={(value) => formatCurrency(Number(value), currencySymbol)}
      />
    </ChartContainer>
  );
}
