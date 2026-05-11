import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type OutgoingConsignmentAgreementStatus } from '@/services/outgoing-consignment-agreement.service';

interface OutgoingConsignmentAgreementsFilterBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  statusFilter: 'all' | OutgoingConsignmentAgreementStatus;
  onStatusFilterChange: (value: 'all' | OutgoingConsignmentAgreementStatus) => void;
  branchFilter: string;
  onBranchFilterChange: (value: string) => void;
  branches: Array<{ id: string; name: string }>;
}

const STATUS_LABELS: Record<'all' | OutgoingConsignmentAgreementStatus, string> = {
  all: 'Todos los estados',
  ACTIVE: 'Activos',
  PENDING: 'Pendientes',
  EXPIRED: 'Expirados',
  TERMINATED: 'Terminados',
};

export function OutgoingConsignmentAgreementsFilterBar({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  branchFilter,
  onBranchFilterChange,
  branches,
}: OutgoingConsignmentAgreementsFilterBarProps) {
  const activeBranchLabel = branchFilter === 'all'
    ? 'Todas las sucursales'
    : branches.find((branch) => branch.id === branchFilter)?.name || 'Sucursal';

  return (
    <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
      <div className="relative w-full xl:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          placeholder="Buscar por código, consignatario o notas..."
          className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>

      <div className="flex w-full xl:w-auto gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 xl:flex-none justify-between h-10 px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground border-border bg-card hover:bg-muted min-w-[180px] rounded-xl transition-all">
              {STATUS_LABELS[statusFilter]}
              <ChevronDown className="h-4 w-4 ml-3 shrink-0 opacity-45" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] bg-card border-border shadow-xl rounded-xl p-1">
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                className="text-[11px] font-medium py-2 rounded-lg cursor-pointer"
                onClick={() => onStatusFilterChange(value as 'all' | OutgoingConsignmentAgreementStatus)}
              >
                {label}
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
