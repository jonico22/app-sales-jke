import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { CreateExternalConsignmentSaleForm } from './components/CreateExternalConsignmentSaleForm';

export default function CreateExternalConsignmentSalePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Registrar Venta Externa"
        subtitle="Registra la venta informada por el consignatario sobre una entrega existente."
        leading={(
          <Link to="/consignment/sales">
            <Button variant="outline" className="h-9 w-9 p-0 flex items-center justify-center border-border bg-card shadow-sm hover:bg-muted transition-all active:scale-90 rounded-lg">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
        )}
      />

      <CreateExternalConsignmentSaleForm
        onCancel={() => navigate('/consignment/sales')}
        onSuccess={() => navigate('/consignment/sales')}
      />
    </div>
  );
}
