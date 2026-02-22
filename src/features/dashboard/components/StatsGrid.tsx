import { type ReactNode } from 'react';
import { Monitor, AlertTriangle, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

interface StatCardProps {
  icon: ReactNode;
  iconBgClass: string;
  badge: string;
  badgeColorClass: string;
  title: string;
  value: string;
  subtitle: string;
  subtitleColorClass?: string;
  loading?: boolean;
}

function StatCard({
  icon,
  iconBgClass,
  badge,
  badgeColorClass,
  title,
  value,
  subtitle,
  subtitleColorClass = 'text-slate-400',
  loading = false,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-h-[160px] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${iconBgClass}`}>
          {icon}
        </div>
        {!loading && (
          <span className={`text-[10px] font-bold uppercase tracking-wider ${badgeColorClass}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
        {loading ? (
          <div className="h-9 flex items-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
          </div>
        ) : (
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        )}
        <p className={`text-xs mt-1 ${subtitleColorClass}`}>
          {loading ? 'Cargando...' : subtitle}
        </p>
      </div>
    </div>
  );
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value);
};

export function StatsGrid() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
        Error al cargar las estadísticas del dashboard.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Valor Total Stock */}
      <StatCard
        icon={<Monitor className="h-5 w-5 text-cyan-600" />}
        iconBgClass="bg-cyan-50"
        badge="Global"
        badgeColorClass="text-slate-400"
        title="Valor Total Stock"
        value={formatCurrency(stats?.totalStockValue || 0)}
        subtitle={stats?.totalStockValue ? "Valor estimado del inventario" : "Esperando datos..."}
        loading={isLoading}
      />

      {/* Bajo Stock */}
      <StatCard
        icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        iconBgClass="bg-red-50"
        badge="Alerta"
        badgeColorClass="text-red-500"
        title="Bajo Stock"
        value={`${stats?.lowStockItems || 0} Items`}
        subtitle={stats?.lowStockItems ? "Productos requieren atención" : "Todo al día"}
        subtitleColorClass={stats?.lowStockItems ? "text-red-500" : "text-emerald-500"}
        loading={isLoading}
      />

      {/* Ventas Netas */}
      <StatCard
        icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
        iconBgClass="bg-violet-50"
        badge="Este Mes"
        badgeColorClass="text-slate-400"
        title="Ventas Netas"
        value={formatCurrency(stats?.netSales || 0)}
        subtitle={stats?.netSales ? "Ingresos totales acumulados" : "Sin transacciones"}
        loading={isLoading}
      />

      {/* Productos Nuevos */}
      <StatCard
        icon={<Sparkles className="h-5 w-5 text-fuchsia-500" />}
        iconBgClass="bg-fuchsia-50"
        badge="Nuevos"
        badgeColorClass="text-slate-400"
        title="Productos Nuevos"
        value={`${stats?.newProducts || 0} Items`}
        subtitle={stats?.newProducts ? "Agregados recientemente" : "Sin novedades"}
        loading={isLoading}
      />
    </div>
  );
}
