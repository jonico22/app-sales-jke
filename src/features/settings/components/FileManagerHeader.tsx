import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileManagerHeaderProps {
  onUpload: () => void;
}

export function FileManagerHeader({ onUpload }: FileManagerHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manejador de Archivos</h1>
        <p className="text-muted-foreground text-sm">Gestiona y organiza todos los archivos de tu negocio.</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          className="bg-[#56a3e2] hover:bg-[#4a8ec5] text-white font-bold"
          onClick={onUpload}
        >
          <Plus className="w-4 h-4 mr-2" />
          Subir Nuevo
        </Button>
      </div>
    </div>
  );
}
