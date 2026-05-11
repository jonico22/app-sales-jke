import { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, QrCode, Check } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { OrderStatus } from '@/services/order.service';
import { OrderPaymentMethod, OrderPaymentStatus } from '@/services/order-payment.service';
import { useUpdateOrderMutation, useCreatePaymentMutation } from '@/features/orders/hooks/useOrderQueries';
import { useSocietyStore } from '@/store/society.store';

interface POSPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: (paymentMethod: string) => void;
}

type PaymentMethodUI = 'CASH' | 'CARD' | 'YAPE' | 'PLIN';
type CardNetwork = 'VISA' | 'MASTERCARD' | 'AMEX' | null;

export function POSPaymentModal({ isOpen, onClose, onPaymentSuccess }: POSPaymentModalProps) {
    const currentOrderId = useCartStore(state => state.currentOrderId);
    const currentOrderCode = useCartStore(state => state.currentOrderCode);
    const currentOrderTotal = useCartStore(state => state.currentOrderTotal);
    const currencyId = useCartStore(state => state.currencyId);
    const society = useSocietyStore(state => state.society);
    const total = currentOrderTotal;
    const [method, setMethod] = useState<PaymentMethodUI>('YAPE');

    const [cardNetwork, setCardNetwork] = useState<CardNetwork>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<OrderPaymentMethod>(OrderPaymentMethod.YAPE);
    const [operationNumber, setOperationNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setMethod('YAPE');
            setCardNetwork(null);
            setSelectedPaymentMethod(OrderPaymentMethod.YAPE);
            setOperationNumber(generateRandomCode('Y'));
            setIsProcessing(false);
        }
    }, [isOpen]);

    const { mutateAsync: createPayment } = useCreatePaymentMutation({ suppressSuccessToast: true });
    const { mutateAsync: updateOrder } = useUpdateOrderMutation({ suppressSuccessToast: true });

    if (!isOpen) return null;

    const isValidAmount = method === 'CASH'
        ? true
        : method === 'CARD'
            ? cardNetwork !== null && operationNumber.trim().length > 0
            : (method === 'YAPE' || method === 'PLIN')
                ? operationNumber.trim().length > 0
                : true;


    const handleConfirmPayment = async () => {
        if (!currentOrderId) {
            console.error('No currentOrderId found!');
            return;
        }

        setIsProcessing(true);
        try {
            // Create payment record
            await createPayment({
                orderId: currentOrderId,
                societyId: society?.id || '',
                amount: total,
                currencyId: society?.mainCurrency?.id || currencyId || '',
                exchangeRate: 1.0,
                paymentMethod: selectedPaymentMethod,
                referenceCode: operationNumber || undefined,
                status: OrderPaymentStatus.CONFIRMED
            });

            // Update order status to COMPLETED
            await updateOrder({
                id: currentOrderId,
                data: { status: OrderStatus.COMPLETED }
            });

            onPaymentSuccess(selectedPaymentMethod);
            onClose();
        } catch (error) {
            console.error('Payment failed', error);
            // Error toast is already handled by mutation hook now
        } finally {
            setIsProcessing(false);
        }
    };

    const generateRandomCode = (prefix: string = '') => {
        const random = Math.floor(100000 + Math.random() * 900000).toString();
        return prefix ? `${prefix}-${random}` : random;
    };

    const handleMethodChange = (uiMethod: PaymentMethodUI) => {
        setMethod(uiMethod);
        if (uiMethod === 'CASH') {
            setSelectedPaymentMethod(OrderPaymentMethod.CASH);
            setOperationNumber('');
            setCardNetwork(null);
        } else if (uiMethod === 'CARD') {
            setSelectedPaymentMethod(OrderPaymentMethod.CARD);
            setOperationNumber('');
        } else if (uiMethod === 'YAPE') {
            setSelectedPaymentMethod(OrderPaymentMethod.YAPE);
            setOperationNumber(generateRandomCode('Y'));
            setCardNetwork(null);
        } else if (uiMethod === 'PLIN') {
            setSelectedPaymentMethod(OrderPaymentMethod.PLIN);
            setOperationNumber(generateRandomCode('P'));
            setCardNetwork(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl sm:rounded-3xl w-full max-w-[400px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col">
                {/* Header */}
                <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-primary font-semibold min-w-0">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span className="text-sm sm:text-base truncate">Procesar Pago - #{currentOrderCode || '...'}</span>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto">
                    {/* Total Amount */}
                    <div className="text-center space-y-1">
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total a Pagar</p>
                        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tabular-nums">S/ {total.toFixed(2)}</h2>
                        <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-semibold uppercase tracking-[0.12em] rounded-full">
                            Pendiente de pago
                        </span>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">Método de Pago</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleMethodChange('CASH')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${method === 'CASH' ? 'border-primary bg-primary/5 text-primary' : 'border-input hover:border-border text-muted-foreground'}`}
                            >
                                <Banknote className="w-6 h-6" />
                                <span className="text-xs font-semibold">Efectivo</span>
                            </button>
                            <button
                                onClick={() => handleMethodChange('CARD')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${method === 'CARD' ? 'border-primary bg-primary/5 text-primary' : 'border-input hover:border-border text-muted-foreground'}`}
                            >
                                <CreditCard className="w-6 h-6" />
                                <span className="text-xs font-semibold">Tarjeta</span>
                            </button>
                            <button
                                onClick={() => handleMethodChange('YAPE')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${method === 'YAPE' ? 'border-primary bg-primary/5 text-primary' : 'border-input hover:border-border text-muted-foreground'}`}
                            >
                                <QrCode className="w-6 h-6" />
                                <span className="text-xs font-semibold">Yape</span>
                            </button>
                            <button
                                onClick={() => handleMethodChange('PLIN')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${method === 'PLIN' ? 'border-primary bg-primary/5 text-primary' : 'border-input hover:border-border text-muted-foreground'}`}
                            >
                                <QrCode className="w-6 h-6" />
                                <span className="text-xs font-semibold">Plin</span>
                            </button>
                        </div>
                    </div>

                    {/* Cash Details removed as requested */}

                    {/* Card Details */}
                    {method === 'CARD' && (
                        <div className="bg-muted/30 rounded-xl p-4 border border-border space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em] mb-2 block">Detalle del Pago (Tarjeta)</label>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nº de Operación (POS)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">#</span>
                                            <input
                                                type="text"
                                                value={operationNumber}
                                                onChange={(e) => setOperationNumber(e.target.value)}
                                                className="w-full pl-8 pr-4 py-2.5 text-base font-medium text-foreground bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                                                placeholder="000000"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Red de Pago</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => setCardNetwork('VISA')}
                                                className={`py-2 text-xs font-semibold border rounded-lg transition-all ${cardNetwork === 'VISA' ? 'bg-primary/10 text-primary border-primary' : 'bg-background text-muted-foreground border-input hover:border-border'}`}
                                            >
                                                Visa
                                            </button>
                                            <button
                                                onClick={() => setCardNetwork('MASTERCARD')}
                                                className={`py-2 text-xs font-semibold border rounded-lg transition-all ${cardNetwork === 'MASTERCARD' ? 'bg-primary/10 text-primary border-primary' : 'bg-background text-muted-foreground border-input hover:border-border'}`}
                                            >
                                                Mastercard
                                            </button>
                                            <button
                                                onClick={() => setCardNetwork('AMEX')}
                                                className={`py-2 text-xs font-semibold border rounded-lg transition-all ${cardNetwork === 'AMEX' ? 'bg-primary/10 text-primary border-primary' : 'bg-background text-muted-foreground border-input hover:border-border'}`}
                                            >
                                                AMEX
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Yape / Plin Details */}
                    {(method === 'YAPE' || method === 'PLIN') && (
                        <div className="bg-muted/30 rounded-xl p-4 border border-border space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em] mb-2 block">Detalle del Pago ({method})</label>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nº de Operación</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">#</span>
                                        <input
                                            type="text"
                                            value={operationNumber}
                                            onChange={(e) => setOperationNumber(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2.5 text-base font-medium text-foreground bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                                            placeholder="Ingresa los últimos dígitos"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-5 border-t border-border bg-muted/50 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-semibold text-foreground bg-background dark:bg-slate-800/50 border border-input rounded-xl hover:bg-muted transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirmPayment}
                        disabled={!isValidAmount || isProcessing}
                        className="flex-[2] py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Confirmar Pago
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
