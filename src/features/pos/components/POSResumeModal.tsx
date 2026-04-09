import { AlertCircle, Copy, Play } from 'lucide-react';

interface POSResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isProcessing: boolean;
    orderCode?: string;
}

export function POSResumeModal({
    isOpen,
    onClose,
    onConfirm,
    isProcessing,
    orderCode
}: POSResumeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header with Icon */}
                <div className="flex flex-col items-center pt-5 sm:pt-8 pb-3 sm:pb-4 px-4 sm:px-6 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 animate-in zoom-in duration-500">
                        <Copy className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <h2 className="text-base sm:text-xl font-semibold text-foreground mb-2">
                        Reemplazar por un nuevo Pedido
                    </h2>
                    {orderCode && (
                        <span className="text-xs sm:text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded-md mb-2">
                            #{orderCode}
                        </span>
                    )}
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xs leading-relaxed">
                        Se procederá a <span className="font-bold text-foreground">clonar los productos</span> de este pedido en una nueva orden de venta.
                    </p>
                    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-500 flex gap-2 items-start text-left">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>
                            El pedido actual <strong>será cancelado automáticamente</strong> para mantener el registro histórico y evitar duplicados.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-6 border-t border-border bg-muted/50 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 sm:py-3 text-sm font-semibold text-foreground bg-background border border-input rounded-xl hover:bg-muted transition-colors"
                    >
                        Mantener
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="flex-[1.5] py-2.5 sm:py-3 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-current" />
                                Proceder
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
