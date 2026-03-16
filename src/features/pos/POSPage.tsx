import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { POSWelcomeHeader } from './components/POSWelcomeHeader';
import { CashOpeningBanner } from './components/CashOpeningBanner';
import { CashClosingBanner } from './components/CashClosingBanner';
import { useBranchStore } from '@/store/branch.store';
import { POSClientSelector } from './components/POSClientSelector';
import { POSProductSearch } from './components/POSProductSearch';
import { POSCatalogButton } from './components/POSCatalogButton';
import { POSQuickActions } from './components/POSQuickActions';
import { POSFloatingCart } from './components/POSFloatingCart';
import { POSCartPanel } from './components/POSCartPanel';
import { POSMobileFooter } from './components/POSMobileFooter';
import { POSTopBar } from './components/POSTopBar';
import { POSPaymentModal } from './components/POSPaymentModal';
import { POSSuccessModal } from './components/POSSuccessModal';
import { useCartStore } from '@/store/cart.store';
import { useCashShift } from '@/hooks/useCashShift';
import { AddClientModal } from './components/AddClientModal'; // Import Modal
import type { ClientSelectOption } from '@/services/client.service';
import type { Product } from '@/services/product.service';

export default function POSPage() {
  const { selectedBranch } = useBranchStore();
  const [selectedClient, setSelectedClient] = useState<ClientSelectOption | null>({
    id: 'public', // Mock ID for default
    name: 'Público General',
    documentNumber: '00000000'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false); // Modal State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [productsRefreshTrigger, setProductsRefreshTrigger] = useState(0);
  const { clearCurrentOrder, currentOrderCode, currentOrderTotal } = useCartStore();
  const [lastPaymentMethod, setLastPaymentMethod] = useState<string>('CASH');
  const processingCloneRef = useRef<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const addItemToCart = useCartStore(state => state.addItem);

  // Handle "Resume/Clone" order from Pending Orders
  useEffect(() => {
    const handleCloneOrder = async () => {

      if (location.state && (location.state as any).cloneFromOrderId) {
        const orderId = (location.state as any).cloneFromOrderId;

        // Prevent duplicate processing
        if (processingCloneRef.current === orderId) {
          console.log('[CLONE] Already processing order:', orderId);
          return;
        }
        processingCloneRef.current = orderId;

        try {
          const response = await import('@/services/order.service').then(m => m.orderService.getById(orderId));


          if (response.success && response.data && response.data.orderItems) {

            clearCurrentOrder(); // Ensure clean slate
            const productService = await import('@/services/product.service').then(m => m.productService);
            for (const item of response.data.orderItems) {
              try {

                const productRes = await productService.getById(item.productId);

                if (productRes.success && productRes.data) {
                  const product = productRes.data;

                  // Add item directly with quantity
                  addItemToCart(product, item.quantity);
                } else {
                  console.warn('[CLONE] Product fetch failed:', productRes);
                }
              } catch (e) {
                console.error("[CLONE] Failed to load product for clone", item.productId, e);
              }
            }

            // Open the cart panel to show the added items
            if (response.data.orderItems.length > 0) {
              setIsCartOpen(true);
            }
          } else {
            console.warn('[CLONE] No items found in order or fetch failed');
          }
        } catch (error) {
          console.error('[CLONE] Error cloning order:', error);
        }


        // Clean up state so it doesn't run again on reload
        window.history.replaceState({}, document.title);

        // Reset ref after a delay to allow re-cloning if needed (though location state is cleared)
        setTimeout(() => {
          processingCloneRef.current = null;
        }, 1000);

      }
    };

    handleCloneOrder();
  }, [location]);


  const handleClientRegistered = (newClient: ClientSelectOption) => {
    setSelectedClient(newClient);
    setIsAddClientModalOpen(false);
  };

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      addItemToCart(product);
      // Clear selected product after adding to cart
      setTimeout(() => setSelectedProduct(null), 100);
    }
  };

  const handleCartOpen = () => {
    setIsCartOpen(true);
    // Clear selected product when cart opens
    setSelectedProduct(null);
  };



  const { currentShift, isShiftOpen, isLoading: isShiftLoading, refresh } = useCashShift();

  return (
    <div className=" bg-background pb-24 md:pb-6 md:pt-6 p-4 md:p-6 min-h-[calc(100vh-64px)]">
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">

        {/* Top Bar */}
        <POSTopBar />

        {/* Cash Opening Banner */}
        {/* Cash Banners (Opening/Closing) - Layout Stability */}
        {isShiftLoading ? (
          <CashOpeningBanner isLoading={true} />
        ) : !isShiftOpen ? (
          <CashOpeningBanner refreshShift={refresh} />
        ) : (
          <CashClosingBanner 
            branchName={selectedBranch?.name}
            onCloseCash={() => navigate(`/pos/cash-closing/${currentShift?.id}`)}
          />
        )}

        {/* Header Section */}
        <POSWelcomeHeader />


        {/* Main Card */}
        <div className="bg-card md:rounded-2xl md:border md:border-border md:shadow-sm md:p-6 space-y-6">
          {/* Client Selector */}
          <POSClientSelector
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
            onNewClient={() => setIsAddClientModalOpen(true)}
          />

          {/* Product Search */}
          <POSProductSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAdvancedSearch={() => { }}
            selectedProduct={selectedProduct}
            onSelectProduct={handleProductSelect}
            refreshTrigger={productsRefreshTrigger}
          />

          {/* View Catalog Button */}
          <POSCatalogButton onClick={() => navigate('/pos/search')} />

          {/* Quick Actions */}
          <POSQuickActions
            onHistoryClick={() => { }}
            onShortcutsClick={() => { }}
            onHelpClick={() => { }}
          />
        </div>



        {/* Floating Cart Button */}
        <POSFloatingCart onClick={handleCartOpen} />

        {/* Cart Panel */}
        <POSCartPanel
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          selectedClient={selectedClient}
          onSaleSuccess={() => {
            setIsPaymentModalOpen(true);
            // Clear selected product when order is created
            setSelectedProduct(null);
            // Refresh products explicitly
            setProductsRefreshTrigger(prev => prev + 1);
          }}
        />

        {/* Payment Modal placed here to persist when CartPanel is unmounted/hidden */}
        <POSPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={(paymentMethod: string) => {
            // Save payment method for success modal
            setLastPaymentMethod(paymentMethod);
            // Close payment modal and open success modal
            setIsPaymentModalOpen(false);
            setIsSuccessModalOpen(true);
            // Clear selected product after successful payment
            setSelectedProduct(null);
            // Refresh products explicitly
            setProductsRefreshTrigger(prev => prev + 1);
          }}
        />

        {/* Success Modal */}
        <POSSuccessModal
          isOpen={isSuccessModalOpen}
          orderCode={currentOrderCode || ''}
          clientName={selectedClient?.name || 'Cliente'}
          paymentMethod={lastPaymentMethod}
          total={currentOrderTotal}
          onClose={() => {
            setIsSuccessModalOpen(false);
            clearCurrentOrder();
          }}
          onPrintTicket={() => {
            // TODO: Implement print ticket functionality
            console.log('Print ticket');
          }}
          onShareWhatsApp={() => {
            // TODO: Implement WhatsApp share functionality
            console.log('Share via WhatsApp');
          }}
        />

        {/* Mobile Footer */}
        <POSMobileFooter />



        {/* Add Client Modal */}
        <AddClientModal
          isOpen={isAddClientModalOpen}
          onClose={() => setIsAddClientModalOpen(false)}
          onClientRegistered={handleClientRegistered}
        />

      </div>
    </div>
  );
}
