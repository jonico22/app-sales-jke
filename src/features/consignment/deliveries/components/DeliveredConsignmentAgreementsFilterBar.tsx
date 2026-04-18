import { ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DeliveredConsignmentAgreementsFilterBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  branchFilter: string;
  onBranchFilterChange: (value: string) => void;
  branches: Array<{ id: string; name: string }>;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
];

export function DeliveredConsignmentAgreementsFilterBar({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  branchFilter,
  onBranchFilterChange,
  branches,
}: DeliveredConsignmentAgreementsFilterBarProps) {
  const activeStatusLabel = STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label || 'Todos los estados';
  const activeBranchLabel = branchFilter === 'all'
    ? 'Todas las sucursales'
    : branches.find((branch) => branch.id === branchFilter)?.name || 'Sucursal';

  return (
    <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
      <div className="relative w-full xl:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          placeholder="Buscar por entrega, acuerdo o producto..."
          className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>

      <div className="flex w-full xl:w-auto gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 xl:flex-none justify-between h-10 px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground border-border bg-card hover:bg-muted min-w-[180px] rounded-xl transition-all">
              {activeStatusLabel}
              <ChevronDown className="h-4 w-4 ml-3 shrink-0 opacity-45" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] bg-card border-border shadow-xl rounded-xl p-1">
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="text-[11px] font-medium py-2 rounded-lg cursor-pointer"
                onClick={() => onStatusFilterChange(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 xl:flex-none justify-between h-10 px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground border-border bg-card hover:bg-muted min-w-[210px] rounded-xl transition-all">
              <span className="truncate">{activeBranchLabel}</span>
              <ChevronDown className="h-4 w-4 ml-3 shrink-0 opacity-45" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[250px] bg-card border-border shadow-xl rounded-xl p-1">
            <DropdownMenuItem
              className="text-[11px] font-medium py-2 rounded-lg cursor-pointer"
              onClick={() => onBranchFilterChange('all')}
            >
              Todas las sucursales
            </DropdownMenuItem>
            {branches.map((branch) => (
              <DropdownMenuItem
                key={branch.id}
                className="text-[11px] font-medium py-2 rounded-lg cursor-pointer"
                onClick={() => onBranchFilterChange(branch.id)}
              >
                {branch.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
