import { useState, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Input } from '@/components/ui';
import { productService, type Product } from '@/services/product.service';

interface POSProductSearchProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onAdvancedSearch?: () => void;
    selectedProduct: Product | null;
    onSelectProduct?: (product: Product | null) => void;
    refreshTrigger?: number;
}

export function POSProductSearch({
    searchQuery,
    setSearchQuery,
    onAdvancedSearch,
    selectedProduct,
    onSelectProduct,
    refreshTrigger = 0
}: POSProductSearchProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getForSelect();
                // Handle various response structures
                if (response.success && response.data) {
                    // Check if it's paginated (response.data.data) or flat array (response.data)
                    const productData = (response.data as any).data || response.data;
                    if (Array.isArray(productData)) {
                        setProducts(productData);
                    }
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, [refreshTrigger]);

    // Filter products when search query changes
    useEffect(() => {
        let filtered = products;
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            filtered = products.filter(product =>
                product.name.toLowerCase().includes(query) ||
                (product.code && product.code.toLowerCase().includes(query))
            );
        }
        setFilteredProducts(filtered.slice(0, 5)); // Limit to 5 results for dropdown
    }, [searchQuery, products]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchRef]);

    const handleSelect = (product: Product) => {
        if (onSelectProduct) {
            onSelectProduct(product);
        }
        setSearchQuery(''); // Clear search after selection or keep it? usually clear.
        setShowDropdown(false);
    };

    return (
        <div ref={searchRef}>
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Búsqueda de Producto
                </label>
            </div>
            <div className="relative">
                {selectedProduct ? (
                    <div className="w-full h-14 pl-4 pr-4 border-2 border-emerald-500 bg-background rounded-xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-emerald-500 rounded-full p-1 shrink-0">
                                <Check className="h-3 w-3 text-white" strokeWidth={4} />
                            </div>
                            <span className="text-base font-medium text-foreground truncate">
                                {selectedProduct.name}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                if (onSelectProduct) onSelectProduct(null);
                                setSearchQuery('');
                            }}
                            className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Escanea o busca un producto para iniciar la venta"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className="w-full h-14 pl-12 pr-20 text-base border-2 border-primary/20 bg-primary/5 rounded-xl focus:border-primary focus:bg-background transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded">F3</span>
                            <button className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={onAdvancedSearch}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </button>
                        </div>

                        {/* Dropdown Results */}
                        {showDropdown && filteredProducts.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                {filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleSelect(product)}
                                        className="w-full px-4 py-3 flex items-center justify-between border-b border-border last:border-0 hover:bg-muted transition-colors text-left group"
                                    >
                                        <div>
                                            <h4 className="font-semibold text-foreground text-sm">{product.name}</h4>
                                            <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground">
                                                SKU: {product.code || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div>
                                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">STOCK</div>
                                                <div className="text-sm font-medium text-foreground">{product.stock} unids</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">PRECIO</div>
                                                <div className="text-base font-bold text-primary">S/ {Number(product.price).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                <div className="px-4 py-2 bg-muted/50 text-center text-xs text-muted-foreground border-t border-border">
                                    Mostrando {filteredProducts.length} resultados. Presiona Enter para ver todos.
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
