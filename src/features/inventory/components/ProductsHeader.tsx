import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function ProductsHeader() {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-base font-bold text-foreground tracking-tight uppercase">Inventario de Productos</h2>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Gestione su inventario de productos y controle existencias.</p>
            </div>
            <Link to="/inventory/new">
                <Button className="h-9 px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Nuevo Producto
                </Button>
            </Link>
        </div>
    );
}
