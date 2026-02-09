import { useState } from 'react';
import { X, Trash2, ShoppingBag, Pencil, Loader2 } from 'lucide-react';
import { useCartStore, selectTotalPrice } from '@/store/cart.store';
import { orderService, type CreateOrderRequest, OrderStatus } from '@/services/order.service';
import { useSocietyStore } from '@/store/society.store';
import { POSPaymentModal } from './POSPaymentModal';


interface POSCartPanelProps {
    isOpen: boolean;
    onClose: () => void;
    selectedClient: { id: string } | null;
    onSaleSuccess: () => void;
}

export function POSCartPanel({ isOpen, onClose, selectedClient, onSaleSuccess }: POSCartPanelProps) {
    const { items, removeItem, updateQuantity, updatePrice, discount, setDiscount, orderNotes, setOrderNotes, setCurrentOrder, clearCart, branchId, currencyId } = useCartStore();
    const society = useSocietyStore(state => state.society);
    const subtotal = useCartStore(selectTotalPrice);
    const igv = subtotal * 0.18;
    const total = subtotal + igv - (discount || 0);

    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleProcessOrder = async (targetStatus: OrderStatus = OrderStatus.PENDING_PAYMENT) => {
        if (items.length === 0) return;

        setIsProcessing(true);
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
                status: targetStatus, // Use the target status
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
            // Handle error (toast, etc)
        } finally {
            setIsProcessing(false);
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
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <ShoppingBag className="w-16 h-16 opacity-20" />
                            <p className="text-sm font-medium">El carrito está vacío</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.product.id} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-sky-100 hover:shadow-sm transition-all group">
                                {/* Product Image/Icon */}
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                    {/* Placeholder for image, using icon if no image */}
                                    <ShoppingBag className="w-6 h-6 text-slate-400" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-slate-700 text-sm truncate pr-2">
                                            {item.product.name}
                                        </h4>
                                        <button
                                            onClick={() => removeItem(item.product.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium">x{item.quantity}</span>
                                            <div className="relative group">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">S/</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.10"
                                                    value={item.product.price}
                                                    onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                                                    className="w-24 pl-6 pr-7 py-1 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/10 outline-none transition-all"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                    <Pencil className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quantity Input */}
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                                                className="w-16 h-8 text-center text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:border-sky-400 focus:ring-0 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-white border-t border-slate-100 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">

                    {/* Discount & Notes */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 block">
                                Descuento General
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">S/</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={discount || ''}
                                    placeholder="0.00"
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-sky-500 outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 block">
                                Comentarios de la orden
                            </label>
                            <textarea
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                placeholder="Agregar nota o instrucción..."
                                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-sky-500 outline-none resize-none h-20 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="pt-4 border-t border-dashed border-slate-200 space-y-2">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span>S/ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>IGV (18%)</span>
                            <span>S/ {igv.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                <span>Descuento</span>
                                <span>- S/ {discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-end pt-2">
                            <span className="text-base font-bold text-slate-800">TOTAL</span>
                            <span className="text-2xl font-black text-sky-600">S/ {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid gap-3 pt-2">
                        <button
                            onClick={() => handleProcessOrder(OrderStatus.PENDING_PAYMENT)}
                            disabled={items.length === 0 || isProcessing}
                            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <ShoppingBag className="w-5 h-5" />
                            )}
                            {isProcessing ? 'Procesando...' : 'Procesar Venta'}
                        </button>
                        <button
                            className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors active:scale-[0.98]"
                            onClick={() => handleProcessOrder(OrderStatus.PENDING)}
                            disabled={isProcessing}
                        >
                            Realizar otro pedido
                        </button>
                    </div>
                </div>
            </div>

            <POSPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </>
    );
}