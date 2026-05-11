import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ProductsFilterBarProps {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    statusFilter: 'all' | 'active' | 'inactive';
    onStatusFilterChange: (value: 'all' | 'active' | 'inactive') => void;
    onOpenFilters: () => void;
}

export function ProductsFilterBar({
    searchTerm,
    onSearchTermChange,
    statusFilter,
    onStatusFilterChange,
    onOpenFilters
}: ProductsFilterBarProps) {
    const getStatusLabel = () => {
        switch (statusFilter) {
            case 'active': return 'Activos';
            case 'inactive': return 'Inactivos';
            default: return 'Todos los estados';
        }
    };

    return (
        <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                    placeholder="Buscar por nombre o código..."
                    className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                />
            </div>

            <div className="flex w-full sm:w-auto gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 sm:flex-none justify-between h-10 px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground border-border bg-card hover:bg-muted min-w-[160px] rounded-xl transition-all">
                            {getStatusLabel()}
                            <ChevronDown className="h-4 w-4 ml-3 shrink-0 opacity-45" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] bg-card border-border shadow-xl rounded-xl p-1">
                        <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => onStatusFilterChange('all')}>
                            Todos los estados
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => onStatusFilterChange('active')}>
                            Solo Activos
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => onStatusFilterChange('inactive')}>
                            Solo Inactivos
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="outline"
                    className="flex-1 sm:flex-none h-10 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground border-border bg-card hover:bg-muted gap-2 rounded-xl transition-all"
                    onClick={onOpenFilters}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                </Button>
            </div>
        </div>
    );
}
