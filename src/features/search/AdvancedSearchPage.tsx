import { useState, useRef, useCallback, useEffect } from 'react';
import { FilterSidebar } from './components/FilterSidebar';
import { SearchHeader } from './components/SearchHeader';
import { SearchCashBanners } from './components/SearchCashBanners';
import { SearchClientHeader } from './components/SearchClientHeader';
import { SearchProductGrid } from './components/SearchProductGrid';
import { SearchCartFooter } from './components/SearchCartFooter';
import { useBranchStore } from '@/store/branch.store';
import { useSocietyStore } from '@/store/society.store';
import { ClientEditModal } from '../sales/clients/components/ClientEditModal';
import { SelectClientModal } from '../pos/components/SelectClientModal';
import { type Client } from '@/services/client.service';
import { POSCartPanel } from '../pos/components/POSCartPanel';
import { useCashShift } from '@/hooks/useCashShift';
import { POSPaymentModal } from '../pos/components/POSPaymentModal';
import { POSSuccessModal } from '../pos/components/POSSuccessModal';
import { POSAlertModal } from '../pos/components/POSAlertModal';
import { useClients } from '@/hooks/useClients';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AdvancedFilterModal } from './components/AdvancedFilterModal';
import { useSearchFilters, type QuickFilter, type SearchFilters } from './hooks/useSearchFilters';
import { useSearchCartFlow } from './hooks/useSearchCartFlow';
import { useSearchProductsInfiniteQuery, useSearchFavoritesQuery, useSearchMetadataQuery, useBestSellersQuery } from './hooks/useSearchQueries';
import { useToggleFavoriteMutation } from './hooks/useSearchMutations';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateProductRelatedCaches } from '@/features/inventory/hooks/useProductQueries';
import { parseBackendError } from '@/utils/error.utils';

