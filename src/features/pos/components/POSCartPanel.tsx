import { memo, useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, selectTotalPrice } from '@/store/cart.store';
import { OrderStatus } from '@/services/order.service';
import { useCreateOrderMutation } from '@/features/orders/hooks/useOrderQueries';
import { useSocietyStore } from '@/store/society.store';
import { useBranchStore } from '@/store/branch.store';
import { POSPaymentModal } from './POSPaymentModal';
import { POSAlertModal } from './POSAlertModal';
import { parseBackendError } from '@/utils/error.utils';
import type { AxiosError } from 'axios';


interface POSCartPanelProps {
    isOpen: boolean;
    onClose: () => void;
    selectedClient: { id: string } | null;
    onSaleSuccess: () => void;
}

export const POSCartPanel = memo(function POSCartPanel({ isOpen, onClose, selectedClient, onSaleSuccess }: POSCartPanelProps) {
    // Using granular selectors instead of destructuring the state (Rule rerender-defer-reads)
    const items = useCartStore(state => state.items);
    const removeItem = useCartStore(state => state.removeItem);
    const updateQuantity = useCartStore(state => state.updateQuantity);
    const updatePrice = useCartStore(state => state.updatePrice);
    const discount = useCartStore(state => state.discount);
    const setDiscount = useCartStore(state => state.setDiscount);
    const orderNotes = useCartStore(state => state.orderNotes);
    const setOrderNotes = useCartStore(state => state.setOrderNotes);
    const setCurrentOrder = useCartStore(state => state.setCurrentOrder);
    const clearCart = useCartStore(state => state.clearCart);
    const currencyId = useCartStore(state => state.currencyId);

    const society = useSocietyStore(state => state.society);
    const selectedBranch = useBranchStore(state => state.selectedBranch);
    const totalWithTax = useCartStore(selectTotalPrice);
    const subtotal = totalWithTax / 1.18;
    const igv = totalWithTax - subtotal;
    const total = totalWithTax - (discount || 0);

    const [processingStatus, setProcessingStatus] = useState<OrderStatus | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showNotes, setShowNotes] = useState(false);

    const { mutate: createOrder } = useCreateOrderMutation();

    const handleProcessOrder = (targetStatus: OrderStatus = OrderStatus.PENDING_PAYMENT) => {
        if (items.length === 0) return;

        setProcessingStatus(targetStatus);

        // Construct Order Request with correct IDs from stores
        const orderData = {
            societyId: society?.id || '',
            branchId: selectedBranch?.id || '',
            currencyId: society?.mainCurrency?.id || currencyId || '',
            partnerId: selectedClient?.id && selectedClient.id !== 'public' ? selectedClient.id : '2', // Fallback for public client if needed by API

            exchangeRate: 1.0,
            status: targetStatus, // Use the target status (PENDING or PENDING_PAYMENT)
            subtotal: subtotal,
            taxAmount: igv,
            total: total,
            discount: discount || 0,
            notes: orderNotes,
            orderItems: items.map(item => {
                const price = Number(item.product.price);
                const itemDiscount = (item.originalPrice - price) * item.quantity;
                return {
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: price,
                    discount: itemDiscount > 0 ? itemDiscount : 0,
                    total: price * item.quantity
                };
            })
        };

        // Validation: Ensure we have required IDs
        if (!orderData.societyId || !orderData.branchId) {
            setErrorMessage('Información de sucursal o sociedad no disponible.');
            setProcessingStatus(null);
            return;
        }

        createOrder(orderData, {
            onSuccess: (response) => {
                if (response.data) {
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
                setProcessingStatus(null);
            },
            onError: (error: AxiosError<{ message?: string }>) => {
                console.error('Failed to create order', error);
                const message = parseBackendError(error);
                setErrorMessage(message);
                setProcessingStatus(null);
            }
        });
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        onClose(); // Close cart panel
        clearCart(); // Clear cart after successful payment
        // Optionally show success message
    };

    // Lock body scroll when cart is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 h-full backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed inset-y-0 right-0 h-full w-full max-w-md bg-card shadow-2xl border-l border-border z-50 flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">Venta Actual</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background min-h-[120px] custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 min-h-[150px]">
                            <ShoppingBag className="w-16 h-16 opacity-10" />
                            <p className="text-sm font-medium">El carrito está vacío</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.product.id} className="relative bg-transparent border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm line-clamp-1 pr-6">
                                            {item.product.name}
                                        </h4>
                                        {(item.product.brand || item.product.description) && (
                                            <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                                {item.product.brand || item.product.description}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.product.id)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors absolute top-2 right-2"
                                        title="Quitar artículo"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-end justify-between">
                                    {/* Quantity Stepper */}
                                    <div className="flex items-center p-1 gap-1">
                                        <button
                                            onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                            className="w-8 h-8 flex items-center justify-center bg-background border-2 border-input text-muted-foreground rounded-lg hover:border-border hover:text-foreground transition-all active:scale-95"
                                        >
                                            <span className="text-lg leading-none font-bold mb-0.5">−</span>
                                        </button>
                                        <span className="w-8 text-center font-bold text-foreground text-sm">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all active:scale-95"
                                        >
                                            <span className="text-lg leading-none font-bold mb-0.5">+</span>
                                        </button>
                                    </div>

                                    {/* Price Input */}
                                    <div className="text-right">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                                            Precio Unit.
                                        </label>
                                        <div className="relative group/price">
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/80">
                                                {society?.mainCurrency?.symbol || 'S/'}
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.10"
                                                value={item.product.price}
                                                onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                                                className="w-24 pl-7 pr-2 py-1.5 text-right text-xs font-bold text-primary bg-primary/10 border border-primary/30 rounded-md hover:bg-primary/20 hover:border-primary/50 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-text shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-card border-t border-border flex flex-col gap-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-10 relative shrink-0">

                    {/* Discount & Notes */}
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5 sm:mb-2">
                                <span>Descuento Global</span>
                                {discount > 0 && (
                                    <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                                        Aplicado
                                    </span>
                                )}
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${discount > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                                    <ShoppingBag className="w-4 h-4 rotate-12" />
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    value={discount || ''}
                                    placeholder="Ej. 10.00"
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    className={`w-full pl-10 pr-4 py-2 sm:py-3 text-sm font-medium border rounded-xl outline-none transition-all ${discount > 0
                                        ? 'bg-orange-50/50 border-orange-200 text-orange-700 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 placeholder:text-orange-300'
                                        : 'bg-muted border-input text-foreground focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10'
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
                            <button
                                type="button"
                                onClick={() => setShowNotes(!showNotes)}
                                className="flex items-center justify-between w-full text-left focus:outline-none mb-1.5 sm:mb-2 group"
                            >
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider group-hover:text-foreground transition-colors">
                                    Comentarios {orderNotes ? '(Añadidos)' : ''}
                                </span>
                                {showNotes ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                )}
                            </button>
                            {showNotes && (
                                <div className="mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <textarea
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        placeholder="Notas adicionales del pedido..."
                                        className="w-full p-3 sm:p-4 text-sm bg-muted border border-input rounded-xl focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 outline-none resize-none h-16 sm:h-24 transition-all placeholder:text-muted-foreground"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="flex flex-col gap-1.5 sm:gap-2">
                        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{society?.mainCurrency?.symbol || 'S/'} {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                            <span>IGV (18%)</span>
                            <span>{society?.mainCurrency?.symbol || 'S/'} {igv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-xs sm:text-sm text-orange-600 font-bold bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-100 dark:border-orange-500/20">
                                <span>Descuento</span>
                                <span>- {society?.mainCurrency?.symbol || 'S/'} {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-border">
                            <span className="text-sm font-bold text-foreground">TOTAL A PAGAR</span>
                            <span className="text-lg font-black text-foreground tracking-tight">{society?.mainCurrency?.symbol || 'S/'} {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-1">

                        <Button
                            onClick={() => handleProcessOrder(OrderStatus.PENDING_PAYMENT)}
                            disabled={items.length === 0 || processingStatus !== null}
                            variant="primary"
                            className="w-full h-10 shadow-md shadow-primary/20 flex items-center justify-center gap-2 text-sm"
                        >
                            {processingStatus === OrderStatus.PENDING_PAYMENT ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ShoppingBag className="w-4 h-4" />
                            )}
                            {processingStatus === OrderStatus.PENDING_PAYMENT ? 'Procesando...' : 'Registar Venta'}
                        </Button>
                        <Button
                            onClick={() => handleProcessOrder(OrderStatus.PENDING)}
                            disabled={items.length === 0 || processingStatus !== null}
                            variant="outline"
                            className="w-full h-9 flex items-center justify-center gap-2 text-sm bg-background hover:bg-muted border-input text-foreground"
                        >
                            {processingStatus === OrderStatus.PENDING ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : null}
                            {processingStatus === OrderStatus.PENDING ? 'Guardando...' : 'Registar Pedido'}
                        </Button>
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
});