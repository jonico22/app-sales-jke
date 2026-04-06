import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface CategoriesFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusChange: (status: 'all' | 'active' | 'inactive') => void;
  onOpenFilters: () => void;
}

export function CategoriesFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onOpenFilters
}: CategoriesFilterBarProps) {
  const getStatusLabel = () => {
    switch (statusFilter) {
      case 'active': return 'Activos';
      case 'inactive': return 'Inactivos';
      default: return 'Todos los estados';
    }
  };

  return (
    <div className="bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs md:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          placeholder="Buscar categorías..."
          className="pl-9 h-10 bg-muted/30 border-border focus-visible:bg-background text-xs rounded-xl"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex w-full sm:w-auto gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 sm:flex-none justify-between h-10 text-[10px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted min-w-[140px] sm:min-w-[160px] rounded-xl transition-all">
              {getStatusLabel()}
              <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] sm:w-[180px] bg-card border-border shadow-xl rounded-xl p-1 overflow-hidden">
            <DropdownMenuItem className="text-[11px] font-bold uppercase tracking-tight py-2.5 rounded-lg cursor-pointer" onClick={() => onStatusChange('all')}>
              Todos los estados
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[11px] font-bold uppercase tracking-tight py-2.5 rounded-lg cursor-pointer text-emerald-600 dark:text-emerald-400" onClick={() => onStatusChange('active')}>
              Solo Activos
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[11px] font-bold uppercase tracking-tight py-2.5 rounded-lg cursor-pointer text-rose-600 dark:text-rose-400" onClick={() => onStatusChange('inactive')}>
              Solo Inactivos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          className="flex-1 sm:flex-none h-10 text-[10px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted gap-2 rounded-xl transition-all"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
      </div>
    </div>
  );
}
