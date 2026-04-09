import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';

export function CategoriesHeader() {
  return (
    <PageHeader
      title="Listado de Categorías"
      subtitle="Organice su inventario con categorías personalizadas."
      actions={(
        <Link to="/categories/new" className="w-full sm:w-auto">
          <Button className="h-10 sm:h-9 w-full sm:w-auto px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center justify-center gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Nueva Categoría
          </Button>
        </Link>
      )}
    />
  );
}
