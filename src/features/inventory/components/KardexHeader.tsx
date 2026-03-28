import { Download, PlusCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KardexHeaderProps {
    onExport: () => void;
    onAdjustment: () => void;
    onSync: () => void;
    isLoading: boolean;
}

export function KardexHeader({ onExport, onAdjustment, onSync, isLoading }: KardexHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <h1 className="text-xl font-black text-foreground tracking-tight uppercase">Kardex / Historial de Stock</h1>
                <p className="text-muted-foreground text-[10px] mt-0.5 font-bold uppercase tracking-widest opacity-60">Seguimiento detallado de entradas y salidas de inventario</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
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
            </div>
        </div>
    );
}
