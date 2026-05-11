import { renderWithRouter, screen } from '@/tests/test-utils';
import { vi, describe, it, expect } from 'vitest';
import AnalyticsPage from './AnalyticsPage';

vi.mock('@/components/shared/charts/MiniTrendChart', () => ({
  MiniTrendChart: () => <div aria-label="Mini trend chart" />,
}));

vi.mock('./components/AnalyticsSalesTrendCard', () => ({
  AnalyticsSalesTrendCard: () => <div>Tendencia de ventas</div>,
}));

vi.mock('./components/AnalyticsCashFlowTrendCard', () => ({
  AnalyticsCashFlowTrendCard: () => <div>Flujo de caja</div>,
}));

vi.mock('./components/AnalyticsPaymentsDistributionCard', () => ({
  AnalyticsPaymentsDistributionCard: () => <div>Distribución de pagos</div>,
}));

vi.mock('./components/AnalyticsSalesByCategoryCard', () => ({
  AnalyticsSalesByCategoryCard: () => <div>Ventas por categoría</div>,
}));

vi.mock('./components/AnalyticsSalesByBranchCard', () => ({
  AnalyticsSalesByBranchCard: () => <div>Ventas por sucursal</div>,
}));

vi.mock('./components/AnalyticsTopProductsCard', () => ({
  AnalyticsTopProductsCard: () => <div>Top productos</div>,
}));

vi.mock('./components/AnalyticsLowStockCard', () => ({
  AnalyticsLowStockCard: () => <div>Alertas de bajo stock</div>,
}));

vi.mock('@/hooks/useBranches', () => ({
  useBranches: () => ({
    data: [
      { id: 'branch-1', name: 'Sucursal Centro' },
      { id: 'branch-2', name: 'Sucursal Norte' },
    ],
  }),
}));

vi.mock('@/store/society.store', () => ({
  useSocietyStore: (selector: (state: {
    society: {
      code: string;
      id: string;
      name: string;
      mainCurrency: { code: string; symbol: string };
    };
  }) => unknown) =>
    selector({
      society: {
        code: 'JKE',
        id: 'soc-1',
        name: 'JKE Demo',
        mainCurrency: { code: 'PEN', symbol: 'S/' },
      },
    }),
}));

vi.mock('@/hooks/useAnalytics', () => ({
  useAnalyticsSummary: () => ({
    data: {
      range: {
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
        granularity: 'day',
      },
      totals: {
        sales: 1200,
        expenses: 300,
        grossProfitEstimate: 900,
        orders: 18,
        averageTicket: 66.67,
        unitsSold: 42,
      },
      comparison: {
        salesPct: 12.5,
        ordersPct: -5,
        averageTicketPct: 0,
      },
      comparisonByMetric: {
        sales: { current: 1200, previous: 1000, delta: 200, deltaPct: 20 },
        orders: { current: 18, previous: 20, delta: -2, deltaPct: -10 },
        averageTicket: { current: 66.67, previous: 50, delta: 16.67, deltaPct: 33.34 },
      },
    },
    isLoading: false,
  }),
  useAnalyticsSalesTrend: () => ({
    data: {
      range: {
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
        granularity: 'week',
      },
      series: [{ label: '2026-04-07', sales: 1200, orders: 18, averageTicket: 66.67 }],
      previousPeriod: [{ label: '2026-03-10', sales: 900 }],
      previousPeriodAligned: [{ label: '2026-04-07', sourceLabel: '2026-03-10', sales: 900 }],
    },
    isLoading: false,
    error: null,
  }),
  useAnalyticsCashFlowTrend: () => ({
    data: {
      range: {
        current: { dateFrom: '2026-04-01', dateTo: '2026-04-30', granularity: 'week' },
        previous: { dateFrom: '2026-03-01', dateTo: '2026-03-31', granularity: 'week' },
      },
      series: [{ label: 'Semana 1', income: 1200, expense: 300, net: 900 }],
      previousPeriod: [{ label: 'Semana previa 1', income: 1000, expense: 250, net: 750 }],
      previousPeriodAligned: [{ label: 'Semana 1', sourceLabel: 'Semana previa 1', income: 1000, expense: 250, net: 750 }],
    },
    isLoading: false,
  }),
  useAnalyticsSalesByCategory: () => ({
    data: {
      range: { dateFrom: '2026-04-01', dateTo: '2026-04-30' },
      items: [{ categoryId: 'cat-1', category: 'Accesorios', revenue: 700, unitsSold: 10, percentage: 58 }],
    },
    isLoading: false,
  }),
  useAnalyticsSalesByBranch: () => ({
    data: {
      range: { dateFrom: '2026-04-01', dateTo: '2026-04-30' },
      items: [{ branchId: 'branch-1', branch: 'Sucursal Centro', revenue: 1200, orders: 18, averageTicket: 66.67 }],
    },
    isLoading: false,
  }),
  useAnalyticsPaymentsDistribution: () => ({
    data: {
      range: { dateFrom: '2026-04-01', dateTo: '2026-04-30' },
      items: [{ method: 'Yape', amount: 500, percentage: 40, transactions: 8 }],
    },
    isLoading: false,
  }),
  useAnalyticsTopProducts: () => ({
    data: {
      range: { dateFrom: '2026-04-01', dateTo: '2026-04-30' },
      items: [{ productId: 'prod-1', productName: 'Producto A', category: 'Accesorios', soldUnits: 8, revenue: 900, stockRemaining: 12 }],
    },
    isLoading: false,
  }),
  useAnalyticsLowStock: () => ({
    data: {
      items: [{ productId: 'prod-1', productName: 'Producto A', category: 'Accesorios', branchId: 'branch-1', branchName: 'Sucursal Centro', availableStock: 2, physicalStock: 2, minStock: 5, gap: 3 }],
    },
    isLoading: false,
  }),
  useAnalyticsLowStockTrend: () => ({
    data: {
      range: {
        current: { dateFrom: '2026-04-01', dateTo: '2026-04-30', granularity: 'month' },
        previous: { dateFrom: '2026-03-01', dateTo: '2026-03-31', granularity: 'month' },
      },
      series: [{ label: '2026-04', lowStockCount: 12, criticalCount: 4 }],
      previousPeriod: [{ label: '2026-03', lowStockCount: 10, criticalCount: 3 }],
      previousPeriodAligned: [{ label: '2026-04', sourceLabel: '2026-03', lowStockCount: 10, criticalCount: 3 }],
    },
    isLoading: false,
    error: null,
  }),
}));

describe('AnalyticsPage', () => {
  it('renders analytics shell with global filters and report panels', () => {
    renderWithRouter(<AnalyticsPage />);

    expect(screen.getByText('Centro analítico comercial')).toBeInTheDocument();
    expect(screen.getByText('Configura la lectura analítica')).toBeInTheDocument();
    expect(screen.getByText('Granularidad')).toBeInTheDocument();
    expect(screen.getAllByText('Ventas').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pedidos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ticket promedio').length).toBeGreaterThan(0);
    expect(screen.getByText('Tendencia de ventas')).toBeInTheDocument();
    expect(screen.getByText('Flujo de caja')).toBeInTheDocument();
    expect(screen.getByText('Distribución de pagos')).toBeInTheDocument();
    expect(screen.getByText('Ventas por categoría')).toBeInTheDocument();
    expect(screen.getByText('Ventas por sucursal')).toBeInTheDocument();
    expect(screen.getByText('Top productos')).toBeInTheDocument();
    expect(screen.getByText('Alertas de bajo stock')).toBeInTheDocument();
  });
});
