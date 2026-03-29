import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GeneralSettingsHeaderProps {
  isSaving: boolean;
}

export function GeneralSettingsHeader({ isSaving }: GeneralSettingsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Configuración del Negocio</h1>
        <p className="text-muted-foreground text-xs mt-1">
          Gestiona los detalles de tu empresa, información fiscal y preferencias globales.
        </p>
      </div>
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="px-8 shadow-md"
        disabled={isSaving}
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  );
}
