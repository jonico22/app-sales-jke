import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

interface BranchOfficesHeaderProps {
    onNewBranch: () => void;
}

export function BranchOfficesHeader({ onNewBranch }: BranchOfficesHeaderProps) {
  return (
    <PageHeader
      title="Sucursales"
      subtitle="Administra las sedes físicas de tu negocio."
      actions={(
        <Button
                onClick={onNewBranch}
                className="h-9 px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2"
            >
                <Plus className="h-4 w-4" /> Nueva Sucursal
        </Button>
      )}
    />
  );
}
