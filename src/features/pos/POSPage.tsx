import { usePOS } from './hooks/usePOS';
import { POSWelcomeHeader } from './components/POSWelcomeHeader';
import { CashOpeningBanner } from './components/CashOpeningBanner';
import { CashClosingBanner } from './components/CashClosingBanner';
import { POSClientSelector } from './components/POSClientSelector';
import { POSProductSearch } from './components/POSProductSearch';
import { POSCatalogButton } from './components/POSCatalogButton';
import { POSQuickActions } from './components/POSQuickActions';
import { POSFloatingCart } from './components/POSFloatingCart';
import { POSCartPanel } from './components/POSCartPanel';
import { POSMobileFooter } from './components/POSMobileFooter';
import { POSPaymentModal } from './components/POSPaymentModal';
import { POSSuccessModal } from './components/POSSuccessModal';
import { ClientEditModal } from '../sales/clients/components/ClientEditModal';

export default function POSPage() {
  const {
    selectedBranch,
    selectedClient,
    setSelectedClient,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    isAddClientModalOpen,
    setIsAddClientModalOpen,
    isCartOpen,
    productsRefreshTrigger,
    currentOrderCode,
    currentOrderTotal,
    lastPaymentMethod,
    currentShift,
    isShiftOpen,
    isShiftLoading,
    isPaymentModalOpen,
    isSuccessModalOpen,
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
  } = usePOS();

  return (
    <div className=" bg-background pb-20 md:pb-6 md:pt-6 p-2 md:p-6 min-h-[calc(100vh-64px)]">
      <div className="max-w-3xl mx-auto space-y-4 md:space-y-8">

        {/* Cash Banners (Opening/Closing) - Layout Stability */}
        {isShiftLoading ? (
          <CashOpeningBanner isLoading={true} />
        ) : !isShiftOpen ? (
          <CashOpeningBanner refreshShift={refreshShift} />
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
            onNewClient={openAddClientModal}
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
          onClose={closeCart}
          selectedClient={selectedClient}
          onSaleSuccess={handleSaleSuccess}
        />

        {/* Payment Modal */}
        <POSPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          onPaymentSuccess={handlePaymentSuccess}
        />

        {/* Success Modal */}
        <POSSuccessModal
          isOpen={isSuccessModalOpen}
          orderCode={currentOrderCode || ''}
          clientName={selectedClient?.name || 'Cliente'}
          paymentMethod={lastPaymentMethod}
          total={currentOrderTotal}
          onClose={handleCloseSuccessModal}
          onPrintTicket={() => {
            // TODO: Implement print ticket functionality
          }}
          onShareWhatsApp={() => {
            // TODO: Implement WhatsApp share functionality
          }}
        />

        {/* Mobile Footer */}
        <POSMobileFooter />

        {/* Client Edit/Add Modal */}
        <ClientEditModal
          open={isAddClientModalOpen}
          onOpenChange={setIsAddClientModalOpen}
          client={null}
          onSave={() => {}}
          onSuccess={handleClientSuccess}
        />

      </div>
    </div>
  );
}

