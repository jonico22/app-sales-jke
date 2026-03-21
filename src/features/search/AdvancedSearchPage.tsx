import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterSidebar } from './components/FilterSidebar';
import { SearchHeader } from './components/SearchHeader';
import { ProductCard } from './components/ProductCard';
import { productService, type Product, type Color } from '@/services/product.service';
import { favoritesService } from '@/services/favorites.service';

import { Loader2, ShoppingCart, User } from 'lucide-react';
import { CashOpeningBanner } from '../pos/components/CashOpeningBanner';
import { CashClosingBanner } from '../pos/components/CashClosingBanner';
import { useBranchStore } from '@/store/branch.store';
import { useSocietyStore } from '@/store/society.store';
import { AddClientModal } from '../pos/components/AddClientModal';
import { SelectClientModal } from '../pos/components/SelectClientModal';
import { type ClientSelectOption } from '@/services/client.service';
import { useCartStore, selectTotalItems, selectTotalPrice } from '@/store/cart.store';
import { POSCartPanel } from '../pos/components/POSCartPanel';
import { useCashShift } from '@/hooks/useCashShift';
import { POSPaymentModal } from '../pos/components/POSPaymentModal';
import { POSSuccessModal } from '../pos/components/POSSuccessModal';
import { POSAlertModal } from '../pos/components/POSAlertModal';
import { orderService, type CreateOrderRequest, OrderStatus } from '@/services/order.service';
import { parseBackendError } from '@/utils/error.utils';
import { useClients } from '@/hooks/useClients';
export default function AdvancedSearchPage() {
    const { selectedBranch } = useBranchStore();
    const society = useSocietyStore(state => state.society);
    const [products, setProducts] = useState<Product[]>([]);
    const [colors, setColors] = useState<Color[]>([]); // Added colors state
    const [loading, setLoading] = useState(true);

    // Infinite Scroll State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const lastFilterParams = useRef('');

    const observer = useRef<IntersectionObserver | null>(null);
    const lastProductElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading || isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, isLoadingMore, hasMore]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>(['all']);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

    // Client State
    const { data: clients = [], isLoading: isLoadingClients } = useClients();
    const [selectedClient, setSelectedClient] = useState<ClientSelectOption | null>({
        id: 'public',
        name: 'Público General',
        documentNumber: '00000000'
    });
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [isSelectClientModalOpen, setIsSelectClientModalOpen] = useState(false);

    // Auto-select real 'Público General' client from DB to have a valid UUID
    useEffect(() => {
        if (!isLoadingClients && clients.length > 0 && selectedClient?.id === 'public') {
            const defaultClient = clients.find(c =>
                c.name === 'PÚBLICO GENERAL' || c.name === 'PUBLICO GENERAL'
            ) || clients[0];

            if (defaultClient) {
                setSelectedClient({
                    id: defaultClient.id,
                    name: defaultClient.name,
                    documentNumber: defaultClient.documentNumber
                });
            }
        }
    }, [clients, isLoadingClients, selectedClient?.id]);

    // POS Cart State
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [lastPaymentMethod, setLastPaymentMethod] = useState<string>('CASH');
    const { items, discount, orderNotes, currencyId, setCurrentOrder, clearCurrentOrder, currentOrderCode, currentOrderTotal, clearCart } = useCartStore();
    const totalItems = useCartStore(selectTotalItems);
    const totalPrice = useCartStore(selectTotalPrice);

    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

    // Filters State
    const [filters, setFilters] = useState({
        categoryId: '',
        brand: '',
        color: '',
        priceFrom: 0,
        priceTo: 1000,
        stockStatus: 'all' as 'all' | 'available' | 'low' | 'out'
    });







    // Debounce Search
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Debounce Price Range (600ms so sliders don't spam the API)
    const [debouncedPriceFrom, setDebouncedPriceFrom] = useState(filters.priceFrom);
    const [debouncedPriceTo, setDebouncedPriceTo] = useState(filters.priceTo);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedPriceFrom(filters.priceFrom);
            setDebouncedPriceTo(filters.priceTo);
        }, 600);

        return () => clearTimeout(timer);
    }, [filters.priceFrom, filters.priceTo]);

    // Load initial data (colors, favorites) only once
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [favsRes, colorsRes] = await Promise.all([
                    favoritesService.getAll(),
                    productService.getColors()
                ]);

                if (colorsRes.success) {
                    setColors(colorsRes.data);
                }

                if (favsRes.success) {
                    const favList = favsRes.data as any as Product[];
                    const favIds = new Set(favList.map((f: any) => f.id || f.productId));
                    setFavorites(favIds);
                    setFavoriteProducts(favList);
                }
            } catch (error) {
                console.error('Error loading initial data', error);
            }
        };

        loadInitialData();
    }, []);

    // Effect to reload products when filters, search, branch, or page changes
    useEffect(() => {
        const loadProducts = async () => {
            const currentParams = JSON.stringify({
                debouncedSearchQuery,
                categoryId: filters.categoryId,
                brand: filters.brand,
                color: filters.color,
                stockStatus: filters.stockStatus,
                debouncedPriceFrom,
                debouncedPriceTo,
                activeQuickFilters,
                branchId: selectedBranch?.id,
                refreshTrigger
            });

            const isFilterChange = lastFilterParams.current !== currentParams;
            let targetPage = page;

            if (isFilterChange) {
                targetPage = 1;
                setPage(1);
                lastFilterParams.current = currentParams;
            }

            const isLoadMore = targetPage > 1;

            if (isLoadMore) {
                setIsLoadingMore(true);
            } else {
                setLoading(true);
            }

            try {
                // Priority: If favorites filter is active, use the cached list
                if (activeQuickFilters.includes('favorites')) {
                    let data = [...favoriteProducts];

                    if (debouncedSearchQuery) {
                        const lowerQuery = debouncedSearchQuery.toLowerCase();
                        data = data.filter(p =>
                            p.name.toLowerCase().includes(lowerQuery) ||
                            (p.code && p.code.toLowerCase().includes(lowerQuery)) ||
                            (p.barcode && p.barcode.toLowerCase().includes(lowerQuery))
                        );
                    }
                    if (filters.categoryId) data = data.filter(p => p.categoryId === filters.categoryId);
                    if (filters.brand) data = data.filter(p => p.brand === filters.brand);
                    if (filters.color) {
                        data = data.filter(p => p.color === filters.color || p.colorCode === filters.color || p.color === colors.find(c => c.id === filters.color)?.color);
                    }
                    if (filters.priceFrom > 0) data = data.filter(p => parseFloat(p.price) >= filters.priceFrom);
                    if (filters.priceTo < 1000) data = data.filter(p => parseFloat(p.price) <= filters.priceTo);

                    setProducts(data);
                    setHasMore(false);
                    return;
                }

                // Priority: If bestSellers filter is active
                if (activeQuickFilters.includes('bestSellers')) {
                    const bestSellersRes = await productService.getBestSellers();
                    if (bestSellersRes.success) {
                        let data = bestSellersRes.data;

                        if (debouncedSearchQuery) {
                            const lowerQuery = debouncedSearchQuery.toLowerCase();
                            data = data.filter(p =>
                                p.name.toLowerCase().includes(lowerQuery) ||
                                (p.code && p.code.toLowerCase().includes(lowerQuery)) ||
                                (p.barcode && p.barcode.toLowerCase().includes(lowerQuery))
                            );
                        }
                        if (filters.categoryId) data = data.filter(p => p.categoryId === filters.categoryId);
                        if (filters.brand) data = data.filter(p => p.brand === filters.brand);
                        if (filters.color) {
                            data = data.filter(p => p.color === filters.color || p.colorCode === filters.color || p.color === colors.find(c => c.id === filters.color)?.color);
                        }
                        if (filters.priceFrom > 0) data = data.filter(p => parseFloat(p.price) >= filters.priceFrom);
                        if (filters.priceTo < 1000) data = data.filter(p => parseFloat(p.price) <= filters.priceTo);

                        setProducts(data);
                    } else {
                        setProducts([]);
                    }
                    setHasMore(false);
                    return;
                }

                // Normal Product Fetching
                if (!debouncedSearchQuery && !filters.categoryId && !filters.brand && !activeQuickFilters.includes('all')) {
                    setProducts([]);
                    setHasMore(false);
                    return;
                }

                const params: any = {
                    limit: 5, // Load 5 products by default
                    page: targetPage,
                    search: debouncedSearchQuery || undefined,
                    categoryId: filters.categoryId || undefined,
                    brand: filters.brand || undefined,
                    branchId: selectedBranch?.id || undefined,
                    priceFrom: filters.priceFrom > 0 ? filters.priceFrom : undefined,
                    priceTo: filters.priceTo < 1000 ? filters.priceTo : undefined,
                    stockStatus: filters.stockStatus !== 'all' ? filters.stockStatus : undefined,
                };

                const productsRes = await productService.getAll(params);

                if (productsRes.success) {
                    let newData = productsRes.data.data;
                    const pagination = productsRes.data.pagination;

                    if (filters.color) {
                        newData = newData.filter(p => p.color === filters.color || p.colorCode === filters.color || p.color === colors.find(c => c.id === filters.color)?.color);
                    }

                    if (isLoadMore) {
                        setProducts(prev => {
                            const existingIds = new Set(prev.map(p => p.id));
                            const uniqueNewData = newData.filter(p => !existingIds.has(p.id));
                            return [...prev, ...uniqueNewData];
                        });
                    } else {
                        setProducts(newData);
                    }

                    if (pagination) {
                        setHasMore(pagination.hasNextPage);
                    } else {
                        setHasMore(false);
                    }
                }
            } catch (error) {
                console.error('Error loading products', error);
            } finally {
                if (isLoadMore) {
                    setIsLoadingMore(false);
                } else {
                    setLoading(false);
                }
            }
        };

        loadProducts();
    }, [page, debouncedSearchQuery, filters.categoryId, filters.brand, filters.color, filters.stockStatus, debouncedPriceFrom, debouncedPriceTo, activeQuickFilters, selectedBranch?.id, refreshTrigger]);

    // Simplified client-side filter for just what's loaded (pagination etc)
    // Actually, if we reload data on search, 'filteredProducts' should just be 'products'
    // unless we have pagination.
    const filteredProducts = products;

    // Handlers
    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            categoryId: '',
            brand: '',
            color: '',
            priceFrom: 0,
            priceTo: 1000,
            stockStatus: 'all'
        });
        setSearchQuery('');
        setActiveQuickFilters(['all']);
    };

    const handleToggleFavorite = async (id: string) => {
        // Optimistic update for both sets
        const isAdding = !favorites.has(id);
        setFavorites(prev => {
            const next = new Set(prev);
            isAdding ? next.add(id) : next.delete(id);
            return next;
        });
        // Keep favoriteProducts cache in sync so the favorites filter view is accurate
        setFavoriteProducts(prev =>
            isAdding
                ? [...prev, products.find(p => p.id === id)].filter(Boolean) as Product[]
                : prev.filter(p => p.id !== id)
        );

        try {
            const response = await favoritesService.toggle({ productId: id });

            // Revert on API error
            if (!response.success) {
                console.error('Failed to toggle favorite API:', response.message);
                setFavorites(prev => {
                    const next = new Set(prev);
                    isAdding ? next.delete(id) : next.add(id);
                    return next;
                });
                setFavoriteProducts(prev =>
                    isAdding
                        ? prev.filter(p => p.id !== id)
                        : [...prev, products.find(p => p.id === id)].filter(Boolean) as Product[]
                );
            } else if (response.data && response.data.isFavorite !== undefined) {
                // Sync with exact server state
                setFavorites(prev => {
                    const next = new Set(prev);
                    response.data.isFavorite ? next.add(id) : next.delete(id);
                    return next;
                });
                if (!response.data.isFavorite) {
                    setFavoriteProducts(prev => prev.filter(p => p.id !== id));
                }
            }
        } catch (error) {
            console.error('Failed to toggle favorite', error);
            // Revert on exception
            setFavorites(prev => {
                const next = new Set(prev);
                isAdding ? next.delete(id) : next.add(id);
                return next;
            });
            setFavoriteProducts(prev =>
                isAdding
                    ? prev.filter(p => p.id !== id)
                    : [...prev, products.find(p => p.id === id)].filter(Boolean) as Product[]
            );
        }
    };




    const handleClientRegistered = (newClient: ClientSelectOption) => {
        setSelectedClient(newClient);
        setIsAddClientModalOpen(false);
    };

    const handleDirectPay = async () => {
        if (items.length === 0) return;

        setIsCreatingOrder(true);
        setOrderError(null);

        const subtotal = totalPrice / 1.18;
        const igv = totalPrice - subtotal;
        const total = totalPrice - (discount || 0);

        try {
            const orderData: CreateOrderRequest = {
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

            const response = await orderService.create(orderData);

            if (response.success && response.data) {
                // Save order details to store for payment modal
                setCurrentOrder(response.data.id, response.data.orderCode, total);

                // Clear cart
                clearCart();

                // Open Payment modal
                setIsPaymentModalOpen(true);
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('Failed to create order', error);
            setOrderError(parseBackendError(error));
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const navigate = useNavigate();
    const { currentShift, isShiftOpen, isLoading: isShiftLoading, refresh } = useCashShift();

    return (
        <div className="flex flex-col bg-background min-h-[calc(100vh-4rem)]">
            {/* Cash Banners */}
            {isShiftLoading ? (
                <div className="px-4 md:px-6 pt-4">
                    <CashOpeningBanner isLoading={true} />
                </div>
            ) : !isShiftOpen ? (
                <div className="px-4 md:px-6 pt-4">
                    <CashOpeningBanner refreshShift={refresh} />
                </div>
            ) : (
                <div className="px-4 md:px-6 pt-4">
                    <CashClosingBanner
                        branchName={selectedBranch?.name}
                        onCloseCash={() => navigate(`/pos/cash-closing/${currentShift?.id}`)}
                    />
                </div>
            )}

            {/* Client Context Header */}
            <div className="px-4 md:px-6 py-2.5 border-b border-border bg-[#f8fafc] flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <User className="w-[15px] h-[15px] text-muted-foreground mr-1" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CLIENTE ACTUAL:</span>
                    <span className="text-[13px] font-bold text-foreground">
                        {selectedClient?.name || 'Público General'}
                    </span>
                    {selectedClient?.documentNumber && selectedClient.documentNumber !== '00000000' && (
                        <span className="text-[10px] bg-white border border-border px-2 py-0.5 rounded-full font-medium ml-2 shadow-sm shadow-black/5">
                            {selectedClient.documentNumber}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setIsSelectClientModalOpen(true)}
                    className="text-[11px] font-bold text-[#4096d8] hover:text-blue-500 hover:underline transition-all uppercase tracking-wider bg-white border border-[#4096d8]/20 px-3 py-1 rounded-[12px] shadow-sm shadow-[#4096d8]/5"
                >
                    CAMBIAR CLIENTE
                </button>
            </div>

            {/* Global Search Header spans full width */}
            <div className="px-4 md:px-6 py-4 border-b border-border">
                <SearchHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeQuickFilters={activeQuickFilters}
                    onToggleQuickFilter={(filter) => {
                        setActiveQuickFilters(prev => {
                            if (filter === 'all') return ['all'];
                            if (filter === 'favorites') return ['favorites'];
                            if (filter === 'bestSellers') return ['bestSellers'];
                            return prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter];
                        });
                    }}
                    colors={colors}
                    selectedColor={filters.color}
                    onColorSelect={(colorId) => handleFilterChange('color', colorId)}
                    onClearFilters={handleClearFilters}
                />
            </div>

            {/* Split Content Area */}
            <div className="flex flex-col md:flex-row flex-1">
                {/* Sidebar */}
                <aside className="w-full md:w-56 xl:w-64 flex-shrink-0 bg-background border-r border-border p-4 md:p-6">
                    <FilterSidebar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />
                </aside>

                {/* Main Content */}
                <div className="flex-1 bg-muted/10 p-4 md:p-6">
                    {/* Product Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* RESULTS HEADER */}
                            <div className="flex justify-between items-center mb-2 hidden">
                                <h2 className="text-[12px] md:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                    Resultados ({filteredProducts.length})
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {filteredProducts.map((product, index) => {
                                    if (filteredProducts.length === index + 1) {
                                        return (
                                            <div ref={lastProductElementRef} key={product.id}>
                                                <ProductCard
                                                    product={product}
                                                    isFavorite={favorites.has(product.id)}
                                                    onToggleFavorite={handleToggleFavorite}
                                                />
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                isFavorite={favorites.has(product.id)}
                                                onToggleFavorite={handleToggleFavorite}
                                            />
                                        );
                                    }
                                })}
                            </div>

                            {isLoadingMore && (
                                <div className="flex justify-center items-center py-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            )}

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-20 text-muted-foreground">
                                    <p>No se encontraron productos con los filtros seleccionados.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AddClientModal
                isOpen={isAddClientModalOpen}
                onClose={() => setIsAddClientModalOpen(false)}
                onClientRegistered={handleClientRegistered}
            />

            <SelectClientModal
                isOpen={isSelectClientModalOpen}
                onClose={() => setIsSelectClientModalOpen(false)}
                selectedClient={selectedClient}
                onSelectClient={(client) => setSelectedClient(client)}
                onNewClient={() => {
                    setIsAddClientModalOpen(true);
                }}
            />

            {/* Cart Footer Integration */}
            {totalItems > 0 && (
                <div className="sticky bottom-0 left-0 w-full bg-card border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                    <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Summary Info */}
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                    Productos Seleccionados
                                </span>
                                <span className="text-lg font-bold text-foreground leading-none">{totalItems}</span>
                            </div>
                            <div className="w-px h-8 bg-border" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                    Subtotal Estimado
                                </span>
                                <span className="text-lg font-bold text-[#4096d8] leading-none">
                                    {society?.mainCurrency?.symbol || 'S/'} {totalPrice.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 w-full md:w-auto">
                            <button
                                onClick={clearCart}
                                className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors active:scale-95"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-[#4096d8] text-[#4096d8] hover:bg-blue-50 transition-all active:scale-95 bg-white"
                            >
                                <span className="font-medium text-sm">EDITAR PEDIDO</span>
                            </button>
                            <button
                                onClick={handleDirectPay}
                                disabled={isCreatingOrder}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#4096d8] text-white hover:bg-blue-500 transition-all active:scale-95 shadow-md shadow-[#4096d8]/20 disabled:opacity-50"
                            >
                                {isCreatingOrder ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="font-medium text-sm">PAGAR</span>
                                        <div className="relative flex items-center justify-center ml-1">
                                            <ShoppingCart className="w-[18px] h-[18px]" />
                                            <div className="absolute -top-1.5 -right-2 bg-cyan-400 text-white text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                                                {totalItems}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <POSCartPanel
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                selectedClient={selectedClient}
                onSaleSuccess={() => {
                    setIsPaymentModalOpen(true);
                    // Refresh data to update stock
                    setRefreshTrigger(prev => prev + 1);
                }}
            />

            <POSPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={(paymentMethod: string) => {
                    setLastPaymentMethod(paymentMethod);
                    setIsPaymentModalOpen(false);
                    setIsSuccessModalOpen(true);
                    setRefreshTrigger(prev => prev + 1);
                }}
            />

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
                onPrintTicket={() => console.log('Print ticket')}
                onShareWhatsApp={() => console.log('Share WhatsApp')}
            />

            <POSAlertModal
                isOpen={!!orderError}
                onClose={() => setOrderError(null)}
                title="Error al Generar Pedido"
                message={orderError || ''}
                type="error"
            />
        </div>
    );
}
