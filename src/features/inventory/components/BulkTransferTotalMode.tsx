import { Info, Truck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkTransferTotalModeProps {
    originBranchId: string;
    destinationBranchId: string;
    isLoading: boolean;
    onDiscardChanges: () => void;
    onConfirmTotalTransfer: () => void;
}

export function BulkTransferTotalMode({
    originBranchId,
    destinationBranchId,
    isLoading,
    onDiscardChanges,
    onConfirmTotalTransfer
}: BulkTransferTotalModeProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Info Banner */}
            <div className="relative overflow-hidden bg-sky-500/5 border border-sky-500/15 p-5 rounded-2xl flex items-start gap-4">
                <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-sky-500/5 to-transparent" />
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-sky-500" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sky-700 font-black text-xs uppercase tracking-wider">Información de Traslado Total</h3>
                    <p className="text-sky-600/80 text-[11px] font-medium leading-relaxed">
                        Esta operación moverá{' '}
                        <span className="font-black text-sky-700">TODO el stock disponible</span>{' '}
                        de la sucursal de origen a la sucursal de destino en una sola transacción.
                    </p>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-6 pt-4 border-t border-border/40">
                <button
                    onClick={onDiscardChanges}
                    className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                    Descartar Cambios
                </button>
                <Button
                    disabled={isLoading || !originBranchId || !destinationBranchId}
                    onClick={onConfirmTotalTransfer}
                    className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Confirmar Traslado Total
                            <Truck className="w-5 h-5" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
