import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UsersHeaderProps {
  onNewUser: () => void;
}

export function UsersHeader({ onNewUser }: UsersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-0.5">
        <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight uppercase">Usuarios y Accesos</h1>
        <p className="text-muted-foreground text-[10px] sm:text-[11px] font-medium leading-none">
          Gestione el acceso al sistema y permisos.
        </p>
      </div>
      <Button
        onClick={onNewUser}
        variant="primary"
        size="sm"
        className="flex items-center justify-center gap-2 h-10 sm:h-8 w-full sm:w-auto px-5 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-primary/20"
      >
        <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        Nuevo Usuario
      </Button>
    </div>
  );
}
