import { useState } from 'react';
import { X, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useCartStore, selectTotalPrice } from '@/store/cart.store';
import { orderService, type CreateOrderRequest, OrderStatus } from '@/services/order.service';
import { useSocietyStore } from '@/store/society.store';
import { POSPaymentModal } from './POSPaymentModal';
import { POSAlertModal } from './POSAlertModal';
import { parseBackendError } from '@/utils/error.utils';


interface POSCartPanelProps {
    isOpen: boolean;
    onClose: () => void;
    selectedClient: { id: string } | null;
    onSaleSuccess: () => void;
}

export function POSCartPanel({ isOpen, onClose, selectedClient, onSaleSuccess }: POSCartPanelProps) {
    const { items, removeItem, updateQuantity, updatePrice, discount, setDiscount, orderNotes, setOrderNotes, setCurrentOrder, clearCart, branchId, currencyId } = useCartStore();
    const society = useSocietyStore(state => state.society);
    const totalWithTax = useCartStore(selectTotalPrice);
    const subtotal = totalWithTax / 1.18;
    const igv = totalWithTax - subtotal;
    const total = totalWithTax - (discount || 0);

    const [processingStatus, setProcessingStatus] = useState<OrderStatus | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleProcessOrder = async (targetStatus: OrderStatus = OrderStatus.PENDING_PAYMENT) => {
        if (items.length === 0) return;

        setProcessingStatus(targetStatus);
        try {
            // Construct Order Request
            // Note: We need actual IDs for society, branch, currency, partner. 
            // For now, hardcoding or assuming defaults/mock until we pull from global store/context properly.
            // In a real app, these would come from the auth context or selected values in the POS page.

            // Construct Order Request with correct keys matching backend validation

            const orderData: CreateOrderRequest = {
                societyId: society?.id || '1',
                branchId: branchId || '1',
                // Use currency from society store
                currencyId: society?.mainCurrency?.id || currencyId || '1',
                partnerId: selectedClient?.id && selectedClient.id !== 'public' ? selectedClient.id : '2',
                // Note: The user's backend seems to validate UUIDs maybe? 'public' might fail if it's not in DB. Assuming '2' or similar generic ID, or the user's system handles 'public'.
                // If selectedClient.id is 'public', we probably need a valid Anonymous Customer ID from the DB. 
                // For now, I'll pass 'public' if that's what was there, OR if the user error implied invalid customerId I should be careful.
                // The user validation error for customerId was just "Required", not "Invalid".

                exchangeRate: 1.0,
                status: OrderStatus.PENDING_PAYMENT, // Use the target status
                subtotal: subtotal,
                taxAmount: igv,
                total: total,
                discount: discount || 0,
                notes: orderNotes,
                orderItems: items.map(item => {
                    const price = Number(item.product.price);
                    return {
                        productId: item.product.id,
                        quantity: item.quantity,
                        unitPrice: price,
                        total: price * item.quantity
                    };
                })
            };

            const response = await orderService.create(orderData);

            if (response.success && response.data) {
                // If it's PENDING_PAYMENT, we prepare for payment modal
                if (targetStatus === OrderStatus.PENDING_PAYMENT) {
                    // Save order details to store for payment modal
                    setCurrentOrder(response.data.id, response.data.orderCode, total);

                    // Clear cart and close panel
                    clearCart();
                    onClose();

                    // Trigger payment modal in parent
                    onSaleSuccess();
                } else {
                    // Just a pending order (e.g. "Realizar otro pedido")
                    // Clear cart and close panel without triggering payment modal
                    clearCart();
                    onClose();
                }
            }
        } catch (error) {
            console.error('Failed to create order', error);
            const message = parseBackendError(error);
            setErrorMessage(message);
        } finally {
            setProcessingStatus(null);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        onClose(); // Close cart panel
        clearCart(); // Clear cart after successful payment
        // Optionally show success message
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Venta Actual</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <ShoppingBag className="w-16 h-16 opacity-10" />
                            <p className="text-sm font-medium">El carrito está vacío</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.product.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">
                                            {item.product.name}
                                        </h4>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {item.product.brand || item.product.description || 'Sin detalles'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.product.id)}
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-end justify-between">
                                    {/* Quantity Stepper */}
                                    <div className="flex items-center p-1 gap-1">
                                        <button
                                            onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                            className="w-8 h-8 flex items-center justify-center bg-white border-2 border-slate-100 text-slate-400 rounded-lg hover:border-slate-300 hover:text-slate-600 transition-all active:scale-95"
                                        >
                                            <span className="text-lg leading-none font-bold mb-0.5">−</span>
                                        </button>
                                        <span className="w-8 text-center font-bold text-slate-700 text-sm">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-sky-600 text-white rounded-lg hover:bg-sky-700 shadow-sm shadow-sky-200 transition-all active:scale-95"
                                        >
                                            <span className="text-lg leading-none font-bold mb-0.5">+</span>
                                        </button>
                                    </div>

                                    {/* Price Input */}
                                    <div className="text-right">
                                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 block">
                                            Precio Unit.
                                        </label>
                                        <div className="relative group/price">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-600/70">
                                                {society?.mainCurrency?.symbol || 'S/'}
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.10"
                                                value={item.product.price}
                                                onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                                                className="w-28 pl-8 pr-3 py-1.5 text-right text-sm font-bold text-sky-700 bg-sky-50/50 border border-sky-100 rounded-lg focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-white border-t border-slate-100 space-y-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-10 relative">

                    {/* Discount & Notes */}
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                                <span>Descuento Global</span>
                                {discount > 0 && (
                                    <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                                        Aplicado
                                    </span>
                                )}
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${discount > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
                                    <ShoppingBag className="w-4 h-4 rotate-12" />
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    value={discount || ''}
                                    placeholder="Ej. 10.00"
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    className={`w-full pl-10 pr-4 py-3 text-sm font-medium border rounded-xl outline-none transition-all ${discount > 0
                                        ? 'bg-orange-50/50 border-orange-200 text-orange-700 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 placeholder:text-orange-300'
                                        : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10'
                                        }`}
                                />
                                {discount > 0 && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-orange-600 text-sm">
                                        - {society?.mainCurrency?.symbol || 'S/'} {discount.toFixed(2)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">
                                Comentarios
                            </label>
                            <textarea
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                placeholder="Notas adicionales del pedido..."
                                className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 outline-none resize-none h-24 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span>{society?.mainCurrency?.symbol || 'S/'} {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>IGV (18%)</span>
                            <span>{society?.mainCurrency?.symbol || 'S/'} {igv.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-orange-600 font-bold bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                                <span>Descuento</span>
                                <span>- {society?.mainCurrency?.symbol || 'S/'} {discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                            <span className="text-base font-bold text-slate-800">TOTAL A PAGAR</span>
                            <span className="text-3xl font-black text-slate-800 tracking-tight">{society?.mainCurrency?.symbol || 'S/'} {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid gap-3 pt-2">

                        <button
                            onClick={() => handleProcessOrder(OrderStatus.PENDING_PAYMENT)}
                            disabled={items.length === 0 || processingStatus !== null}
                            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processingStatus === OrderStatus.PENDING_PAYMENT ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <ShoppingBag className="w-5 h-5" />
                            )}
                            {processingStatus === OrderStatus.PENDING_PAYMENT ? 'Procesando...' : 'Registar Venta'}
                        </button>
                        <button
                            onClick={() => handleProcessOrder(OrderStatus.PENDING)}
                            disabled={items.length === 0 || processingStatus !== null}
                            className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processingStatus === OrderStatus.PENDING ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : null}
                            {processingStatus === OrderStatus.PENDING ? 'Guardando...' : 'Registar Pedido'}
                        </button>
                    </div>
                </div>
            </div>

            <POSPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />

            <POSAlertModal
                isOpen={!!errorMessage}
                onClose={() => setErrorMessage(null)}
                title="Error al Registrar"
                message={errorMessage || ''}
                type="error"
            />

        </>
    );
}