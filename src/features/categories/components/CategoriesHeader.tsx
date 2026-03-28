import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CategoriesHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight uppercase">Listado de Categorías</h2>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">Organice su inventario con categorías personalizadas.</p>
      </div>
      <Link to="/categories/new" className="w-full sm:w-auto">
        <Button className="h-10 sm:h-9 w-full sm:w-auto px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center justify-center gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Nueva Categoría
        </Button>
      </Link>
    </div>
  );
}
