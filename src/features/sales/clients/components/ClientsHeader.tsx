import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientsHeaderProps {
    onCreateClick: () => void;
}

export function ClientsHeader({ onCreateClick }: ClientsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight uppercase">Gestión de Clientes</h2>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Administre la información y contacto de sus clientes habituales.</p>
            </div>
            <Button
                onClick={onCreateClick}
                className="h-9 px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2"
            >
                <Plus className="h-4 w-4" /> Nuevo Cliente
            </Button>
        </div>
    );
}
