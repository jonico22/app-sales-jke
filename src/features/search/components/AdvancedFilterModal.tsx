import { useState } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CategorySelectOption } from '@/services/category.service';
import type { Brand } from '@/services/product.service';
import type { SearchFilters } from '../hooks/useSearchFilters';

interface AdvancedFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: SearchFilters;
    categories: CategorySelectOption[];
    brands: Brand[];
    onApply: (filters: SearchFilters) => void;
    onReset: () => void;
}

export function AdvancedFilterModal({
    isOpen,
    onClose,
    filters: initialFilters,
    categories,
    brands,
    onApply,
    onReset
}: AdvancedFilterModalProps) {
    const [localFilters, setLocalFilters] = useState<SearchFilters>(initialFilters);
    const [categorySearch, setCategorySearch] = useState('');

    const handleFilterChange = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters: SearchFilters = {
            categoryId: '',
            brand: '',
            color: '',
            priceFrom: 0,
            priceTo: 5000,
            stockStatus: 'all' as const
        };
        setLocalFilters(resetFilters);
        onReset();
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="flex flex-col h-full bg-card">
            {/* Handle Bar */}
            <div className="flex justify-center pt-4 pb-1">
                <div className="w-12 h-1 bg-muted rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-5">
                <h2 className="text-base sm:text-xl font-semibold sm:font-black text-foreground uppercase tracking-tight">Filtros Avanzados</h2>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-6 sm:pb-8 space-y-6 sm:space-y-8 custom-scrollbar-hide">
                {/* CATEGORY SECTION */}
                <section className="space-y-4">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Categoría</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar categoría..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="pl-10 h-11 bg-muted/50 border-none rounded-xl text-sm placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-blue-400 text-foreground"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {filteredCategories.map(cat => {
                            const isSelected = localFilters.categoryId === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleFilterChange('categoryId', isSelected ? '' : cat.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5",
                                        isSelected 
                                            ? "bg-[#5fa5d9] border-[#5fa5d9] text-white shadow-sm" 
                                            : "bg-muted/50 border-transparent text-muted-foreground hover:bg-accent"
                                    )}
                                >
                                    {cat.name}
                                    {isSelected && <X className="w-3 h-3 ml-1" />}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* BRAND SECTION */}
                <section className="space-y-4">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Marca</h3>
                    <div className="grid grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-1">
                        {brands.map(brand => {
                            const isSelected = localFilters.brand === brand.brand;
                            return (
                                <button
                                    key={brand.id}
                                    onClick={() => handleFilterChange('brand', isSelected ? '' : brand.brand)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                        isSelected 
                                            ? "border-[#5fa5d9] bg-blue-500/10" 
                                            : "border-border bg-background dark:bg-slate-900/40 hover:border-slate-400"
                                    )}
                                >
                                    <div className={cn(
                                        "w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors",
                                        isSelected ? "bg-[#5fa5d9] border-[#5fa5d9]" : "border-input bg-background"
                                    )}>
                                        {isSelected && <Check className="w-3 h-3 text-white stroke-[4]" />}
                                    </div>
                                    <span className={cn(
                                        "text-[13px] font-bold",
                                        isSelected ? "text-foreground" : "text-muted-foreground"
                                    )}>{brand.brand}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* STOCK STATUS SECTION */}
                <section className="space-y-4">
                    <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em]">Estado de Stock</h3>
                    <div className="flex p-1 bg-muted rounded-xl">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'available', label: 'En Stock' },
                            { id: 'out', label: 'Agotado' }
                        ].map(status => (
                            <button
                                key={status.id}
                                onClick={() => handleFilterChange('stockStatus', status.id as SearchFilters['stockStatus'])}
                                className={cn(
                                    "flex-1 py-2 text-[12px] font-bold rounded-lg transition-all",
                                    localFilters.stockStatus === status.id 
                                        ? "bg-background text-[#5fa5d9] shadow-sm" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* PRICE RANGE SECTION */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Rango de Precio</h3>
                        <span className="text-[11px] font-black text-[#5fa5d9]">
                            S/ {localFilters.priceFrom} - S/ {localFilters.priceTo}{localFilters.priceTo >= 5000 ? '+' : ''}
                        </span>
                    </div>

                    <div className="relative h-6 flex items-center group">
                        {/* Custom Slider Track */}
                        <div className="absolute w-full h-1.5 bg-muted rounded-full" />
                        <div 
                            className="absolute h-1.5 bg-[#5fa5d9] rounded-full"
                            style={{ 
                                left: `${(localFilters.priceFrom / 5000) * 100}%`,
                                right: `${100 - (localFilters.priceTo / 5000) * 100}%`
                            }}
                        />

                        {/* Dual Inputs for Range Slider */}
                        <input
                            type="range"
                            min="0"
                            max="5000"
                            step="100"
                            value={localFilters.priceFrom}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val <= localFilters.priceTo) handleFilterChange('priceFrom', val);
                            }}
                            className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer z-10 accent-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#5fa5d9] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-md"
                        />
                        <input
                            type="range"
                            min="0"
                            max="5000"
                            step="100"
                            value={localFilters.priceTo}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val >= localFilters.priceFrom) handleFilterChange('priceTo', val);
                            }}
                            className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer z-10 accent-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#5fa5d9] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-md"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Mínimo</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground">S/</span>
                                <Input
                                    type="number"
                                    value={localFilters.priceFrom}
                                    onChange={(e) => handleFilterChange('priceFrom', parseInt(e.target.value) || 0)}
                                    className="pl-8 h-12 bg-muted/50 border-none rounded-xl text-sm font-bold text-foreground"
                                />
                            </div>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Máximo</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground">S/</span>
                                <Input
                                    type="number"
                                    value={localFilters.priceTo}
                                    onChange={(e) => handleFilterChange('priceTo', parseInt(e.target.value) || 0)}
                                    className="pl-8 h-12 bg-muted/50 border-none rounded-xl text-sm font-bold text-foreground"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Buttons */}
            <div className="mt-auto shrink-0 w-full p-4 sm:p-6 bg-card border-t border-border flex flex-col sm:flex-row gap-2 sm:gap-4 z-20 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
                <Button 
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1 h-10 sm:h-12 rounded-xl border-border text-muted-foreground font-semibold sm:font-black uppercase text-[12px] hover:bg-muted"
                >
                    Limpiar Filtros
                </Button>
                <Button 
                    onClick={handleApply}
                    className="flex-1 h-10 sm:h-12 rounded-xl bg-[#5fa5d9] hover:bg-[#4096d8] text-white font-semibold sm:font-black uppercase text-[12px] shadow-lg shadow-blue-400/20"
                >
                    Aplicar Filtros
                </Button>
            </div>
        </div>
    );
}
