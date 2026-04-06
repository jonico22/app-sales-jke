import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/services/product.service';
import type { ClientSelectOption } from '@/services/client.service';

export interface CartItem {
    product: Product;
    quantity: number;
    subtotal: number;
    originalPrice: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updatePrice: (productId: string, price: number) => void;
    clearCart: () => void;
    discount: number;
    setDiscount: (discount: number) => void;
    orderNotes: string;
    setOrderNotes: (notes: string) => void;
    currentOrderId: string | null;
    currentOrderCode: string | null;
    currentOrderTotal: number;
    setCurrentOrder: (orderId: string, orderCode: string, total: number) => void;
    clearCurrentOrder: () => void;
    branchId: string;
    setBranchId: (id: string) => void;
    currencyId: string;
    setCurrencyId: (id: string) => void;
    selectedClient: ClientSelectOption | null;
    setSelectedClient: (client: ClientSelectOption | null) => void;

    // Computed (handled via getters/selectors in component or derived state if needed, 
    // but simple getters here for convenience if we wanted, though Zustand recommends selectors)
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            discount: 0,
            orderNotes: '',

            setDiscount: (discount: number) => set({ discount }),
            setOrderNotes: (notes: string) => set({ orderNotes: notes }),
            currentOrderId: null,
            currentOrderCode: null,
            currentOrderTotal: 0,
            setCurrentOrder: (orderId: string, orderCode: string, total: number) => set({ currentOrderId: orderId, currentOrderCode: orderCode, currentOrderTotal: total }),
            clearCurrentOrder: () => set({ currentOrderId: null, currentOrderCode: null, currentOrderTotal: 0 }),
            branchId: '1', // Default
            setBranchId: (id: string) => set({ branchId: id }),
            currencyId: '1', // Default
            setCurrencyId: (id: string) => set({ currencyId: id }),
            selectedClient: {
                id: 'public',
                name: 'Público General',
                documentNumber: '00000000'
            },
            setSelectedClient: (client: ClientSelectOption | null) => set({ selectedClient: client }),


            addItem: (product: Product, quantity = 1) => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex(
                        (item) => item.product.id === product.id
                    );

                    if (existingItemIndex > -1) {
                        const newItems = [...state.items];
                        const existingItem = newItems[existingItemIndex];
                        const newQuantity = existingItem.quantity + quantity;

                        newItems[existingItemIndex] = {
                            ...existingItem,
                            quantity: newQuantity,
                            subtotal: Number(product.price) * newQuantity
                        };

                        return { items: newItems };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                product,
                                quantity,
                                subtotal: Number(product.price) * quantity,
                                originalPrice: Number(product.price)
                            }
                        ]
                    };
                });
            },

            removeItem: (productId: string) => {
                set((state) => ({
                    items: state.items.filter((item) => item.product.id !== productId)
                }));
            },

            updateQuantity: (productId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set((state) => {
                    const itemIndex = state.items.findIndex(
                        (item) => item.product.id === productId
                    );

                    if (itemIndex > -1) {
                        const newItems = [...state.items];
                        const item = newItems[itemIndex];

                        newItems[itemIndex] = {
                            ...item,
                            quantity,
                            subtotal: Number(item.product.price) * quantity
                        };

                        return { items: newItems };
                    }
                    return state;
                });
            },

            updatePrice: (productId: string, price: number) => {
                set((state) => {
                    const itemIndex = state.items.findIndex(
                        (item) => item.product.id === productId
                    );

                    if (itemIndex > -1) {
                        const newItems = [...state.items];
                        const item = newItems[itemIndex];
                        const updatedProduct = { ...item.product, price: String(price) };

                        newItems[itemIndex] = {
                            ...item,
                            product: updatedProduct,
                            subtotal: price * item.quantity
                        };

                        return { items: newItems };
                    }
                    return state;
                });
            },

            clearCart: () => set({ 
                items: [], 
                discount: 0, 
                orderNotes: '',
                selectedClient: {
                    id: 'public',
                    name: 'Público General',
                    documentNumber: '00000000'
                }
            }),
        }),
        {
            name: 'pos-cart-storage', // unique name
        }
    )
);

// Selectors for convenience
export const selectTotalItems = (state: CartState) =>
    state.items.reduce((total, item) => total + item.quantity, 0);

export const selectTotalPrice = (state: CartState) =>
    state.items.reduce((total, item) => total + item.subtotal, 0);
