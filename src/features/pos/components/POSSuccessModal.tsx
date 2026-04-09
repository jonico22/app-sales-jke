import { CheckCircle2, ArrowLeft } from 'lucide-react';

interface POSSuccessModalProps {
    isOpen: boolean;
    orderCode: string;
    clientName: string;
    paymentMethod: string;
    total: number;
    onClose: () => void;
    onPrintTicket?: () => void;
    onShareWhatsApp?: () => void;
}

export function POSSuccessModal({
    isOpen,
    orderCode,
    clientName,
    paymentMethod,
    total,
    onClose,
}: POSSuccessModalProps) {
    if (!isOpen) return null;

    const formatPaymentMethod = (method: string) => {
        const methods: Record<string, string> = {
            'CASH': 'Efectivo',
            'CARD': 'Tarjeta',
            'TRANSFER': 'Transferencia',
            'YAPE': 'Yape',
            'PLIN': 'Plin',
            'OTHER': 'Otro'
        };
        return methods[method] || method;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Success Icon */}
                <div className="flex flex-col items-center pt-5 sm:pt-8 pb-5 sm:pb-6 px-4 sm:px-6">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
                    </div>

                    {/* Title */}
                    <h2 className="text-lg sm:text-2xl font-semibold text-foreground mb-2 tracking-tight">
                        ¡Venta Realizada con Éxito!
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground text-center">
                        La orden <span className="font-semibold text-foreground">#{orderCode}</span> ha sido generada correctamente
                    </p>
                </div>

                {/* Order Details */}
                <div className="px-4 sm:px-6 pb-5 sm:pb-6">
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Cliente</span>
                            <span className="text-sm font-semibold text-foreground">{clientName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Método de Pago</span>
                            <span className="text-sm font-semibold text-foreground">{formatPaymentMethod(paymentMethod)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border">
                            <span className="text-sm font-medium text-foreground">Total</span>
                            <span className="text-xl font-semibold text-primary tabular-nums">S/ {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-3">
                    <button
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-background border-2 border-input text-muted-foreground hover:text-foreground hover:border-border font-semibold rounded-xl transition-all active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Iniciar Nueva Venta
                    </button>
                </div>
            </div>
        </div>
    );
}
