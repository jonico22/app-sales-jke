import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';

export function ExternalConsignmentSalesHeader() {
  return (
    <PageHeader
      title="Ventas Externas de Consignación"
      subtitle="Revise ventas reportadas por consignatarios y montos comisionados."
      actions={(
        <Link to="/consignment/sales/new" className="w-full sm:w-auto">
          <Button className="h-9 w-full sm:w-auto px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Registrar Venta Externa
          </Button>
        </Link>
      )}
    />
  );
}
