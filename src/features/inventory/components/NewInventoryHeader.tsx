import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NewInventoryHeader() {
    return (
        <div className="flex items-start gap-4 mb-2">
            <Link to="/inventory">
                <Button variant="outline" className="h-9 w-9 p-0 flex items-center justify-center border-border bg-card shadow-sm hover:bg-muted transition-all active:scale-90 rounded-lg shrink-0">
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </Button>
            </Link>
            <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight uppercase">Alta de Inventario</h2>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Seleccione el método de ingreso para actualizar el catálogo de productos.</p>
            </div>
        </div>
    );
}
