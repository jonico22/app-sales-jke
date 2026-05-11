import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function ProductsHeader() {
  return (
    <PageHeader
      title="Inventario de Productos"
      subtitle="Gestione su inventario de productos y controle existencias."
      actions={(
        <Link to="/inventory/new" className="w-full sm:w-auto">
          <Button className="h-9 w-full sm:w-auto px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nuevo Producto
          </Button>
        </Link>
      )}
    />
  );
}
