import { Activity, ArrowRight, Boxes } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MiniTrendChart, type MiniTrendDatum } from '@/components/shared/charts/MiniTrendChart';
import { cn } from '@/lib/utils';

interface AnalyticsPanelProps {
  badge: string;
  title: string;
  description: string;
  endpoint?: string;
  highlights?: Array<{ label: string; value: string }>;
  isLoading?: boolean;
  previewItems?: string[];
  trendItems?: Array<{
    color?: string;
    data: MiniTrendDatum[];
    label: string;
    value: string;
  }>;
  tone?: 'primary' | 'sky' | 'emerald' | 'amber' | 'violet' | 'rose' | 'slate';
}

const toneStyles: Record<NonNullable<AnalyticsPanelProps['tone']>, string> = {
  primary: 'bg-primary/10 text-primary border-primary/15',
  sky: 'bg-sky-500/10 text-sky-600 border-sky-500/15',
  emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/15',
  violet: 'bg-violet-500/10 text-violet-600 border-violet-500/15',
  rose: 'bg-rose-500/10 text-rose-600 border-rose-500/15',
  slate: 'bg-slate-500/10 text-slate-600 border-slate-500/15',
};

const toneIcons: Record<NonNullable<AnalyticsPanelProps['tone']>, LucideIcon> = {
  primary: Activity,
  sky: ArrowRight,
  emerald: Activity,
  amber: Boxes,
  violet: Activity,
  rose: ArrowRight,
  slate: Boxes,
};

export function AnalyticsPanel({
  badge,
  title,
  description,
  endpoint,
  highlights = [],
  isLoading = false,
  previewItems = [],
  trendItems = [],
  tone = 'primary',
}: AnalyticsPanelProps) {
  const Icon = toneIcons[tone];
  const normalizeTrendData = (data: MiniTrendDatum[]) => {
    if (data.length === 0) return [];
    if (data.length === 1) {
      return [
        { label: `${data[0].label} (inicio)`, value: data[0].value },
        { label: `${data[0].label} (fin)`, value: data[0].value },
      ];
    }
    return data;
  };

  return (
    <section className="flex h-full flex-col rounded-[28px] border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
              toneStyles[tone]
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {badge}
          </div>
          <h3 className="mt-4 text-xl font-black tracking-tight text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="rounded-[20px] border border-border/70 bg-background/70 p-4">
          {endpoint ? (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                Endpoint activo
              </p>
              <p className="mt-2 font-mono text-sm text-foreground">{endpoint}</p>
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-16 animate-pulse rounded-2xl bg-muted" />
              <div className="h-16 animate-pulse rounded-2xl bg-muted" />
            </div>
          ) : null}

          {!isLoading && highlights.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={`${title}-${item.label}`} className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-black tracking-tight text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {!isLoading && trendItems.length > 0 ? (
          <div className="grid gap-3">
            {trendItems.map((item) => (
              <div
                key={`${title}-${item.label}`}
                className="grid gap-3 rounded-[20px] border border-border/80 bg-card/90 p-4 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[28px] font-black leading-none tracking-tight text-foreground">
                    {item.value}
                  </p>
                </div>
                <div className="h-16 overflow-hidden rounded-2xl border border-border/60 bg-muted/[0.24] px-1">
                  <MiniTrendChart
                    className="translate-y-0.5"
                    color={item.color}
                    data={normalizeTrendData(item.data)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && previewItems.length > 0 ? (
          <div className="rounded-[20px] border border-border/70 bg-background/70 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              Vista rápida
            </p>
            <div className="mt-3 grid gap-2">
              {previewItems.map((item) => (
                <div
                  key={`${title}-${item}`}
                  className="rounded-xl border border-border/60 bg-card/90 px-3 py-2 text-sm font-medium text-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!isLoading && highlights.length === 0 && previewItems.length === 0 && trendItems.length === 0 ? (
          <div className="rounded-2xl bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
            Sin datos disponibles para el rango actual.
          </div>
        ) : null}
      </div>
    </section>
  );
}
