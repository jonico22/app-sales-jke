import { CalendarRange, Sparkles } from 'lucide-react';

interface AnalyticsHeroProps {
  branchLabel: string;
  dateFrom: string;
  dateTo: string;
  granularityLabel: string;
}

export function AnalyticsHero({
  branchLabel,
  dateFrom,
  dateTo,
  granularityLabel,
}: AnalyticsHeroProps) {
  const periodLabel = `${dateFrom} al ${dateTo}`;

  return (
    <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Módulo Analytics
      </div>

      <h1 className="mt-3 text-2xl font-black leading-[1.05] tracking-tight text-foreground sm:text-3xl">
        Centro analítico comercial
      </h1>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground">
          {branchLabel}
        </span>
        <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground">
          {granularityLabel}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground">
          <CalendarRange className="h-3.5 w-3.5 text-primary" />
          {periodLabel}
        </span>
      </div>
    </section>
  );
}
