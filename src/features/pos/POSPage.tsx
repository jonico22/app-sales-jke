import { useState } from 'react';
import { POSWelcomeHeader } from './components/POSWelcomeHeader';
import { POSClientSelector } from './components/POSClientSelector';
import { POSProductSearch } from './components/POSProductSearch';
import { POSCatalogButton } from './components/POSCatalogButton';
import { POSQuickActions } from './components/POSQuickActions';
import { POSFloatingCart } from './components/POSFloatingCart';
import { POSCartPanel } from './components/POSCartPanel';
import { POSMobileFooter } from './components/POSMobileFooter';
import { POSTopBar } from './components/POSTopBar';
import { useCartStore } from '@/store/cart.store';
import { AddClientModal } from './components/AddClientModal'; // Import Modal
import type { ClientSelectOption } from '@/services/client.service';
import type { Product } from '@/services/product.service';

export default function POSPage() {
  const [selectedClient, setSelectedClient] = useState<ClientSelectOption | null>({
    id: 'public', // Mock ID for default
    name: 'Público General',
    documentNumber: '00000000'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false); // Modal State
  const [isCartOpen, setIsCartOpen] = useState(false);



  const addItemToCart = useCartStore(state => state.addItem);


  const handleClientRegistered = (newClient: ClientSelectOption) => {
    setSelectedClient(newClient);
    setIsAddClientModalOpen(false);
  };

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      addItemToCart(product);
      setIsCartOpen(true); // Open cart when product is added
    }
  };



  return (
    <div className=" bg-white pb-24 md:pb-6 md:pt-6 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">

        {/* Top Bar */}
        <POSTopBar />

        {/* Header Section */}
        <POSWelcomeHeader />

        {/* Main Card */}
        <div className="bg-white md:rounded-2xl md:border md:border-slate-100 md:shadow-sm md:p-6 space-y-6">
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
          />

          {/* View Catalog Button */}
          <POSCatalogButton onClick={() => { }} />

          {/* Quick Actions */}
          <POSQuickActions
            onHistoryClick={() => { }}
            onShortcutsClick={() => { }}
            onHelpClick={() => { }}
          />
        </div>



        {/* Floating Cart Button */}
        <POSFloatingCart onClick={() => setIsCartOpen(true)} />

        {/* Cart Panel */}
        <POSCartPanel
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
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
