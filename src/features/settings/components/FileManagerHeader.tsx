import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';

interface FileManagerHeaderProps {
  onUpload: () => void;
}

export function FileManagerHeader({ onUpload }: FileManagerHeaderProps) {
  return (
    <PageHeader
      title="Manejador de Archivos"
      subtitle="Gestione y organice todos los archivos de su negocio."
      actions={(
        <Button
          variant="primary"
          className="bg-[#56a3e2] hover:bg-[#4a8ec5] text-white font-bold"
          onClick={onUpload}
        >
          <Plus className="w-4 h-4 mr-2" />
          Subir Nuevo
        </Button>
      )}
    />
  );
}
