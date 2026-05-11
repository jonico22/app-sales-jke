import { Building2, CalendarDays, GitCompareArrows, SlidersHorizontal } from 'lucide-react';
import type { BranchOfficeSelectOption } from '@/services/branch-office.service';
import type { AnalyticsGranularity } from '@/services/analytics.service';

interface AnalyticsFiltersBarProps {
  branches: BranchOfficeSelectOption[];
  comparePrevious: boolean;
  dateFrom: string;
  dateTo: string;
  granularity: AnalyticsGranularity;
  selectedBranchId?: string;
  onBranchChange: (branchId: string) => void;
  onComparePreviousChange: (value: boolean) => void;
  onDateFromChange: (dateFrom: string) => void;
  onDateToChange: (dateTo: string) => void;
  onGranularityChange: (granularity: AnalyticsGranularity) => void;
}

export function AnalyticsFiltersBar({
  branches,
  comparePrevious,
  dateFrom,
  dateTo,
  granularity,
  selectedBranchId,
  onBranchChange,
  onComparePreviousChange,
  onDateFromChange,
  onDateToChange,
  onGranularityChange,
}: AnalyticsFiltersBarProps) {
  return (
    <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Centro de control
          </div>
          <h2 className="mt-3 text-lg font-bold text-foreground">Configura la lectura analítica</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Todos los widgets leen este mismo estado global de filtros para recalcular sus consultas.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
              Sucursal
            </span>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <select
                value={selectedBranchId || 'all'}
                onChange={(event) => onBranchChange(event.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-border bg-background pl-11 pr-10 text-sm font-semibold text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="all">Todas las sucursales</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
              Desde
            </span>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => onDateFromChange(event.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-10 text-sm font-semibold text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
              Hasta
            </span>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <input
                type="date"
                value={dateTo}
                onChange={(event) => onDateToChange(event.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-border bg-background pl-11 pr-10 text-sm font-semibold text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </label>          

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
              Granularidad
            </span>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <select
                value={granularity}
                onChange={(event) => onGranularityChange(event.target.value as AnalyticsGranularity)}
                className="h-12 w-full appearance-none rounded-2xl border border-border bg-background pl-11 pr-10 text-sm font-semibold text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="day">Día</option>
                <option value="week">Semana</option>
                <option value="month">Mes</option>
              </select>
            </div>
          </label>

          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
              Comparativa
            </span>
            <button
              type="button"
              onClick={() => onComparePreviousChange(!comparePrevious)}
              className="flex h-12 items-center justify-between rounded-2xl border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <GitCompareArrows className="h-4 w-4 text-primary" />
                <span className="truncate">{comparePrevious ? 'Comparando' : 'Sin comparar'}</span>
              </span>
              <span className="ml-2 shrink-0 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {comparePrevious ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
