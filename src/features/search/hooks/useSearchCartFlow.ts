import { useState, useCallback } from 'react';
import { useCartStore, selectTotalItems, selectTotalPrice } from '@/store/cart.store';
import { useSocietyStore } from '@/store/society.store';
import { useBranchStore } from '@/store/branch.store';
import { type ClientSelectOption } from '@/services/client.service';
import { useCreateSearchOrderMutation } from './useSearchMutations';
import { OrderStatus, type CreateOrderRequest } from '@/services/order.service';

export function useSearchCartFlow() {
    const society = useSocietyStore(state => state.society);
    const { selectedBranch } = useBranchStore();
    const { 
        items, 
        discount, 
        orderNotes, 
        currencyId, 
        setCurrentOrder, 
        clearCurrentOrder, 
        clearCart
    } = useCartStore();

    const totalItems = useCartStore(selectTotalItems);
    const totalPrice = useCartStore(selectTotalPrice);

    // ── Dialog States ──────────────────────────────────────────────────────
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isSelectClientModalOpen, setIsSelectClientModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [lastPaymentMethod, setLastPaymentMethod] = useState<string>('CASH');

    const [selectedClient, setSelectedClient] = useState<ClientSelectOption | null>({
        id: 'public',
        name: 'Público General',
        documentNumber: '00000000'
    });

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
                return {
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: price,
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

        // Handlers
        handleCreateOrder,
        clearCart,
        clearCurrentOrder,
    };
}
