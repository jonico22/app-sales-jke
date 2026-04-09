import { Save } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';

interface GeneralSettingsHeaderProps {
  isSaving: boolean;
}

export function GeneralSettingsHeader({ isSaving }: GeneralSettingsHeaderProps) {
  return (
    <PageHeader
      title="Configuración del Negocio"
      subtitle="Gestiona los detalles de tu empresa, información fiscal y preferencias globales."
      actions={(
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
      )}
    />
  );
}
