import { Building2, Filter } from 'lucide-react';
import type { BranchOfficeSelectOption } from '@/services/branch-office.service';

interface DashboardFiltersBarProps {
  branches: BranchOfficeSelectOption[];
  selectedBranchId?: string;
  onBranchChange: (branchId: string) => void;
}

export function DashboardFiltersBar({
  branches,
  selectedBranchId,
  onBranchChange,
}: DashboardFiltersBarProps) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            <Filter className="h-3.5 w-3.5" />
            Filtros del Dashboard
          </div>
          <h2 className="mt-3 text-lg font-bold text-foreground">Vista operativa resumida</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cambia la sucursal para enfocar las métricas y alertas del panel.
          </p>
        </div>

        <label className="flex min-w-[240px] flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
            Sucursal
          </span>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <select
              value={selectedBranchId || 'all'}
              onChange={(event) => onBranchChange(event.target.value)}
              className="h-12 w-full appearance-none rounded-2xl border border-border bg-background pl-11 pr-4 text-sm font-semibold text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
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
      </div>
    </div>
  );
}
