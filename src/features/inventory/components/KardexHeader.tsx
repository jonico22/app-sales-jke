import { Download, PlusCircle, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';

interface KardexHeaderProps {
    onExport: () => void;
    onAdjustment: () => void;
    onSync: () => void;
    isLoading: boolean;
}

export function KardexHeader({ onExport, onAdjustment, onSync, isLoading }: KardexHeaderProps) {
  return (
    <PageHeader
      title="Kardex / Historial de Stock"
      subtitle="Seguimiento detallado de entradas y salidas de inventario."
      subtitleClassName="text-xs sm:text-sm font-medium normal-case tracking-normal opacity-100"
      actions={(
        <>
                <Button
                    variant="outline"
                    onClick={onExport}
                    className="flex-1 sm:flex-none h-9 md:h-10 px-3 md:px-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-card border-border hover:bg-muted shadow-sm transition-all active:scale-95"
                >
                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    Exportar
                </Button>
                <Button
                    onClick={onAdjustment}
                    className="flex-1 sm:flex-none h-9 md:h-10 px-3 md:px-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 border-none"
                >
                    <PlusCircle className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    Ajuste
                </Button>
                <Button
                    onClick={onSync}
                    className="flex-1 sm:flex-none h-9 md:h-10 px-3 md:px-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Sincronizar
                </Button>
        </>
      )}
    />
  );
}