export default function AdvancedSearchPage() {
    const { data: categories = [] } = useCategories();
    const { data: brands = [] } = useBrands();
    const { selectedBranch } = useBranchStore();
    const society = useSocietyStore(state => state.society);

    // ── Logic Hooks ────────────────────────────────────────────────────────
    const {
        searchQuery,
        setSearchQuery,
        filters,
        quickFilter,
        setQuickFilter,
        handleFilterChange,
        clearFilters,
        queryParams
    } = useSearchFilters();

    const {
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
        isCreatingOrder,
        orderError,
        resetOrderError,
        handleCreateOrder,
        clearCart,
        clearCurrentOrder
    } = useSearchCartFlow();

    // ── Queries & Mutations ────────────────────────────────────────────────
    const productQuery = useSearchProductsInfiniteQuery({
        ...queryParams,
        branchId: selectedBranch?.id,
        enabled: quickFilter === 'all'
    });

    const favoritesQuery = useSearchFavoritesQuery();
    const bestSellersQuery = useBestSellersQuery(quickFilter === 'bestSellers');
    const metadataQuery = useSearchMetadataQuery();
    const toggleFavorite = useToggleFavoriteMutation();

    const { currentShift, isShiftOpen, isLoading: isShiftLoading, refresh } = useCashShift();
    const { data: clientsData = [], isLoading: isLoadingClients } = useClients();

    // ── Local UI State ─────────────────────────────────────────────────────
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [, setRefreshTrigger] = useState(0);

    // ── Infinite Scroll Observer ───────────────────────────────────────────
    const observer = useRef<IntersectionObserver | null>(null);
    const lastProductElementRef = useCallback((node: HTMLDivElement | null) => {
        if (productQuery.isFetchingNextPage) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && productQuery.hasNextPage) {
                productQuery.fetchNextPage();
            }
        });
        if (node) observer.current.observe(node);
    }, [productQuery]);

    // ── Data Processing ────────────────────────────────────────────────────
    const products = (() => {
        if (quickFilter === 'favorites') {
            const favs = favoritesQuery.data?.data || [];
            // Apply client-side filters for favorites since API might not support all
            return favs.filter(p => {
                const matchesSearch = !queryParams.search || p.name.toLowerCase().includes(queryParams.search.toLowerCase());
                const matchesCategory = !filters.categoryId || p.categoryId === filters.categoryId;
                const matchesBrand = !filters.brand || p.brand === filters.brand;
                return matchesSearch && matchesCategory && matchesBrand;
            });
        }
        if (quickFilter === 'bestSellers') {
            return bestSellersQuery.data?.data || [];
        }
        return productQuery.data?.pages.flatMap(page => page.data.data) || [];
    })();

    const favoritesSet = new Set((favoritesQuery.data?.data || []).map(f => f.id || (f as unknown as { productId: string }).productId));

    // ── Effects ────────────────────────────────────────────────────────────

    // Auto-select real 'Público General'
    useEffect(() => {
        if (!isLoadingClients && clientsData.length > 0 && selectedClient?.id === 'public') {
            const defaultClient = clientsData.find(c =>
                c.name?.toUpperCase() === 'PÚBLICO GENERAL' ||
                c.name?.toUpperCase() === 'PUBLICO GENERAL'
            ) || clientsData[0];

            if (defaultClient) {
                setSelectedClient({
                    id: defaultClient.id,
                    name: defaultClient.name,
                    documentNumber: defaultClient.documentNumber || ''
                });
            }
        }
    }, [clientsData, isLoadingClients, selectedClient?.id, setSelectedClient]);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleClientSuccess = (client: Client) => {
        setSelectedClient({
            id: client.id,
            name: client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Sin Nombre',
            documentNumber: client.documentNumber || ''
        });
        setIsAddClientModalOpen(false);
    };

    const queryClient = useQueryClient();
    const handleRefresh = () => {
        // Invalidate all related caches to ensure stock and info are fresh globally
        invalidateProductRelatedCaches(queryClient);
        
        // Explicitly refetch current page data if needed (though invalidation should trigger it)
        productQuery.refetch();
        favoritesQuery.refetch();
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="flex flex-col bg-background min-h-[calc(100vh-4rem)]">
            <SearchCashBanners
                isShiftLoading={isShiftLoading}
                isShiftOpen={isShiftOpen}
                refreshShift={refresh}
                branchName={selectedBranch?.name}
                currentShiftId={currentShift?.id}
            />

            <SearchClientHeader
                selectedClient={selectedClient}
                onChangeClient={() => setIsSelectClientModalOpen(true)}
            />

            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border">
                <SearchHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeQuickFilters={[quickFilter]}
                    onToggleQuickFilter={(filter: string) => setQuickFilter(filter as QuickFilter)}
                    colors={metadataQuery.data?.colors || []}
                    selectedColor={filters.color}
                    onColorSelect={(colorId) => handleFilterChange('color', colorId)}
                    onClearFilters={clearFilters}
                    onOpenFilters={() => setIsFilterSheetOpen(true)}
                />
            </div>

            <div className="flex flex-1 overflow-hidden">
                <aside className="hidden lg:block w-72 flex-shrink-0 bg-background border-r border-border p-6 overflow-y-auto custom-scrollbar">
                    <FilterSidebar
                        filters={filters}
                        categories={categories}
                        brands={brands}
                        onFilterChange={handleFilterChange}
                        onClearFilters={clearFilters}
                    />
                </aside>

                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                    <SheetContent side="bottom" className="h-[90vh] sm:h-[95vh] p-0 border-t rounded-t-[32px] overflow-hidden">
                        <AdvancedFilterModal
                            key={isFilterSheetOpen ? 'open' : 'closed'}
                            isOpen={isFilterSheetOpen}
                            onClose={() => setIsFilterSheetOpen(false)}
                            filters={filters}
                            categories={categories}
                            brands={brands}
                            onApply={(newFilters: SearchFilters) => {
                                Object.entries(newFilters).forEach(([k, v]) => {
                                    handleFilterChange(k as keyof SearchFilters, v);
                                });
                                setIsFilterSheetOpen(false);
                            }}
                            onReset={clearFilters}
                        />
                    </SheetContent>
                </Sheet>

                <div className="flex-1 bg-muted/10 p-3 md:p-6 pb-32">
                    <SearchProductGrid
                        products={products}
                        loading={productQuery.isLoading || favoritesQuery.isLoading || bestSellersQuery.isLoading}
                        isLoadingMore={productQuery.isFetchingNextPage}
                        favorites={favoritesSet}
                        onToggleFavorite={(id) => toggleFavorite.mutate(id)}
                        lastProductElementRef={lastProductElementRef}
                    />
                </div>
            </div>

            <ClientEditModal
                open={isAddClientModalOpen}
                onOpenChange={setIsAddClientModalOpen}
                client={null}
                onSave={() => { }}
                onSuccess={handleClientSuccess}
            />

            <SelectClientModal
                isOpen={isSelectClientModalOpen}
                onClose={() => setIsSelectClientModalOpen(false)}
                selectedClient={selectedClient}
                onSelectClient={(client) => setSelectedClient(client)}
                onNewClient={() => setIsAddClientModalOpen(true)}
            />

            <SearchCartFooter
                totalItems={totalItems}
                totalPrice={totalPrice}
                currencySymbol={society?.mainCurrency?.symbol || 'S/'}
                isCreatingOrder={isCreatingOrder}
                onClearCart={clearCart}
                onEditOrder={() => setIsCartOpen(true)}
                onPay={handleCreateOrder}
            />

            <POSCartPanel
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                selectedClient={selectedClient}
                onSaleSuccess={() => {
                    setIsPaymentModalOpen(true);
                    handleRefresh();
                }}
            />

            <POSPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={(paymentMethod: string) => {
                    setLastPaymentMethod(paymentMethod);
                    setIsPaymentModalOpen(false);
                    setIsSuccessModalOpen(true);
                    handleRefresh();
                }}
            />

            <POSSuccessModal
                isOpen={isSuccessModalOpen}
                orderCode={useCartStore.getState().currentOrderCode || ''}
                clientName={selectedClient?.name || 'Cliente'}
                paymentMethod={lastPaymentMethod}
                total={useCartStore.getState().currentOrderTotal}
                onClose={() => {
                    setIsSuccessModalOpen(false);
                    clearCurrentOrder();
                }}
                onPrintTicket={() => { }}
                onShareWhatsApp={() => { }}
            />

            <POSAlertModal
                isOpen={!!orderError}
                onClose={resetOrderError}
                title="Error al Generar Pedido"
                message={orderError ? parseBackendError(orderError) : ''}
                type="error"
            />
        </div>
    );
}

// Separate import for store to avoid potential TS issues with selectTotalItems
import { useCartStore } from '@/store/cart.store';
