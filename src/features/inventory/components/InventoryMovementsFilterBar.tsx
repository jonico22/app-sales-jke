import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { type BranchOfficeSelectOption } from '@/services/branch-office.service';

interface InventoryMovementsFilterBarProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    originBranchId: string;
    onOriginBranchChange: (id: string) => void;
    destinationBranchId: string;
    onDestinationBranchChange: (id: string) => void;
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    branches: BranchOfficeSelectOption[];
}

export function InventoryMovementsFilterBar({
    searchTerm,
    onSearchTermChange,
    originBranchId,
    onOriginBranchChange,
    destinationBranchId,
    onDestinationBranchChange,
    statusFilter,
    onStatusFilterChange,
    branches
}: InventoryMovementsFilterBarProps) {
    const getBranchName = (id: string, type: 'origin' | 'destination') => {
        if (id === 'all') return type === 'origin' ? 'Todas las sedes (Origen)' : 'Todas las sedes (Destino)';
        return branches.find(b => b.id === id)?.name || (type === 'origin' ? 'Sucursal Origen' : 'Sucursal Destino');
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'all': return 'Todos los estados';
            case 'PENDING': return 'En Tránsito';
            case 'COMPLETED': return 'Recibido';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    };

    return (
        <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-2 md:gap-4 items-center">
            <div className="relative w-full md:min-w-[300px] md:max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                    placeholder="Buscar por ID o responsable..."
                    className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors rounded-xl font-medium w-full"
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap w-full md:w-auto gap-2 items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 md:flex-none justify-between h-10 text-[10px] font-black uppercase tracking-widest text-foreground border-border bg-card hover:bg-muted min-w-[140px] md:min-w-[180px] rounded-xl transition-all">
                            {getBranchName(originBranchId, 'origin')}
                            <ChevronDown className="w-3 h-3 ml-2 opacity-30" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px] bg-card border-border shadow-2xl rounded-xl p-1 animate-in fade-in zoom-in-95 duration-200">
                        <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors hover:bg-muted" onClick={() => onOriginBranchChange('all')}>Todas las sedes (Origen)</DropdownMenuItem>
                        {branches.map(branch => (
                            <DropdownMenuItem key={branch.id} className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors hover:bg-muted" onClick={() => onOriginBranchChange(branch.id)}>
                                {branch.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 md:flex-none justify-between h-10 text-[10px] font-black uppercase tracking-widest text-foreground border-border bg-card hover:bg-muted min-w-[140px] md:min-w-[180px] rounded-xl transition-all">
                            {getBranchName(destinationBranchId, 'destination')}
                            <ChevronDown className="w-3 h-3 ml-2 opacity-30" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px] bg-card border-border shadow-2xl rounded-xl p-1 animate-in fade-in zoom-in-95 duration-200">
                        <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors hover:bg-muted" onClick={() => onDestinationBranchChange('all')}>Todas las sedes (Destino)</DropdownMenuItem>
                        {branches.map(branch => (
                            <DropdownMenuItem key={branch.id} className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors hover:bg-muted" onClick={() => onDestinationBranchChange(branch.id)}>
                                {branch.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 md:flex-none justify-between h-10 text-[10px] font-black uppercase tracking-widest text-foreground border-border bg-card hover:bg-muted min-w-[130px] md:min-w-[160px] rounded-xl transition-all">
                            {getStatusLabel(statusFilter)}
                            <ChevronDown className="w-3 h-3 ml-2 opacity-30" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] bg-card border-border shadow-2xl rounded-xl p-1 animate-in fade-in zoom-in-95 duration-200">
                        <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors hover:bg-muted" onClick={() => onStatusFilterChange('all')}>Todos los estados</DropdownMenuItem>
                        <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer text-blue-500 hover:bg-blue-500/10" onClick={() => onStatusFilterChange('PENDING')}>En Tránsito</DropdownMenuItem>
                        <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer text-emerald-500 hover:bg-emerald-500/10" onClick={() => onStatusFilterChange('COMPLETED')}>Recibido</DropdownMenuItem>
                        <DropdownMenuItem className="text-[10px] py-2 font-bold uppercase tracking-wider rounded-lg cursor-pointer text-rose-500 hover:bg-rose-500/10" onClick={() => onStatusFilterChange('CANCELLED')}>Cancelado</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
