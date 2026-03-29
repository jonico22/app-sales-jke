import { Search, Heart, TrendingUp, Check, X, SlidersHorizontal, ScanBarcode } from 'lucide-react';
import type { Color } from '@/services/product.service';
import { useState, useRef, useEffect } from 'react';
import { Portal } from '@/components/shared/Portal';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface SearchHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeQuickFilters: string[];
    onToggleQuickFilter: (filter: string) => void;
    colors: Color[];
    selectedColor: string;
    onColorSelect: (color: string) => void;
    onClearFilters?: () => void;
    onOpenFilters?: () => void;
}

function ColorList({ 
    colors, 
    selectedColor, 
    onColorSelect 
}: { 
    colors: Color[], 
    selectedColor: string, 
    onColorSelect: (id: string) => void 
}) {
    return (
        <>
            <button
                onClick={() => onColorSelect('')}
                className="w-full px-4 py-3 lg:py-2 text-sm text-left flex items-center justify-between hover:bg-accent transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 lg:w-4 lg:h-4 rounded-full bg-muted border border-border" />
                    <span className={!selectedColor ? 'text-primary font-bold' : 'text-muted-foreground'}>Todos los Colores</span>
                </div>
                {!selectedColor && <Check className="w-5 h-5 lg:w-4 lg:h-4 text-primary" />}
            </button>

            {colors.map(color => (
                <button
                    key={color.id}
                    onClick={() => onColorSelect(color.id)}
                    className="w-full px-4 py-3 lg:py-2 text-sm text-left flex items-center justify-between hover:bg-accent transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-5 h-5 lg:w-4 lg:h-4 rounded-full border border-border shadow-sm"
                            style={{ backgroundColor: color.colorCode }}
                        />
                        <span className={selectedColor === color.id ? 'text-primary font-bold' : 'text-muted-foreground'}>
                            {color.color}
                        </span>
                    </div>
                    {selectedColor === color.id && <Check className="w-5 h-5 lg:w-4 lg:h-4 text-primary" />}
                </button>
            ))}
        </>
    );
}

export function SearchHeader({
    searchQuery,
    onSearchChange,
    activeQuickFilters,
    onToggleQuickFilter,
    colors,
    selectedColor,
    onColorSelect,
    onClearFilters,
    onOpenFilters
}: SearchHeaderProps) {
    const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
    const isMobileOrTablet = useMediaQuery('(max-width: 1024px)');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // For Desktop (non-portal), we use the standard ref check
            if (!isMobileOrTablet && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsColorDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileOrTablet]);

    return (
        <div className="w-full space-y-3 sm:space-y-5">

            {/* Search Input */}
            <div className="relative w-full max-w-5xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
                
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 opacity-40">
                        <span className="hidden sm:inline-block px-1.5 py-0.5 bg-muted text-[10px] font-bold rounded border border-border">F3</span>
                        <ScanBarcode className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
                    </div>
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
                        >
                            <X className="w-[18px] h-[18px]" />
                        </button>
                    )}
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar productos por nombre, SKU o código de barras..."
                    className="w-full pl-12 pr-32 py-2.5 sm:py-3.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-[15px] shadow-sm"
                />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-nowrap lg:overflow-visible overflow-x-auto items-center gap-3 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 custom-scrollbar-hide">
                {/* Filtros Button - Mobile Only */}
                <button
                    onClick={onOpenFilters}
                    className="lg:hidden flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13px] font-bold transition-all border border-border bg-card text-foreground shadow-sm hover:bg-accent shrink-0"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtros
                </button>

                {/* Todos Button - Desktop Only */}
                <button
                    onClick={onClearFilters}
                    className={`hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-[13px] font-bold transition-all border shrink-0 ${activeQuickFilters.includes('all') && !selectedColor ? 'bg-[#4096d8] text-white border-[#4096d8] shadow-md shadow-blue-500/20' : 'bg-card text-muted-foreground border-border hover:bg-accent'}`}
                >
                    Todos
                </button>

                <div className="lg:hidden w-[1px] h-6 bg-slate-200 shrink-0 mx-1" />

                <button
                    onClick={() => onToggleQuickFilter('favorites')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-[13px] font-bold transition-all border shrink-0 ${activeQuickFilters.includes('favorites') ? 'bg-[#4096d8] text-white border-[#4096d8] shadow-md shadow-blue-500/20' : 'bg-card text-muted-foreground border-border hover:bg-accent'}`}
                >
                    <Heart className={`w-[14px] h-[14px] ${activeQuickFilters.includes('favorites') ? 'fill-current' : ''}`} />
                    Favoritos
                </button>

                <button
                    onClick={() => onToggleQuickFilter('bestSellers')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-[20px] text-[13px] font-bold transition-all border shrink-0 whitespace-nowrap ${activeQuickFilters.includes('bestSellers') ? 'bg-[#4096d8] text-white border-[#4096d8] shadow-md shadow-blue-500/20' : 'bg-card text-muted-foreground border-border hover:bg-accent'}`}
                >
                    <TrendingUp className="w-[14px] h-[14px]" />
                    Más vendidos
                </button>

                {/* Color Dropdown */}
                <div className="relative shrink-0" ref={dropdownRef}>
                    <button
                        onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-[20px] text-[13px] font-bold transition-all border shrink-0 whitespace-nowrap ${selectedColor ? 'bg-primary/5 text-primary border-primary/20' : 'bg-card border-border text-muted-foreground hover:bg-accent'}`}
                    >
                        {/* Paint palette icon */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span>{selectedColor ? `Color: ${colors.find(c => c.id === selectedColor)?.color}` : 'Color'}</span>
                    </button>

                    {/* Color Dropdown Content */}
                    {isColorDropdownOpen && (
                        <>
                            {isMobileOrTablet ? (
                                <Portal>
                                    <div 
                                        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:hidden" 
                                        onClick={() => setIsColorDropdownOpen(false)}
                                    />
                                    <div className={cn(
                                        "fixed z-[70] bg-popover rounded-2xl shadow-2xl border border-border p-1 animate-in fade-in zoom-in-95 duration-200",
                                        "bottom-4 left-4 right-4 mx-auto max-w-[calc(100%-2rem)] w-full"
                                    )}>
                                        <div className="p-3 border-b border-border flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Seleccionar Color</span>
                                            <button onClick={() => setIsColorDropdownOpen(false)} className="p-1 hover:bg-muted rounded-full">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="max-h-[60vh] overflow-y-auto py-1 custom-scrollbar">
                                            <ColorList 
                                                colors={colors} 
                                                selectedColor={selectedColor} 
                                                onColorSelect={(id) => {
                                                    onColorSelect(id);
                                                    setIsColorDropdownOpen(false);
                                                }} 
                                            />
                                        </div>
                                    </div>
                                </Portal>
                            ) : (
                                <div className="absolute top-full left-0 mt-2 w-56 z-50 bg-popover rounded-xl shadow-xl border border-border p-1 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="max-h-[60vh] overflow-y-auto py-1 custom-scrollbar">
                                        <ColorList 
                                            colors={colors} 
                                            selectedColor={selectedColor} 
                                            onColorSelect={(id) => {
                                                onColorSelect(id);
                                                setIsColorDropdownOpen(false);
                                            }} 
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="ml-4 flex items-center shrink-0">
                    <button
                        onClick={onClearFilters}
                        className="text-[10px] font-black text-[#4096d8] hover:text-blue-400 transition-colors uppercase tracking-tight"
                    >
                        LIMPIAR
                    </button>
                </div>
            </div>
        </div>
    );
}
