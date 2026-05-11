import { cn } from '@/lib/utils';

interface LowStockProgressBarProps {
  availableStock: number;
  minStock: number;
  status: string;
}

function getBarColorClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === 'critical') return 'bg-rose-500';
  if (normalized === 'warning') return 'bg-amber-500';
  return 'bg-primary';
}

export function LowStockProgressBar({
  availableStock,
  minStock,
  status,
}: LowStockProgressBarProps) {
  const safeMin = Math.max(minStock, 1);
  const ratio = Math.min((availableStock / safeMin) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all', getBarColorClass(status))}
          style={{ width: `${Math.max(ratio, availableStock > 0 ? 6 : 0)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-muted-foreground">
          Disponible: <strong className="text-foreground">{availableStock}</strong>
        </span>
        <span className="text-muted-foreground">
          Mínimo: <strong className="text-foreground">{minStock}</strong>
        </span>
      </div>
    </div>
  );
}
