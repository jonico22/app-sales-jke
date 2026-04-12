import { Activity, Boxes, Package } from 'lucide-react';
import { formatCompactCurrency, formatCompactNumber } from './dashboardFormatting';

interface CatalogSummaryGridProps {
  currencySymbol: string;
  isLoading?: boolean;
  summary?: {
    activeProducts: number;
    lowStockItems: number;
    newProductsThisMonth: number;
    totalStockValue: number;
  };
}

interface SummaryCardProps {
  accentClassName?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  subtitle: string;
  title: string;
  value: string;
}

function SummaryCard({
  accentClassName = 'bg-muted text-foreground',
  icon,
  isLoading,
  subtitle,
  title,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
          ) : (
            <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClassName}`}>
          {icon}
        </div>
      </div>
      <p className="mt-5 text-xs font-medium text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function CatalogSummaryGrid({
  currencySymbol,
  isLoading,
  summary,
}: CatalogSummaryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Valor de Stock"
        value={formatCompactCurrency(summary?.totalStockValue || 0, currencySymbol)}
        subtitle="Capital actual en inventario"
        icon={<Boxes className="h-5 w-5" />}
        accentClassName="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
        isLoading={isLoading}
      />
      <SummaryCard
        title="Low Stock Acumulado"
        value={formatCompactNumber(summary?.lowStockItems || 0)}
        subtitle="Productos por debajo del mínimo"
        icon={<Activity className="h-5 w-5" />}
        accentClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        isLoading={isLoading}
      />
      <SummaryCard
        title="Nuevos Productos"
        value={formatCompactNumber(summary?.newProductsThisMonth || 0)}
        subtitle="Agregados este mes"
        icon={<Package className="h-5 w-5" />}
        accentClassName="bg-primary/10 text-primary"
        isLoading={isLoading}
      />
      <SummaryCard
        title="Productos Activos"
        value={formatCompactNumber(summary?.activeProducts || 0)}
        subtitle="Catálogo activo disponible"
        icon={<Boxes className="h-5 w-5" />}
        accentClassName="bg-muted text-foreground"
        isLoading={isLoading}
      />
    </div>
  );
}
