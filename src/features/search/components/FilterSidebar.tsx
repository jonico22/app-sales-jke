import { useState } from 'react';
import { Search } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';

interface FilterSidebarProps {
    filters: {
        categoryId: string;
        brand: string;
        priceFrom: number;
        priceTo: number;
        stockStatus: 'all' | 'available' | 'low' | 'out';
    };
    onFilterChange: (key: string, value: any) => void;
    onClearFilters: () => void;
}

export function FilterSidebar({ filters, onFilterChange, onClearFilters }: FilterSidebarProps) {
    // Categories and brands are now fetched via hooks
    const [categorySearch, setCategorySearch] = useState('');

    // Fetch categories and brands using custom hooks
    const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();
    const { data: brands = [], isLoading: brandsLoading, error: brandsError } = useBrands();

    // Optionally handle loading/error states
    if (categoriesLoading || brandsLoading) {
        // You could render a loading indicator here
    }
    if (categoriesError) {
        console.error('Failed to load categories', categoriesError);
    }
    if (brandsError) {
        console.error('Failed to load brands', brandsError);
    }


    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    return (
        <aside className="w-64 shrink-0 space-y-8">
            {/* Categories */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Categoría</h3>
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar categoría..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-sky-500 outline-none"
                    />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredCategories.map(cat => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.categoryId === cat.id ? 'bg-sky-500 border-sky-500' : 'border-slate-300 bg-white group-hover:border-sky-400'}`}>
                                {filters.categoryId === cat.id && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <input
                                type="radio"
                                name="category"
                                className="hidden"
                                checked={filters.categoryId === cat.id}
                                onChange={() => onFilterChange('categoryId', filters.categoryId === cat.id ? '' : cat.id)} // Toggle behavior
                            />
                            <span className={`text-sm ${filters.categoryId === cat.id ? 'text-sky-600 font-medium' : 'text-slate-600'}`}>
                                {cat.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Brands */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Marca</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {brands.map(brand => (
                        <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.brand === brand.brand ? 'bg-sky-500 border-sky-500' : 'border-slate-300 bg-white group-hover:border-sky-400'}`}>
                                {filters.brand === brand.brand && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <input
                                type="radio"
                                name="brand"
                                className="hidden"
                                checked={filters.brand === brand.brand}
                                onChange={() => onFilterChange('brand', filters.brand === brand.brand ? '' : brand.brand)} // Toggle
                            />
                            <span className={`text-sm ${filters.brand === brand.brand ? 'text-sky-600 font-medium' : 'text-slate-600'}`}>
                                {brand.brand}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Rango de Precio</h3>
                <div className="px-2 space-y-3">
                    {/* Min Price Slider */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Mínimo</span>
                            <span className="font-semibold text-slate-700">S/ {filters.priceFrom}</span>
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
                            className="w-full accent-sky-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    {/* Max Price Slider */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Máximo</span>
                            <span className="font-semibold text-slate-700">
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
                            className="w-full accent-sky-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Stock Status */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Estado de Stock</h3>
                <div className="space-y-3">
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'available', label: 'Disponible', color: 'bg-emerald-500' },
                        { id: 'low', label: 'Bajo Stock', color: 'bg-amber-500' },
                        { id: 'out', label: 'Agotado', color: 'bg-slate-300' }
                    ].map((status) => (
                        <label key={status.id} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="stockStatus"
                                checked={filters.stockStatus === status.id}
                                onChange={() => onFilterChange('stockStatus', status.id)}
                                className="w-4 h-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                            />
                            <span className="text-sm text-slate-600">{status.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button
                onClick={onClearFilters}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
                Limpiar Filtros
            </button>
        </aside>
    );
}
