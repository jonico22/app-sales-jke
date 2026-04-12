import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MiniTrendChart, type MiniTrendDatum } from './MiniTrendChart';

interface TrendStatCardProps {
  title: string;
  value: string;
  change?: string;
  trendLabel?: string;
  data: MiniTrendDatum[];
  className?: string;
}

export function TrendStatCard({
  title,
  value,
  change,
  trendLabel,
  data,
  className,
}: TrendStatCardProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-sm transition-colors',
        className,
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{value}</h3>
            </div>
            {change ? (
              <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{change}</span>
              </div>
            ) : null}
          </div>

          {trendLabel ? (
            <p className="mt-2 text-xs font-medium text-muted-foreground">{trendLabel}</p>
          ) : null}
        </div>

        <div className="h-20 w-full overflow-hidden rounded-2xl bg-primary/[0.03] px-1 md:h-24 md:w-[220px] md:shrink-0">
          <MiniTrendChart data={data} className="translate-y-1" />
        </div>
      </div>
    </section>
  );
}
