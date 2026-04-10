import { useState, useCallback } from 'react';
import { useCartStore, selectTotalItems, selectTotalPrice } from '@/store/cart.store';
import { useSocietyStore } from '@/store/society.store';
import { useBranchStore } from '@/store/branch.store';

import { useCreateSearchOrderMutation } from './useSearchMutations';
import { OrderStatus, type CreateOrderRequest } from '@/services/order.service';

export function useSearchCartFlow() {
    const society = useSocietyStore(state => state.society);
    const selectedBranch = useBranchStore(state => state.selectedBranch);
    const items = useCartStore(state => state.items);
    const discount = useCartStore(state => state.discount);
    const orderNotes = useCartStore(state => state.orderNotes);
    const currencyId = useCartStore(state => state.currencyId);
    const setCurrentOrder = useCartStore(state => state.setCurrentOrder);
    const clearCurrentOrder = useCartStore(state => state.clearCurrentOrder);
    const clearCart = useCartStore(state => state.clearCart);
    const selectedClient = useCartStore(state => state.selectedClient);
    const setSelectedClient = useCartStore(state => state.setSelectedClient);

    const totalItems = useCartStore(selectTotalItems);
    const totalPrice = useCartStore(selectTotalPrice);

    // ── Dialog States ──────────────────────────────────────────────────────
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isSelectClientModalOpen, setIsSelectClientModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [lastPaymentMethod, setLastPaymentMethod] = useState<string>('YAPE');


    const createOrder = useCreateSearchOrderMutation();

    const handleCreateOrder = useCallback(async () => {
        if (items.length === 0) return;

        const subtotal = totalPrice / 1.18;
        const igv = totalPrice - subtotal;
        const total = totalPrice - (discount || 0);

        const orderData = {
            societyId: society?.id || '1',
            branchId: selectedBranch?.id || '1',
            currencyId: society?.mainCurrency?.id || currencyId || '1',
            partnerId: selectedClient?.id && selectedClient.id !== 'public' ? selectedClient.id : '2',
            exchangeRate: 1.0,
            status: OrderStatus.PENDING_PAYMENT,
            subtotal: subtotal,
            taxAmount: igv,
            total: total,
            discount: discount || 0,
            notes: orderNotes || '',
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

        createOrder.mutate(orderData as unknown as CreateOrderRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    setCurrentOrder(response.data.id, response.data.orderCode, total);
                    clearCart();
                    setIsPaymentModalOpen(true);
                }
            }
        });
    }, [items, totalPrice, discount, society, selectedBranch, currencyId, selectedClient, orderNotes, createOrder, setCurrentOrder, clearCart]);

    return {
        // State
        selectedClient,
        setSelectedClient,
        isCartOpen,
        setIsCartOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        isSelectClientModalOpen,
        setIsSelectClientModalOpen,
        isAddClientModalOpen,
        setIsAddClientModalOpen,
        lastPaymentMethod,
        setLastPaymentMethod,
        totalItems,
        totalPrice,
        isCreatingOrder: createOrder.isPending,
        orderError: createOrder.error,
        resetOrderError: createOrder.reset,

        // Handlers
        handleCreateOrder,
        clearCart,
        clearCurrentOrder,
    };
}
