import { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, QrCode, Check, Printer, Mail } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { orderService, OrderStatus } from '@/services/order.service';
import { orderPaymentService, OrderPaymentMethod, OrderPaymentStatus } from '@/services/order-payment.service';
import { useSocietyStore } from '@/store/society.store';

interface POSPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: (paymentMethod: string) => void;
}

type PaymentMethodUI = 'CASH' | 'CARD' | 'YAPE_PLIN';
type CardNetwork = 'VISA' | 'MASTERCARD' | 'AMEX' | null;

export function POSPaymentModal({ isOpen, onClose, onPaymentSuccess }: POSPaymentModalProps) {
    const { currentOrderId, currentOrderCode, currentOrderTotal, currencyId } = useCartStore();
    const society = useSocietyStore(state => state.society);
    const total = currentOrderTotal;
    const [method, setMethod] = useState<PaymentMethodUI>('CASH');
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [cardNetwork, setCardNetwork] = useState<CardNetwork>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<OrderPaymentMethod>(OrderPaymentMethod.CASH);
    const [operationNumber, setOperationNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setMethod('CASH');
            setAmountReceived('');
            setCardNetwork(null);
            setSelectedPaymentMethod(OrderPaymentMethod.CASH);
            setOperationNumber('');
            setIsProcessing(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const change = parseFloat(amountReceived || '0') - total;
    const isValidAmount = method === 'CASH'
        ? parseFloat(amountReceived || '0') >= total
        : method === 'CARD'
            ? cardNetwork !== null && operationNumber.trim().length > 0
            : method === 'YAPE_PLIN'
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
            await orderPaymentService.create({
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
            await orderService.update(currentOrderId, { status: OrderStatus.COMPLETED });

            onPaymentSuccess(selectedPaymentMethod);
            onClose();
        } catch (error) {
            console.error('Payment failed', error);
            // Show error toast
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <CreditCard className="w-5 h-5 text-sky-500" />
                        <span>Procesar Pago - #{currentOrderCode || '...'}</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Total Amount */}
                    <div className="text-center space-y-1">
                        <p className="text-sm text-slate-500 font-medium">Total a Pagar</p>
                        <h2 className="text-4xl font-black text-slate-800">S/ {total.toFixed(2)}</h2>
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                            Pendiente de pago
                        </span>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Método de Pago</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => {
                                    setMethod('CASH');
                                    setSelectedPaymentMethod(OrderPaymentMethod.CASH);
                                }}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${method === 'CASH' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                            >
                                <Banknote className="w-6 h-6" />
                                <span className="text-xs font-bold">Efectivo</span>
                            </button>
                            <button
                                onClick={() => {
                                    setMethod('CARD');
                                    setSelectedPaymentMethod(OrderPaymentMethod.CARD);
                                }}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${method === 'CARD' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                            >
                                <CreditCard className="w-6 h-6" />
                                <span className="text-xs font-bold">Tarjeta</span>
                            </button>
                            <button
                                onClick={() => {
                                    setMethod('YAPE_PLIN');
                                    // Default to YAPE, user will select specific one
                                    setSelectedPaymentMethod(OrderPaymentMethod.YAPE);
                                }}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${method === 'YAPE_PLIN' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                            >
                                <QrCode className="w-6 h-6" />
                                <span className="text-xs font-bold">Yape / Plin</span>
                            </button>
                        </div>
                    </div>

                    {/* Cash Details */}
                    {method === 'CASH' && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Monto Recibido</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
                                    <input
                                        type="number"
                                        value={amountReceived}
                                        onChange={(e) => setAmountReceived(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2.5 text-lg font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => setAmountReceived(total.toFixed(2))} className="px-2 py-1 text-xs font-medium bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600">Exacto</button>
                                    <button onClick={() => setAmountReceived('50.00')} className="px-2 py-1 text-xs font-medium bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600">S/ 50.00</button>
                                    <button onClick={() => setAmountReceived('100.00')} className="px-2 py-1 text-xs font-medium bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600">S/ 100.00</button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                                <span className="text-sm font-medium text-slate-500">Cambio a Devolver</span>
                                <span className={`text-xl font-black ${change >= 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                    S/ {change >= 0 ? change.toFixed(2) : '0.00'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Card Details */}
                    {method === 'CARD' && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Detalle del Pago (Tarjeta)</label>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Nº de Operación (POS)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">#</span>
                                            <input
                                                type="text"
                                                value={operationNumber}
                                                onChange={(e) => setOperationNumber(e.target.value)}
                                                className="w-full pl-8 pr-4 py-2.5 text-base font-medium text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300"
                                                placeholder="000000"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Red de Pago</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => setCardNetwork('VISA')}
                                                className={`py-2 text-xs font-bold border rounded-lg transition-all ${cardNetwork === 'VISA' ? 'bg-sky-50 text-sky-700 border-sky-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                Visa
                                            </button>
                                            <button
                                                onClick={() => setCardNetwork('MASTERCARD')}
                                                className={`py-2 text-xs font-bold border rounded-lg transition-all ${cardNetwork === 'MASTERCARD' ? 'bg-sky-50 text-sky-700 border-sky-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                Mastercard
                                            </button>
                                            <button
                                                onClick={() => setCardNetwork('AMEX')}
                                                className={`py-2 text-xs font-bold border rounded-lg transition-all ${cardNetwork === 'AMEX' ? 'bg-sky-50 text-sky-700 border-sky-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
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
                    {method === 'YAPE_PLIN' && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Detalle del Pago</label>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setSelectedPaymentMethod(OrderPaymentMethod.YAPE)}
                                            className={`py-3 text-sm font-bold border rounded-xl transition-all ${selectedPaymentMethod === OrderPaymentMethod.YAPE ? 'bg-white text-slate-800 border-sky-500 shadow-sm ring-1 ring-sky-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                        >
                                            Yape
                                        </button>
                                        <button
                                            onClick={() => setSelectedPaymentMethod(OrderPaymentMethod.PLIN)}
                                            className={`py-3 text-sm font-bold border rounded-xl transition-all ${selectedPaymentMethod === OrderPaymentMethod.PLIN ? 'bg-white text-slate-800 border-sky-500 shadow-sm ring-1 ring-sky-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                        >
                                            Plin
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Nº de Operación</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">#</span>
                                            <input
                                                type="text"
                                                value={operationNumber}
                                                onChange={(e) => setOperationNumber(e.target.value)}
                                                className="w-full pl-8 pr-4 py-2.5 text-base font-medium text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-300"
                                                placeholder="Ingresa los últimos dígitos"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Options */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button className="py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                            <Printer className="w-4 h-4" />
                            Imprimir Ticket
                        </button>
                        <button className="py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                            <Mail className="w-4 h-4" />
                            Enviar Correo
                        </button>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirmPayment}
                        disabled={!isValidAmount || isProcessing}
                        className="flex-[2] py-3 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
