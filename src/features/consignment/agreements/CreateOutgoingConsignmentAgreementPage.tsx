import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { CreateOutgoingAgreementForm } from './components/CreateOutgoingAgreementForm';

export default function CreateOutgoingConsignmentAgreementPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Crear Acuerdo de Consignación"
        subtitle="Registra el acuerdo saliente inicial reutilizando la sucursal, moneda y usuario activos del sistema."
        leading={(
          <Link to="/consignment/agreements">
            <Button variant="outline" className="h-9 w-9 p-0 flex items-center justify-center border-border bg-card shadow-sm hover:bg-muted transition-all active:scale-90 rounded-lg">
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
        )}
      />

      <CreateOutgoingAgreementForm
        onCancel={() => navigate('/consignment/agreements')}
        onSuccess={() => navigate('/consignment/agreements')}
      />
    </div>
  );
}
