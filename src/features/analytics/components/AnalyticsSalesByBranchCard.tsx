import { Building2 } from 'lucide-react';
import type { AnalyticsSalesByBranchData } from '@/services/analytics.service';
import { AnalyticsCardState } from './AnalyticsCardState';

interface AnalyticsSalesByBranchCardProps {
  currencySymbol: string;
  data?: AnalyticsSalesByBranchData;
  error?: Error | null;
  isLoading?: boolean;
}

export function AnalyticsSalesByBranchCard({
  currencySymbol,
  data,
  error,
  isLoading,
}: AnalyticsSalesByBranchCardProps) {
  const items = data?.items || [];
  const topRevenue = Math.max(
    ...items.flatMap((item) => [item.revenue, item.previous?.revenue ?? 0]),
    0
  );

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-border bg-card px-6 pb-6 pt-4 shadow-sm">
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          <Building2 className="h-3.5 w-3.5" />
          Territorio
        </div>
        <h3 className="mt-2 text-lg font-bold leading-tight text-foreground">Ventas por sucursal</h3>
        <p className="mt-0.5 text-sm leading-tight text-muted-foreground">
          Comparativo comercial entre sedes del mismo rango.
        </p>
      </div>

      {isLoading ? (
        <AnalyticsCardState title="Cargando sucursales" description="Preparando el comparativo comercial por sede." variant="loading" />
      ) : error ? (
        <AnalyticsCardState title="No se pudo cargar el comparativo" description={error.message} variant="error" />
      ) : items.length === 0 ? (
        <AnalyticsCardState title="Sin sucursales con ventas" description="No hay resultados para el rango o sucursal seleccionados." variant="empty" />
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.branchId} className="rounded-2xl border border-border/80 bg-background/80 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{item.branch}</p>
                  <p className="text-xs text-muted-foreground">{item.orders} pedidos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-foreground">{currencySymbol}{item.revenue.toLocaleString()}</p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {item.comparison?.revenue?.deltaPct !== undefined && item.comparison?.revenue?.deltaPct !== null
                      ? `Var. ${item.comparison.revenue.deltaPct.toFixed(1)}%`
                      : 'Var. --'}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>Actual</span>
                    <span>{currencySymbol}{item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${topRevenue > 0 ? Math.max((item.revenue / topRevenue) * 100, 4) : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>Anterior</span>
                    <span>{currencySymbol}{(item.previous?.revenue ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-slate-400/70"
                      style={{
                        width: `${topRevenue > 0 ? Math.max(((item.previous?.revenue ?? 0) / topRevenue) * 100, 4) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
