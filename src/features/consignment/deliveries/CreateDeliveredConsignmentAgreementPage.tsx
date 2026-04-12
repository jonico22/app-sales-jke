import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { CreateDeliveredConsignmentForm } from './components/CreateDeliveredConsignmentForm';

export default function CreateDeliveredConsignmentAgreementPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Registrar Entrega en Consignación"
        subtitle="Registra el producto entregado sobre un acuerdo de consignación ya creado."
        leading={(
          <Link to="/consignment/deliveries">
            <Button variant="outline" className="h-9 w-9 p-0 flex items-center justify-center border-border bg-card shadow-sm hover:bg-muted transition-all active:scale-90 rounded-lg">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
        )}
      />

      <CreateDeliveredConsignmentForm
        onCancel={() => navigate('/consignment/deliveries')}
        onSuccess={() => navigate('/consignment/deliveries')}
      />
    </div>
  );
}
