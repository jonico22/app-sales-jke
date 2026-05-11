import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';

interface ClientsHeaderProps {
    onCreateClick: () => void;
}

export function ClientsHeader({ onCreateClick }: ClientsHeaderProps) {
  return (
    <PageHeader
      title="Gestión de Clientes"
      subtitle="Administre la información y contacto de sus clientes habituales."
      actions={(
        <Button
                onClick={onCreateClick}
                className="h-9 px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2"
            >
                <Plus className="h-4 w-4" /> Nuevo Cliente
        </Button>
      )}
    />
  );
}
