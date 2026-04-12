import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { LowStockAlertItem } from '@/services/dashboard.service';
import { getLowStockBadgeClassName, getLowStockBadgeVariant } from './dashboardFormatting';
import { LowStockProgressBar } from './LowStockProgressBar';

interface LowStockAlertsCardProps {
  count?: number;
  data: LowStockAlertItem[];
  isLoading?: boolean;
}

export function LowStockAlertsCard({
  count,
  data,
  isLoading,
}: LowStockAlertsCardProps) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Operativo
          </div>
          <h3 className="mt-3 text-lg font-bold text-foreground">Alertas de Stock Bajo</h3>
          <p className="text-sm text-muted-foreground">Lista corta de productos con atención inmediata.</p>
        </div>
        <div className="rounded-2xl bg-amber-500/10 px-4 py-2 text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">Total alertas</p>
          <p className="text-lg font-black text-foreground">{count || 0}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center rounded-[24px] border border-dashed border-border bg-muted/20 text-sm font-medium text-muted-foreground">
          No hay alertas críticas en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {data.slice(0, 6).map((item) => (
            <div key={`${item.productId}-${item.branchId}`} className="rounded-[24px] border border-border/80 bg-background/80 px-4 py-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.branchName}</p>
                </div>
                <Badge
                  variant={getLowStockBadgeVariant(item.status)}
                  className={getLowStockBadgeClassName(item.status)}
                >
                  {item.status}
                </Badge>
              </div>
              <div className="mt-4">
                <LowStockProgressBar
                  availableStock={item.availableStock}
                  minStock={item.minStock}
                  status={item.status}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
