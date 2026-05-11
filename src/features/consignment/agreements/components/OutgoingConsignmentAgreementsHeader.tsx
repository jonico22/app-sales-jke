import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';

export function OutgoingConsignmentAgreementsHeader() {
  return (
    <PageHeader
      title="Acuerdos de Consignación"
      subtitle="Gestione acuerdos salientes y controle su vigencia comercial."
      actions={(
        <Link to="/consignment/agreements/new" className="w-full sm:w-auto">
          <Button className="h-9 w-full sm:w-auto px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nuevo Acuerdo
          </Button>
        </Link>
      )}
    />
  );
}
