import { useState, useEffect } from 'react';
import { FilterSidebar } from './components/FilterSidebar';
import { SearchHeader } from './components/SearchHeader';
import { ProductCard } from './components/ProductCard';
import { productService, type Product, type Color } from '@/services/product.service';
import { favoritesService } from '@/services/favorites.service';

import { Loader2 } from 'lucide-react';
import { POSClientSelector } from '../pos/components/POSClientSelector';
import { AddClientModal } from '../pos/components/AddClientModal';
import { type ClientSelectOption } from '@/services/client.service';
import { useCartStore } from '@/store/cart.store';
import { POSCartPanel } from '../pos/components/POSCartPanel';
import { POSFloatingCart } from '../pos/components/POSFloatingCart';
import { POSPaymentModal } from '../pos/components/POSPaymentModal';
import { POSSuccessModal } from '../pos/components/POSSuccessModal';

export default function AdvancedSearchPage() {
    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [colors, setColors] = useState<Color[]>([]); // Added colors state
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>(['favorites']);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

    // Client State
    const [selectedClient, setSelectedClient] = useState<ClientSelectOption | null>({
        id: 'public',
        name: 'Público General',
        documentNumber: '00000000'
    });
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

    // POS Cart State
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [lastPaymentMethod, setLastPaymentMethod] = useState<string>('CASH');
    const { clearCurrentOrder, currentOrderCode, currentOrderTotal } = useCartStore();

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

    // Load products when filters or search changes
    const loadProducts = async () => {
        setLoading(true);
        try {
            // Priority: If favorites filter is active, use the cached list (no extra API call)
            if (activeQuickFilters.includes('favorites')) {
                let data = [...favoriteProducts];

                // Client-side filtering
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
                return;
            }

            // Priority: If bestSellers filter is active
            if (activeQuickFilters.includes('bestSellers')) {
                const bestSellersRes = await productService.getBestSellers();
                if (bestSellersRes.success) {
                    let data = bestSellersRes.data;

                    // Client-side filtering for favorites based on other active filters
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
                return;
            }

            // Normal Product Fetching
            // Don't fetch the massive generic list unless they've actually started a search or applied a primary filter or selected 'Todos'
            if (!debouncedSearchQuery && !filters.categoryId && !filters.brand && !activeQuickFilters.includes('bestSellers') && !activeQuickFilters.includes('all')) {
                setProducts([]);
                setLoading(false);
                return;
            }

            const params: any = {
                limit: 50,
                search: debouncedSearchQuery || undefined,
                categoryId: filters.categoryId || undefined,
                brand: filters.brand || undefined,
                priceFrom: filters.priceFrom > 0 ? filters.priceFrom : undefined,
                priceTo: filters.priceTo < 1000 ? filters.priceTo : undefined,
                stockStatus: filters.stockStatus !== 'all' ? filters.stockStatus : undefined,
            };

            const productsRes = await productService.getAll(params);

            if (productsRes.success) {
                let data = productsRes.data.data;

                // Optional: Client-side refinement if API is loose
                if (filters.color) {
                    data = data.filter(p => p.color === filters.color || p.colorCode === filters.color || p.color === colors.find(c => c.id === filters.color)?.color);
                }

                setProducts(data);
            }
        } catch (error) {
            console.error('Error loading products', error);
        } finally {
            setLoading(false);
        }
    };




    // Effect to reload products when filters or search changes
    useEffect(() => {
        loadProducts();
    }, [debouncedSearchQuery, filters.categoryId, filters.brand, filters.color, filters.stockStatus, debouncedPriceFrom, debouncedPriceTo, activeQuickFilters, favoriteProducts]);

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
        setActiveQuickFilters(['favorites']);
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

    return (
        <div className="flex gap-6 h-full">
            {/* Sidebar */}
            <aside className="w-80 flex-shrink-0 bg-white border border-slate-200 rounded-lg p-6 h-fit">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Filtros</h2>
                <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-6">
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
                    clientSelector={
                        <POSClientSelector
                            selectedClient={selectedClient}
                            onSelectClient={setSelectedClient}
                            onNewClient={() => setIsAddClientModalOpen(true)}
                        />
                    }
                />

                {/* Product Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                Resultados ({filteredProducts.length})
                            </h2>
                            {/* Optional: Sort dropdown */}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isFavorite={favorites.has(product.id)}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-20 text-slate-400">
                                <p>No se encontraron productos con los filtros seleccionados.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AddClientModal
                isOpen={isAddClientModalOpen}
                onClose={() => setIsAddClientModalOpen(false)}
                onClientRegistered={handleClientRegistered}
            />

            {/* POS Cart Integration */}
            <POSFloatingCart onClick={() => setIsCartOpen(true)} />

            <POSCartPanel
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                selectedClient={selectedClient}
                onSaleSuccess={() => {
                    setIsPaymentModalOpen(true);
                    // Refresh data to update stock
                    loadProducts();
                }}
            />

            <POSPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={(paymentMethod: string) => {
                    setLastPaymentMethod(paymentMethod);
                    setIsPaymentModalOpen(false);
                    setIsSuccessModalOpen(true);
                    loadProducts();
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
        </div>
    );
}
