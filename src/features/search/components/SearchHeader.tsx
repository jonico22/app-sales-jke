import { Search, Heart, TrendingUp, ChevronDown, Check, X } from 'lucide-react';
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
    clientSelector?: React.ReactNode;
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
    clientSelector
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
        <div className="space-y-6 bg-card p-6 rounded-2xl border border-border shadow-sm mb-6">
            {/* Top Row: Title & Client */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Búsqueda y Filtros Avanzados</h1>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 ">
                        {clientSelector}
                    </div>
                </div>
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchQuery ? (
                        <button
                            onClick={() => onSearchChange('')}
                            className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-bold rounded border border-border">F3</span>
                    )}
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar productos por nombre, SKU o código de barras..."
                    className="w-full pl-12 pr-12 py-3.5 bg-muted/50 border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-base"
                />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={() => onToggleQuickFilter('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeQuickFilters.includes('all') ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                >
                    Todos
                </button>

                <button
                    onClick={() => onToggleQuickFilter('favorites')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeQuickFilters.includes('favorites') ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                >
                    <Heart className={`w-4 h-4 ${activeQuickFilters.includes('favorites') ? 'fill-current' : ''}`} />
                    Favoritos
                </button>

                <button
                    onClick={() => onToggleQuickFilter('bestSellers')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeQuickFilters.includes('bestSellers') ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                >
                    <TrendingUp className="w-4 h-4" />
                    Más vendidos
                </button>

                {/* Color Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${selectedColor ? 'border-primary text-primary bg-primary/10' : 'border-input text-muted-foreground hover:border-border'}`}
                    >
                        <span>{selectedColor ? colors.find(c => c.id === selectedColor)?.color : 'Color'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isColorDropdownOpen ? 'rotate-180' : ''}`} />
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

                <div className="ml-auto">
                    <button
                        onClick={onClearFilters}
                        className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                        LIMPIAR FILTROS
                    </button>
                </div>
            </div>
        </div>
    );
}
