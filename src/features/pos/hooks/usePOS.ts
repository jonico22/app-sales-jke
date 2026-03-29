import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBranchStore } from '@/store/branch.store';
import { useCartStore } from '@/store/cart.store';
import { useCashShift } from '@/hooks/useCashShift';
import type { Client, ClientSelectOption } from '@/services/client.service';
import type { Product } from '@/services/product.service';

/**
 * usePOS Hook
 * 
 * Centralizes state and handlers for the Point of Sale (POS) feature.
 * Optimized for performance using useCallback and granular state management.
 */
export function usePOS() {
  const { selectedBranch } = useBranchStore();
  const [selectedClient, setSelectedClient] = useState<ClientSelectOption | null>({
    id: 'public', // Default mock ID
    name: 'Público General',
    documentNumber: '00000000'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [productsRefreshTrigger, setProductsRefreshTrigger] = useState(0);
  
  const { 
    clearCurrentOrder, 
    currentOrderCode, 
    currentOrderTotal,
    addItem: addItemToCart 
  } = useCartStore();
  
  const [lastPaymentMethod, setLastPaymentMethod] = useState<string>('CASH');
  const processingCloneRef = useRef<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { currentShift, isShiftOpen, isLoading: isShiftLoading, refresh: refreshShift } = useCashShift();

  /**
   * Effect: Handle "Resume/Clone" order from Pending Orders
   * Centralized here to avoid duplication in page and hook.
   */
  useEffect(() => {
    const handleCloneOrder = async () => {
      if (location.state && (location.state as any).cloneFromOrderId) {
        const orderId = (location.state as any).cloneFromOrderId;

        // Prevent duplicate processing during re-renders
        if (processingCloneRef.current === orderId) {
          return;
        }
        processingCloneRef.current = orderId;

        try {
          const { orderService } = await import('@/services/order.service');
          const response = await orderService.getById(orderId);

          if (response.success && response.data && response.data.orderItems) {
            clearCurrentOrder(); // Ensure clean slate
            const { productService } = await import('@/services/product.service');
            
            // Parallel fetch all products (Rule async-parallel)
            const productResults = await Promise.all(
              response.data.orderItems.map(async (item) => {
                try {
                  const productRes = await productService.getById(item.productId);
                  return { productRes, quantity: item.quantity };
                } catch (e) {
                  console.error(`Failed to fetch product ${item.productId} for cloning`, e);
                  return null;
                }
              })
            );

            // Add all valid products to cart
            let addedCount = 0;
            productResults.forEach((result) => {
              if (result && result.productRes.success && result.productRes.data) {
                addItemToCart(result.productRes.data, result.quantity);
                addedCount++;
              }
            });

            // Open the cart panel if items were added
            if (addedCount > 0) {
              setIsCartOpen(true);
            }
          }
        } catch (error) {
          console.error('Error loading order for cloning:', error);
        }

        // Clean up location state so logic doesn't re-run on browser reload
        window.history.replaceState({}, document.title);

        // Reset ref after a delay to allow future cloning if needed
        setTimeout(() => {
          processingCloneRef.current = null;
        }, 1000);
      }
    };

    handleCloneOrder();
  }, [location, clearCurrentOrder, addItemToCart]);

  /**
   * Handlers (Memoized for performance)
   */

  const handleClientSuccess = useCallback((client: Client) => {
    const newClient: ClientSelectOption = {
      id: client.id,
      name: client.name || `${client.firstName} ${client.lastName}`.trim(),
      documentNumber: client.documentNumber || ''
    };
    setSelectedClient(newClient);
    setIsAddClientModalOpen(false);
  }, []);

  const handleProductSelect = useCallback((product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      addItemToCart(product);
      // Brief timeout to show selection feedback before clearing search input
      setTimeout(() => setSelectedProduct(null), 100);
    }
  }, [addItemToCart]);

  const handleCartOpen = useCallback(() => {
    setIsCartOpen(true);
    setSelectedProduct(null);
  }, []);

  const handleSaleSuccess = useCallback(() => {
    setIsPaymentModalOpen(true);
    setSelectedProduct(null);
    setProductsRefreshTrigger(prev => prev + 1);
  }, []);

  const handlePaymentSuccess = useCallback((paymentMethod: string) => {
    setLastPaymentMethod(paymentMethod);
    setIsPaymentModalOpen(false);
    setIsSuccessModalOpen(true);
    setSelectedProduct(null);
    setProductsRefreshTrigger(prev => prev + 1);
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
    clearCurrentOrder();
  }, [clearCurrentOrder]);

  const openAddClientModal = useCallback(() => setIsAddClientModalOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const closePaymentModal = useCallback(() => setIsPaymentModalOpen(false), []);

  return {
    // State
    selectedBranch,
    selectedClient,
    setSelectedClient,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    isAddClientModalOpen,
    setIsAddClientModalOpen,
    isCartOpen,
    setIsCartOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isSuccessModalOpen,
    productsRefreshTrigger,
    currentOrderCode,
    currentOrderTotal,
    lastPaymentMethod,
    currentShift,
    isShiftOpen,
    isShiftLoading,

    // Handlers
    refreshShift,
    handleClientSuccess,
    handleProductSelect,
    handleCartOpen,
    handleSaleSuccess,
    handlePaymentSuccess,
    handleCloseSuccessModal,
    openAddClientModal,
    closeCart,
    closePaymentModal,
    navigate,
  };
}

