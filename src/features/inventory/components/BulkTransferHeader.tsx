import { ChevronLeft, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BulkTransferHeaderProps {
    onDiscardChanges: () => void;
}

export function BulkTransferHeader({ onDiscardChanges }: BulkTransferHeaderProps) {
    return (
        <div className="border-b border-border bg-card">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-5 space-y-2 md:space-y-4">
                <button
                    onClick={onDiscardChanges}
                    className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors group"
                >
                    <ChevronLeft className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Volver
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Truck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-[15px] md:text-2xl font-black text-foreground tracking-tight leading-none">Nueva Operación de Traslado</h1>
                            <p className="text-muted-foreground text-[10px] md:text-sm mt-1 font-medium leading-tight">
                                Configura los parámetros para el envío de stock entre sucursales.
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 px-2.5 py-1 font-black text-[9px] uppercase tracking-widest w-fit shrink-0">
                        ● Borrador
                    </Badge>
                </div>
            </div>
        </div>
    );
}
