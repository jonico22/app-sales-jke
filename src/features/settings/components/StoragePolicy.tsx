import { FileText, Info } from 'lucide-react';

export function StoragePolicy() {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row gap-3 sm:gap-4 animate-in slide-in-from-bottom-4 duration-700 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.05] rotate-12 pointer-events-none">
        <FileText size={60} />
      </div>
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
        <Info className="w-5 h-5 text-primary" />
      </div>
      <div className="space-y-0.5 relative z-10">
        <h3 className="text-xs sm:text-sm font-bold text-foreground tracking-tight uppercase">Política de Almacenamiento</h3>
        <p className="text-muted-foreground leading-relaxed max-w-3xl font-medium text-[10px] sm:text-[11px]">
          Los reportes se eliminan automáticamente después de <span className="font-bold text-primary bg-primary/10 px-1 py-0.5 rounded-md text-[9px] sm:text-[10px]">7 días naturales</span> de su generación. Descargue archivos importantes antes de su expiración.
        </p>
      </div>
    </div>
  );
}
