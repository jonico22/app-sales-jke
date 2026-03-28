import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BranchOfficesHeaderProps {
    onNewBranch: () => void;
}

export function BranchOfficesHeader({ onNewBranch }: BranchOfficesHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-base font-bold text-foreground tracking-tight uppercase">Sucursales</h2>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Administra las sedes físicas de tu negocio.</p>
            </div>
            <Button
                onClick={onNewBranch}
                className="h-9 px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2"
            >
                <Plus className="h-4 w-4" /> Nueva Sucursal
            </Button>
        </div>
    );
}
