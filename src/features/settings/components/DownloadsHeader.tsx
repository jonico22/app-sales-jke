export function DownloadsHeader() {
  return (
    <div className="space-y-1.5">
      <nav className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold tracking-tight">
        <span className="opacity-50 uppercase">Configuración</span>
        <span className="opacity-30">/</span>
        <span className="text-primary uppercase">Descargas</span>
      </nav>

      <div className="space-y-0.5">
        <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Historial de Reportes</h1>
        <p className="text-muted-foreground text-[11px] max-w-2xl font-medium leading-none">
          Reportes procesados en segundo plano. Los archivos se eliminan automáticamente tras 7 días.
        </p>
      </div>
    </div>
  );
}
