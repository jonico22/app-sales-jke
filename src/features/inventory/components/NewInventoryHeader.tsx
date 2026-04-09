import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';

export function NewInventoryHeader() {
  return (
    <PageHeader
      title="Alta de Inventario"
      subtitle="Seleccione el método de ingreso para actualizar el catálogo de productos."
      className="mb-2"
      leading={(
        <Link to="/inventory">
          <Button variant="outline" className="h-9 w-9 p-0 flex items-center justify-center border-border bg-card shadow-sm hover:bg-muted transition-all active:scale-90 rounded-lg">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
      )}
    />
  );
}
