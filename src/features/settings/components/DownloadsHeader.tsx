import { PageHeader } from '@/components/shared/PageHeader';

export function DownloadsHeader() {
  return (
    <PageHeader
      title="Historial de Reportes"
      subtitle="Reportes procesados en segundo plano. Los archivos se eliminan automáticamente tras 7 días."
      topContent={(
        <nav className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold tracking-tight">
        <span className="opacity-50 uppercase">Configuración</span>
        <span className="opacity-30">/</span>
        <span className="text-primary uppercase">Descargas</span>
        </nav>
      )}
    />
  );
}
