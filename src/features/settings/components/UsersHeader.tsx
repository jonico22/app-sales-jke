import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';

interface UsersHeaderProps {
  onNewUser: () => void;
}

export function UsersHeader({ onNewUser }: UsersHeaderProps) {
  return (
    <PageHeader
      title="Usuarios y Accesos"
      subtitle="Gestione el acceso al sistema y permisos."
      subtitleClassName="text-[11px] sm:text-sm leading-relaxed"
      actions={(
        <Button
        onClick={onNewUser}
        variant="primary"
        size="sm"
        className="flex items-center justify-center gap-2 h-10 sm:h-8 w-full sm:w-auto px-5 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-primary/20"
      >
        <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        Nuevo Usuario
        </Button>
      )}
    />
  );
}
