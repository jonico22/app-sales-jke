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
    const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

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
        color: '', // Added color filter
        minPrice: 0,
        maxPrice: 1000,
        stockStatus: 'all' as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
    });







    // Debounce Search
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);
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
                    const favIds = new Set(favsRes.data.map(f => f.productId));
                    setFavorites(favIds);
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
            // Prepare params
            const params: any = {
                limit: 50,
                search: debouncedSearchQuery || undefined,
                categoryId: filters.categoryId || undefined,
                brand: filters.brand || undefined,
                minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
                maxPrice: filters.maxPrice < 1000 ? filters.maxPrice : undefined,
            };

            // Handle stock status mapping to API params
            if (filters.stockStatus === 'in_stock') params.minStock = 1;
            if (filters.stockStatus === 'out_of_stock') params.maxStock = 0;

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
    }, [debouncedSearchQuery, filters.categoryId, filters.brand, filters.color, filters.stockStatus, activeQuickFilters]);

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
            minPrice: 0,
            maxPrice: 1000,
            stockStatus: 'all'
        });
        setSearchQuery('');
        setActiveQuickFilters([]);
    };

    const handleToggleFavorite = async (id: string) => {
        try {
            // Optimistic update
            const newFavorites = new Set(favorites);
            if (newFavorites.has(id)) {
                newFavorites.delete(id);
            } else {
                newFavorites.add(id);
            }
            setFavorites(newFavorites);

            await favoritesService.toggle({ productId: id });
        } catch (error) {
            console.error('Failed to toggle favorite', error);
            // Revert on error would go here
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
                        setActiveQuickFilters(prev =>
                            prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
                        );
                    }}
                    colors={colors}
                    selectedColor={filters.color}
                    onColorSelect={(colorId) => handleFilterChange('color', colorId)}
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
