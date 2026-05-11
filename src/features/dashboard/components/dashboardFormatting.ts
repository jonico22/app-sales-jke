import { format, parseISO } from 'date-fns';

export type DashboardGranularity = 'day' | 'week' | 'month';

export function formatCurrency(value: number, currencySymbol: string) {
  return `${currencySymbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCompactCurrency(value: number, currencySymbol: string) {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    return `${currencySymbol}${(value / 1_000_000).toFixed(1)}M`;
  }

  if (absValue >= 1_000) {
    return `${currencySymbol}${(value / 1_000).toFixed(1)}K`;
  }

  return formatCurrency(value, currencySymbol);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('es-PE', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

export function getGranularityCopy(granularity: DashboardGranularity) {
  switch (granularity) {
    case 'day':
      return {
        label: 'Hoy',
        longLabel: 'del Día',
        periodLabel: 'de hoy',
        salesTitle: 'Ventas Hoy',
        ordersTitle: 'Órdenes Hoy',
        ticketTitle: 'Ticket Promedio Hoy',
      };
    case 'week':
      return {
        label: 'Semana',
        longLabel: 'de la Semana',
        periodLabel: 'de la semana',
        salesTitle: 'Ventas de la Semana',
        ordersTitle: 'Órdenes de la Semana',
        ticketTitle: 'Ticket Promedio Semanal',
      };
    default:
      return {
        label: 'Mes',
        longLabel: 'del Mes',
        periodLabel: 'del mes',
        salesTitle: 'Ventas del Mes',
        ordersTitle: 'Órdenes del Mes',
        ticketTitle: 'Ticket Promedio Mensual',
      };
  }
}

export function formatTrendAxisLabel(label: string, granularity: DashboardGranularity) {
  try {
    const date = parseISO(label);

    if (granularity === 'month') return format(date, 'dd MMM');
    if (granularity === 'week') return format(date, 'dd MMM');
    return format(date, 'dd MMM');
  } catch {
    return label;
  }
}

export function formatDashboardDateRange(labels: string[]) {
  if (labels.length === 0) return '';

  try {
    const sorted = [...labels]
      .map((label) => parseISO(label))
      .sort((a, b) => a.getTime() - b.getTime());

    const start = sorted[0];
    const end = sorted[sorted.length - 1];

    if (start.getTime() === end.getTime()) {
      return format(start, 'dd MMM yyyy');
    }

    if (start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`;
    }

    return `${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')}`;
  } catch {
    return '';
  }
}

export function formatMethodLabel(value: string) {
  const map: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    YAPE: 'Yape',
    PLIN: 'Plin',
  };

  return map[value] || value;
}

export function getLowStockBadgeVariant(status: string): 'warning' | 'destructive' | 'outline' {
  if (status.toLowerCase() === 'critical') return 'destructive';
  if (status.toLowerCase() === 'warning') return 'warning';
  return 'outline';
}

export function getLowStockBadgeClassName(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'critical') {
    return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
  }

  if (normalized === 'warning') {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
  }

  return '';
}
