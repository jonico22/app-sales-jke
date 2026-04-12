import { Package2 } from 'lucide-react';
import type { DashboardTopProduct } from '@/services/dashboard.service';
import { formatCompactCurrency } from './dashboardFormatting';

interface TopProductsListCardProps {
  currencySymbol: string;
  data: DashboardTopProduct[];
  dateRangeLabel?: string;
  isLoading?: boolean;
}

function ProductTopCard({
  currencySymbol,
  index,
  item,
  topRevenue,
}: {
  currencySymbol: string;
  index: number;
  item: DashboardTopProduct;
  topRevenue: number;
}) {
  return (
    <div className="flex h-full min-h-[170px] flex-col rounded-[24px] border border-border/80 bg-background/80 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">#{index + 1}</p>
          <p className="mt-1 text-sm font-bold leading-snug text-foreground">{item.productName}</p>
          <p className="text-xs text-muted-foreground">{item.category}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-foreground">
            {formatCompactCurrency(item.revenue, currencySymbol)}
          </p>
          <p className="text-xs text-muted-foreground">
            {topRevenue > 0 ? Math.round((item.revenue / topRevenue) * 100) : 0}% del top
          </p>
        </div>
      </div>
      <div className="mt-auto pt-4">
        <div className="h-2.5 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max(topRevenue > 0 ? (item.revenue / topRevenue) * 100 : 0, 8)}%` }}
        />
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
          <span className="text-muted-foreground">
            Vendidos: <strong className="text-foreground">{item.soldUnits}</strong>
          </span>
          <span className="text-muted-foreground">
            Stock: <strong className="text-foreground">{item.stockRemaining}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export function TopProductsListCard({
  currencySymbol,
  data,
  dateRangeLabel,
  isLoading,
}: TopProductsListCardProps) {
  const topRevenue = Math.max(...data.map((item) => item.revenue), 0);
  const topProducts = data.slice(0, 5);

  return (
    <div className="rounded-[28px] border border-border bg-card px-6 pb-6 pt-4 shadow-sm xl:col-span-2">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center rounded-[24px] border border-dashed border-border bg-muted/20 text-sm font-medium text-muted-foreground">
          Sin top productos disponibles.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex h-full min-h-[170px] flex-col rounded-[24px] border border-dashed border-border/80 bg-muted/10 px-5 py-4">
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              <Package2 className="h-3.5 w-3.5" />
              Ranking
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold leading-tight text-foreground">Top Productos</h3>
              {dateRangeLabel ? (
                <p className="mt-1 text-sm leading-tight text-muted-foreground">{dateRangeLabel}</p>
              ) : null}
            </div>
            <div className="mt-3 rounded-2xl bg-background/70 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary/80">Top visible</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{topProducts.length} productos</p>
              <p className="text-xs leading-tight text-muted-foreground">Ranking por ingresos</p>
            </div>
          </div>

          {topProducts.map((item, index) => (
            <ProductTopCard
              key={item.productId}
              currencySymbol={currencySymbol}
              index={index}
              item={item}
              topRevenue={topRevenue}
            />
          ))}
        </div>
      )}
    </div>
  );
}
