import { useCartStore, selectTotalItems, selectTotalPrice } from './cart.store';
import { describe, it, expect, beforeEach } from 'vitest';

describe('cartStore', () => {
    const mockProduct1 = { id: 'p1', name: 'Product 1', price: '10.00' } as any;
    const mockProduct2 = { id: 'p2', name: 'Product 2', price: '20.00' } as any;

    beforeEach(() => {
        useCartStore.setState({
            items: [],
            discount: 0,
            orderNotes: '',
            currentOrderId: null,
            currentOrderCode: null,
            currentOrderTotal: 0,
            selectedClient: {
                id: 'public',
                name: 'Público General',
                documentNumber: '00000000'
            },
        });
        localStorage.clear();
    });

    it('should add a new item to the cart', () => {
        useCartStore.getState().addItem(mockProduct1, 2);

        const state = useCartStore.getState();
        expect(state.items).toHaveLength(1);
        expect(state.items[0].product.id).toBe('p1');
        expect(state.items[0].quantity).toBe(2);
        expect(state.items[0].subtotal).toBe(20);
    });

    it('should increment quantity if same product is added again', () => {
        useCartStore.getState().addItem(mockProduct1, 1);
        useCartStore.getState().addItem(mockProduct1, 2);

        const state = useCartStore.getState();
        expect(state.items).toHaveLength(1);
        expect(state.items[0].quantity).toBe(3);
        expect(state.items[0].subtotal).toBe(30);
    });

    it('should remove an item from the cart', () => {
        useCartStore.setState({
            items: [{ product: mockProduct1, quantity: 1, subtotal: 10, originalPrice: 10 }]
        });

        useCartStore.getState().removeItem('p1');

        const state = useCartStore.getState();
        expect(state.items).toHaveLength(0);
    });

    it('should update quantity and subtotal correctly', () => {
        useCartStore.setState({
            items: [{ product: mockProduct1, quantity: 1, subtotal: 10, originalPrice: 10 }]
        });

        useCartStore.getState().updateQuantity('p1', 5);

        const state = useCartStore.getState();
        expect(state.items[0].quantity).toBe(5);
        expect(state.items[0].subtotal).toBe(50);
    });

    it('should remove item if quantity is set to 0 or less', () => {
        useCartStore.setState({
            items: [{ product: mockProduct1, quantity: 1, subtotal: 10, originalPrice: 10 }]
        });

        useCartStore.getState().updateQuantity('p1', 0);

        const state = useCartStore.getState();
        expect(state.items).toHaveLength(0);
    });

    it('should update price and subtotal correctly', () => {
        useCartStore.setState({
            items: [{ product: mockProduct1, quantity: 2, subtotal: 20, originalPrice: 10 }]
        });

        useCartStore.getState().updatePrice('p1', 15);

        const state = useCartStore.getState();
        expect(state.items[0].product.price).toBe('15');
        expect(state.items[0].subtotal).toBe(30);
    });

    it('should calculate total items using selector', () => {
        useCartStore.setState({
            items: [
                { product: mockProduct1, quantity: 2, subtotal: 20, originalPrice: 10 },
                { product: mockProduct2, quantity: 3, subtotal: 60, originalPrice: 20 }
            ]
        });

        const totalItems = selectTotalItems(useCartStore.getState());
        expect(totalItems).toBe(5);
    });

    it('should calculate total price using selector', () => {
        useCartStore.setState({
            items: [
                { product: mockProduct1, quantity: 2, subtotal: 20, originalPrice: 10 },
                { product: mockProduct2, quantity: 3, subtotal: 60, originalPrice: 20 }
            ]
        });

        const totalPrice = selectTotalPrice(useCartStore.getState());
        expect(totalPrice).toBe(80);
    });

    it('should clear cart data', () => {
        useCartStore.setState({
            items: [{ product: mockProduct1, quantity: 1, subtotal: 10, originalPrice: 10 }],
            discount: 10,
            orderNotes: 'Notes'
        });

        useCartStore.getState().clearCart();

        const state = useCartStore.getState();
        expect(state.items).toHaveLength(0);
        expect(state.discount).toBe(0);
        expect(state.orderNotes).toBe('');
        expect(state.selectedClient?.id).toBe('public');
    });
});
