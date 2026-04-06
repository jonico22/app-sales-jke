import { Button } from '@/components/ui/button';
import { Plus, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function InventoryMovementsHeader() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
            <div>
                <h1 className="text-sm md:text-lg font-bold text-foreground tracking-tight uppercase">Movimientos entre Sucursales</h1>
                <p className="text-muted-foreground text-[10px] md:text-sm mt-0.5 md:mt-1 flex items-center gap-2">
                    Gestione y rastree traslados internos de mercancía.
                </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                    onClick={() => navigate('/inventory/movements/bulk')}
                    variant="outline"
                    className="flex-1 md:flex-none h-8 md:h-9 px-3 md:px-4 text-[9px] md:text-[11px] font-extrabold uppercase tracking-wider text-primary border-border bg-card hover:bg-muted gap-1.5 md:gap-2 rounded-xl transition-all"
                >
                    <ArrowRightLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    Traslado en Bloque
                </Button>
                <Button
                    onClick={() => navigate('/inventory/movements/new')}
                    className="flex-1 md:flex-none h-8 md:h-9 px-3 md:px-4 text-[9px] md:text-[11px] font-extrabold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 md:gap-2 shadow-lg shadow-primary/20 rounded-xl transition-all"
                >
                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    Nuevo Traslado
                </Button>
            </div>
        </div>
    );
}
