import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ClientsFilterBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: 'all' | 'active' | 'inactive';
    setStatusFilter: (status: 'all' | 'active' | 'inactive') => void;
    onOpenFilterPanel: () => void;
}

export function ClientsFilterBar({
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    onOpenFilterPanel
}: ClientsFilterBarProps) {
    const getStatusLabel = () => {
        switch (statusFilter) {
            case 'active': return 'Activos';
            case 'inactive': return 'Inactivos';
            default: return 'Todos los estados';
        }
    };

    return (
        <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre o documento..."
                    className="pl-9 bg-background border-input focus-visible:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex w-full sm:w-auto gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 sm:flex-none justify-between h-10 text-[11px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted min-w-[160px] rounded-xl transition-all">
                            {getStatusLabel()}
                            <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] bg-card border-border shadow-xl rounded-xl p-1">
                        <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('all')}>
                            Todos los estados
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('active')}>
                            Solo Activos
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('inactive')}>
                            Solo Inactivos
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="outline"
                    className="flex-1 sm:flex-none h-10 text-[11px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted gap-2 rounded-xl transition-all"
                    onClick={onOpenFilterPanel}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                </Button>
            </div>
        </div>
    );
}
