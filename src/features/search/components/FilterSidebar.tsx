import { useState } from 'react';
import { Search } from 'lucide-react';
import type { CategorySelectOption } from '@/services/category.service';
import type { Brand } from '@/services/product.service';

interface FilterSidebarProps {
    filters: {
        categoryId: string;
        brand: string;
        priceFrom: number;
        priceTo: number;
        stockStatus: 'all' | 'available' | 'low' | 'out';
    };
    categories: CategorySelectOption[];
    brands: Brand[];
    onFilterChange: (key: string, value: any) => void;
    onClearFilters: () => void;
}

export function FilterSidebar({ filters, categories, brands, onFilterChange, onClearFilters }: FilterSidebarProps) {
    const [categorySearch, setCategorySearch] = useState('');

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    return (
        <aside className="shrink-0 space-y-5">
            {/* Categories */}
            <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Categoría</h3>
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar categoría..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-muted/30 border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                    />
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredCategories.map(cat => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors ${filters.categoryId === cat.id ? 'bg-[#4096d8] border-[#4096d8]' : 'border-input bg-background group-hover:border-[#4096d8]/50'}`}>
                                {filters.categoryId === cat.id && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <input
                                type="radio"
                                name="category"
                                className="hidden"
                                checked={filters.categoryId === cat.id}
                                onChange={() => onFilterChange('categoryId', filters.categoryId === cat.id ? '' : cat.id)} // Toggle behavior
                            />
                            <span className={`text-sm tracking-tight ${filters.categoryId === cat.id ? 'text-primary font-bold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                {cat.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Brands */}
            <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Marca</h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {brands.map(brand => (
                        <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors ${filters.brand === brand.brand ? 'bg-[#4096d8] border-[#4096d8]' : 'border-input bg-background group-hover:border-[#4096d8]/50'}`}>
                                {filters.brand === brand.brand && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <input
                                type="radio"
                                name="brand"
                                className="hidden"
                                checked={filters.brand === brand.brand}
                                onChange={() => onFilterChange('brand', filters.brand === brand.brand ? '' : brand.brand)} // Toggle
                            />
                            <span className={`text-sm tracking-tight ${filters.brand === brand.brand ? 'text-primary font-bold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                {brand.brand}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Rango de Precio</h3>
                <div className="px-2 space-y-3">
                    {/* Min Price Slider */}
                    <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Mínimo</span>
                            <span className="font-bold text-foreground">S/ {filters.priceFrom}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={filters.priceFrom}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val <= filters.priceTo) onFilterChange('priceFrom', val);
                            }}
                            className="w-full accent-[#4096d8] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    {/* Max Price Slider */}
                    <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Máximo</span>
                            <span className="font-bold text-foreground">
                                S/ {filters.priceTo}{filters.priceTo >= 1000 ? '+' : ''}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={filters.priceTo}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val >= filters.priceFrom) onFilterChange('priceTo', val);
                            }}
                            className="w-full accent-[#4096d8] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Stock Status */}
            <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Estado de Stock</h3>
                <div className="space-y-3">
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'available', label: 'Disponible', color: 'bg-emerald-500' },
                        { id: 'low', label: 'Bajo Stock', color: 'bg-amber-500' },
                        { id: 'out', label: 'Agotado', color: 'bg-muted' }
                    ].map((status) => (
                        <label key={status.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${filters.stockStatus === status.id ? 'border-[#4096d8]' : 'border-input bg-background group-hover:border-[#4096d8]/50'}`}>
                                {filters.stockStatus === status.id && <div className="w-2.5 h-2.5 bg-[#4096d8] rounded-full" />}
                            </div>
                            <input
                                type="radio"
                                name="stockStatus"
                                className="hidden"
                                checked={filters.stockStatus === status.id}
                                onChange={() => onFilterChange('stockStatus', status.id)}
                            />
                            <span className={`text-[13px] ${filters.stockStatus === status.id ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>{status.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button
                onClick={onClearFilters}
                className="w-full py-2.5 px-4 bg-muted/30 border border-border text-muted-foreground text-sm font-bold rounded-xl hover:bg-muted hover:text-foreground transition-colors mb-4"
            >
                Limpiar Filtros
            </button>
        </aside>
    );
}
