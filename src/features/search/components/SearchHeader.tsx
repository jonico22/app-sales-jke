import { Search, Heart, TrendingUp, Check, X } from 'lucide-react';
import type { Color } from '@/services/product.service';
import { useState, useRef, useEffect } from 'react';

interface SearchHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeQuickFilters: string[];
    onToggleQuickFilter: (filter: string) => void;
    colors: Color[];
    selectedColor: string;
    onColorSelect: (color: string) => void;
    onClearFilters?: () => void;
}

export function SearchHeader({
    searchQuery,
    onSearchChange,
    activeQuickFilters,
    onToggleQuickFilter,
    colors,
    selectedColor,
    onColorSelect,
    onClearFilters
}: SearchHeaderProps) {
    const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsColorDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="w-full space-y-5">

            {/* Search Input */}
            <div className="relative w-full max-w-5xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
                
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 opacity-60">
                        <span className="px-1.5 py-0.5 bg-muted text-[10px] font-bold rounded border border-border">F3</span>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
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
                    className="w-full pl-12 pr-32 py-3.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-[15px] shadow-sm"
                />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={() => onToggleQuickFilter('favorites')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-[20px] text-[13px] font-medium transition-all border ${activeQuickFilters.includes('favorites') ? 'bg-[#4096d8] text-white border-[#4096d8] shadow-md shadow-blue-500/20' : 'bg-card text-muted-foreground border-border hover:bg-accent'}`}
                >
                    <Heart className={`w-4 h-4 ${activeQuickFilters.includes('favorites') ? 'fill-current' : ''}`} />
                    Favoritos
                </button>

                <button
                    onClick={() => onToggleQuickFilter('bestSellers')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-[20px] text-[13px] font-medium transition-all border ${activeQuickFilters.includes('bestSellers') ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' : 'bg-card text-muted-foreground border-border hover:bg-accent'}`}
                >
                    <TrendingUp className="w-4 h-4" />
                    Más vendidos
                </button>

                {/* Color Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-[20px] text-[13px] font-medium transition-all border ${selectedColor ? 'bg-primary/5 text-primary border-primary/20' : 'bg-card border-border text-muted-foreground hover:bg-accent'}`}
                    >
                        {/* Paint palette icon */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span>{selectedColor ? `Color: ${colors.find(c => c.id === selectedColor)?.color}` : 'Color'}</span>
                    </button>

                    {/* Color Dropdown Content */}
                    {isColorDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 py-2 bg-popover rounded-xl shadow-xl border border-border z-20 min-w-[180px]">
                            <button
                                onClick={() => {
                                    onColorSelect('');
                                    setIsColorDropdownOpen(false);
                                }}
                                className="w-full px-4 py-2 text-sm text-left flex items-center justify-between hover:bg-accent transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-muted border border-border" />
                                    <span className={!selectedColor ? 'text-primary font-medium' : 'text-muted-foreground'}>Todos</span>
                                </div>
                                {!selectedColor && <Check className="w-4 h-4 text-primary" />}
                            </button>

                            {colors.map(color => (
                                <button
                                    key={color.id}
                                    onClick={() => {
                                        onColorSelect(color.id);
                                        setIsColorDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-2 text-sm text-left flex items-center justify-between hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full border border-border"
                                            style={{ backgroundColor: color.colorCode }}
                                        />
                                        <span className={selectedColor === color.id ? 'text-primary font-medium' : 'text-muted-foreground'}>
                                            {color.color}
                                        </span>
                                    </div>
                                    {selectedColor === color.id && <Check className="w-4 h-4 text-primary" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="ml-4 flex items-center">
                    <button
                        onClick={onClearFilters}
                        className="text-[11px] font-bold text-[#4096d8] hover:text-blue-400 transition-colors uppercase tracking-wider"
                    >
                        LIMPIAR FILTROS
                    </button>
                </div>
            </div>
        </div>
    );
}
