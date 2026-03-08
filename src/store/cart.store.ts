import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/services/product.service';

export interface CartItem {
    product: Product;
    quantity: number;
    subtotal: number;
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


            addItem: (product: Product, quantity = 1) => {
                const currentItems = get().items;
                const existingItemIndex = currentItems.findIndex(
                    (item) => item.product.id === product.id
                );

                if (existingItemIndex > -1) {
                    // Update existing
                    const newItems = [...currentItems];
                    const existingItem = newItems[existingItemIndex];
                    const newQuantity = existingItem.quantity + quantity;

                    newItems[existingItemIndex] = {
                        ...existingItem,
                        quantity: newQuantity,
                        subtotal: Number(product.price) * newQuantity
                    };

                    set({ items: newItems });
                } else {
                    // Add new
                    set({
                        items: [
                            ...currentItems,
                            {
                                product,
                                quantity,
                                subtotal: Number(product.price) * quantity
                            }
                        ]
                    });
                }
            },

            removeItem: (productId: string) => {
                set({
                    items: get().items.filter((item) => item.product.id !== productId)
                });
            },

            updateQuantity: (productId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                const currentItems = get().items;
                const itemIndex = currentItems.findIndex(
                    (item) => item.product.id === productId
                );

                if (itemIndex > -1) {
                    const newItems = [...currentItems];
                    const item = newItems[itemIndex];

                    newItems[itemIndex] = {
                        ...item,
                        quantity,
                        subtotal: Number(item.product.price) * quantity
                    };

                    set({ items: newItems });
                }
            },

            updatePrice: (productId: string, price: number) => {
                const currentItems = get().items;
                const itemIndex = currentItems.findIndex(
                    (item) => item.product.id === productId
                );

                if (itemIndex > -1) {
                    const newItems = [...currentItems];
                    const item = newItems[itemIndex];

                    // Update the product price in the cart item context (not the global product definition, effectively override)
                    // We need to be careful if we are mutating the product object directly or if we should store an 'overridePrice'
                    // For simplicity in this cart structure, we'll assume we can update the product price within the cart item or add a price field to CartItem.
                    // However, CartItem has `product: Product`. 
                    // Let's shallow copy the product to avoid affecting the global reference if shared (though strictly it shouldn't be mutable globally).
                    // Or better, strictly speaking, CartItem should probably have `price` separate from `product.price` if overrides are allowed.
                    // But to minimize refactor, I will update the product object copy in the item.

                    const updatedProduct = { ...item.product, price: String(price) };

                    newItems[itemIndex] = {
                        ...item,
                        product: updatedProduct,
                        subtotal: price * item.quantity
                    };

                    set({ items: newItems });
                }
            },

            clearCart: () => set({ items: [], discount: 0, orderNotes: '' }),
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
