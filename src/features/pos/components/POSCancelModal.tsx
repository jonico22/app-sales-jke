import { useState } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

interface POSCancelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string, additionalComments: string) => void;
    orderCode: string;
    totalAmount: number;
    isProcessing: boolean;
}

const CANCEL_REASONS = [
    { id: 'error_pedido', label: 'Error en el pedido' },
    { id: 'cliente_arrepentido', label: 'Cliente se arrepintió' },
    { id: 'tiempo_espera', label: 'Tiempo de espera' },
    { id: 'duplicado', label: 'Duplicado' },
];

export function POSCancelModal({
    isOpen,
    onClose,
    onConfirm,
    orderCode,
    totalAmount,
    isProcessing
}: POSCancelModalProps) {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [additionalComments, setAdditionalComments] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!selectedReason) return;
        onConfirm(selectedReason, additionalComments);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header with Icon */}
                <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                        Confirmar Anulación del Pedido
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Esta acción es irreversible y anulará la orden pendiente actual.
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="px-6 mb-6">
                    <div className="bg-muted/50 rounded-xl p-4 flex justify-between items-center border border-border">
                        <div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">TICKET ID</span>
                            <span className="text-sm font-bold text-foreground">#{orderCode}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">MONTO TOTAL</span>
                            <span className="text-sm font-black text-foreground">S/ {totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 space-y-4 mb-6">
                    {/* Reason Selection */}
                    <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                            Motivo de Anulación
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {CANCEL_REASONS.map((reason) => (
                                <button
                                    key={reason.id}
                                    onClick={() => setSelectedReason(reason.label)}
                                    className={`py-2 px-3 text-xs font-medium border rounded-lg transition-all ${selectedReason === reason.label
                                        ? 'bg-destructive/10 text-destructive border-destructive ring-1 ring-destructive'
                                        : 'bg-background text-muted-foreground border-input hover:border-border hover:bg-muted'
                                        }`}
                                >
                                    {reason.label}
                                </button>
                            ))}
                        </div>
                        {selectedReason === 'Tiempo de espera' && (
                            <p className="text-xs text-destructive mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                                * Se registrará incidencia por demora.
                            </p>
                        )}
                    </div>

                    {/* Additional Comments */}
                    <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                            Comentarios Adicionales <span className="text-muted-foreground font-normal">(Opcional)</span>
                        </label>
                        <textarea
                            value={additionalComments}
                            onChange={(e) => setAdditionalComments(e.target.value)}
                            placeholder="Escriba detalles adicionales aquí..."
                            className="w-full p-3 text-sm text-foreground bg-background border border-input rounded-xl focus:ring-2 focus:ring-destructive/20 focus:border-destructive outline-none transition-all placeholder:text-muted-foreground resize-none h-24"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-border bg-muted/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-bold text-foreground bg-background border border-input rounded-xl hover:bg-muted transition-colors"
                    >
                        Mantener Pedido
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedReason || isProcessing}
                        className="flex-[1.5] py-3 text-sm font-bold text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-xl shadow-lg shadow-destructive/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Anulando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Anular Pedido
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
