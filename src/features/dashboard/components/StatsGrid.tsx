import { type ReactNode } from 'react';
import {
  Monitor,
  AlertTriangle,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSocietyStore } from '@/store/society.store';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // percentage
  icon: ReactNode;
  variant?: 'primary' | 'default';
  iconBgClass?: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  iconBgClass,
  loading = false,
}: StatCardProps) {
  const isPrimary = variant === 'primary';
  const isPositive = trend !== undefined && trend >= 0;

  const baseClasses = isPrimary
    ? "bg-blue-500 text-white border-0 shadow-md"
    : "bg-card text-foreground border border-border shadow-sm";

  const defaultIconBg = isPrimary
    ? "bg-white text-blue-500"
    : iconBgClass || "bg-muted text-foreground";

  return (
    <div className={`rounded-[24px] p-6 min-h-[140px] flex flex-col relative overflow-hidden ${baseClasses}`}>
      <div className="flex items-start justify-between relative z-10 w-full gap-4">
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          {/* Title */}
          <p className={`text-[13.5px] font-medium leading-none ${isPrimary ? 'text-blue-100' : 'text-muted-foreground'}`}>
            {title}
          </p>

          <div className="relative w-full">
            {loading ? (
              <div className="h-10 flex items-center">
                <div className={`h-8 w-32 animate-pulse rounded-lg ${isPrimary ? 'bg-blue-400/50' : 'bg-muted'}`} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3
                  className={`font-bold tracking-tight leading-none truncate min-w-0 max-w-full
                    ${String(value).length > 12 ? 'text-xl' : String(value).length > 8 ? 'text-2xl' : 'text-3xl'}`}
                  title={String(value)}
                >
                  {value}
                </h3>
                {trend !== undefined && (
                  <div className={`flex w-fit shrink-0 items-center justify-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide
                     ${isPrimary
                      ? 'bg-blue-400/50 text-white'
                      : isPositive
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {isPositive ? <ArrowUp className="h-2.5 w-2.5" strokeWidth={3} /> : <ArrowDown className="h-2.5 w-2.5" strokeWidth={3} />}
                    {Math.abs(trend)}%
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Icon */}
        <div className={`shrink-0 rounded-full flex items-center justify-center h-[40px] w-[40px] shadow-sm ${defaultIconBg}`}>
          {loading ? (
            <div className={`h-full w-full rounded-full animate-pulse ${isPrimary ? 'bg-blue-400/50' : 'bg-muted'}`} />
          ) : (
            icon
          )}
        </div>
      </div>

      {/* Subtitle at the bottom */}
      <div className="mt-auto pt-4 relative z-10 h-6">
        {loading ? (
          <div className={`h-3 w-24 animate-pulse rounded ${isPrimary ? 'bg-blue-400/50' : 'bg-muted'}`} />
        ) : subtitle ? (
          <p className={`text-[12px] font-medium ${isPrimary ? 'text-blue-200' : 'text-muted-foreground'}`}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function StatsGrid() {
  const { data: stats, isLoading, isError } = useDashboardStats();
  const { society } = useSocietyStore();
  const currencySymbol = society?.mainCurrency?.symbol || 'S/';

  if (isError) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium">
        Error al cargar las estadísticas del dashboard.
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* 1. Ventas del mes */}
      <StatCard
        variant="primary"
        title="Ventas del Mes"
        value={formatCurrency(stats?.salesThisMonth || 0)}
        subtitle="Total vendido este mes"
        trend={4.9} /* Placeholder to match visual */
        icon={<ShoppingCart className="h-[22px] w-[22px]" />}
        loading={isLoading}
      />

      {/* 2. Ventas de la semana */}
      <StatCard
        title="Ventas de la Semana"
        value={formatCurrency(stats?.salesThisWeek || 0)}
        subtitle="Total vendido esta semana"
        trend={7.5} /* Placeholder to match visual */
        iconBgClass="bg-[#24242B] text-white"
        icon={<Monitor className="h-[22px] w-[22px]" />}
        loading={isLoading}
      />

      {/* 3. Pedidos completados del mes */}
      <StatCard
        title="Pedidos del Mes"
        value={stats?.completedOrdersThisMonth || 0}
        subtitle="Pedidos completados este mes"
        trend={-6.0} /* Placeholder to match visual */
        iconBgClass="bg-blue-500 text-white"
        icon={<AlertTriangle className="h-[22px] w-[22px]" />}
        loading={isLoading}
      />

      {/* 4. Ticket promedio del mes */}
      <StatCard
        title="Ticket Promedio"
        value={formatCurrency(stats?.averageTicketThisMonth || 0)}
        subtitle="Promedio por venta del mes"
        iconBgClass="bg-blue-500 text-white"
        icon={<Sparkles className="h-[22px] w-[22px]" />}
        loading={isLoading}
      />
    </div>
  );
}
