import { useQuery } from '@tanstack/react-query';
import {
  Shapes,
  Star,
  MoreVertical,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { StatsGrid } from './components/StatsGrid';
import { BusinessHeader } from './components/BusinessHeader';
import { dashboardService } from '@/services/dashboard.service';
import { useSocietyStore } from '@/store/society.store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Rule js-cache-function-results (Priority 2)
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

export default function DashboardPage() {
  const society = useSocietyStore(state => state.society);
  const currencySymbol = society?.mainCurrency?.symbol || 'S/';
  const {
    data: salesPerformance = [],
    isLoading: isLoadingSales
  } = useQuery({
    queryKey: ['salesPerformance'],
    queryFn: () => dashboardService.getSalesPerformance().catch(() => [])
  });

  const {
    data: revenueByCategory = [],
    isLoading: isLoadingRevenue
  } = useQuery({
    queryKey: ['revenueByCategory'],
    queryFn: () => dashboardService.getRevenueByCategory().catch(() => [])
  });

  const {
    data: topProducts = [],
    isLoading: isLoadingProducts
  } = useQuery({
    queryKey: ['topProducts'],
    queryFn: () => dashboardService.getTopProducts().catch(() => [])
  });

  const {
    data: paymentMethods = [],
    isLoading: isLoadingPayments
  } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => dashboardService.getPaymentMethods().catch(() => [])
  });

  return (
    <div className="space-y-6">
      {/* 0. Business Header */}
      <BusinessHeader />

      {/* 1. Stats Grid */}
      <StatsGrid />

      {/* 3. Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm col-span-1 lg:col-span-2 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-3 h-6">
              <span className="font-bold text-foreground uppercase tracking-wide text-xs">Rendimiento de Ventas</span>
            </div>
          </div>
          <div className="h-72 w-full min-w-0 min-h-[250px] relative">
            {isLoadingSales ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : salesPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesPerformance} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `${currencySymbol}${value}`} />
                  <Tooltip
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-border rounded-xl bg-muted/20">
                <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Sin datos de ventas</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-3 h-6">
              <span className="font-bold text-foreground uppercase tracking-wide text-xs">Ingresos por Categoría</span>
            </div>
          </div>
          <div className="space-y-4">
            {isLoadingRevenue ? (
              <div className="w-full h-40 flex items-center justify-center text-muted-foreground"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : revenueByCategory.length > 0 ? (
              revenueByCategory.map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-foreground">{cat.category}</span>
                    <span className="text-foreground">{formatCurrency(cat.revenue, currencySymbol)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-indigo-500 h-3 rounded-full"
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground font-medium">{cat.percentage.toFixed(2)}%</div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 border border-dashed border-border rounded-xl bg-muted/10">
                <Shapes className="h-6 w-6 text-muted-foreground/30 mb-2" />
                <p className="text-[10px] text-muted-foreground">Sin datos de categorías</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Cards Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col border-l-4 border-emerald-500 pl-3">
              <span className="font-bold text-foreground uppercase tracking-wide text-xs">Productos Más Vendidos</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreVertical className="h-4 w-4" /></button>
          </div>

          <div className="space-y-3">
            {isLoadingProducts ? (
              <div className="w-full h-48 flex items-center justify-center text-muted-foreground"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div></div>
            ) : topProducts.length > 0 ? (
              <div className="h-64 w-full min-w-0 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} width={120} />
                    <Tooltip
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any, name: any) => [value, name === 'soldUnits' ? 'Vendidos' : 'Stock']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="soldUnits" name="Vendidos" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                    <Bar dataKey="stockRemaining" name="Stock" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-xl bg-muted/10">
                <Star className="h-6 w-6 text-muted-foreground/30 mb-2" />
                <p className="text-[11px] font-bold text-muted-foreground text-center max-w-[200px] mb-2">
                  AÚN NO HAY PRODUCTOS VENDIDOS
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col border-l-4 border-amber-500 pl-3">
              <span className="font-bold text-foreground uppercase tracking-wide text-xs">Métodos de Pago Preferidos</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreVertical className="h-4 w-4" /></button>
          </div>

          <div className="h-64 w-full flex items-center justify-center min-w-0 min-h-[200px] relative">
            {isLoadingPayments ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div></div>
            ) : paymentMethods.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="method"
                  >
                    {paymentMethods.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value), currencySymbol)} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full border border-dashed border-border rounded-xl bg-muted/10">
                <CreditCard className="h-6 w-6 text-muted-foreground/30 mb-2" />
                <p className="text-[11px] font-bold text-muted-foreground text-center mb-2">
                  AÚN NO HAY PAGOS REGISTRADOS
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
