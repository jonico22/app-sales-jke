import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


interface KardexFilterBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    activeFiltersCount: number;
    onOpenFilters: () => void;
}

export function KardexFilterBar({ searchTerm, onSearchChange, activeFiltersCount, onOpenFilters }: KardexFilterBarProps) {
    return (
        <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col xl:flex-row gap-3 items-center justify-between">
            <div className="relative w-full xl:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
                <input
                    type="text"
                    placeholder="BUSCAR POR PRODUCTO O DOCUMENTO..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border/50 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary text-[11px] font-bold uppercase tracking-widest outline-none transition-all placeholder:text-muted-foreground/30"
                />
            </div>

            <div className="flex items-center gap-2 w-full xl:w-auto">
                <Button
                    variant="outline"
                    onClick={onOpenFilters}
                    className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-card border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all active:scale-95"
                >
                    <SlidersHorizontal className="w-4 h-4 mr-2 opacity-60" />
                    Filtros Avanzados
                    {activeFiltersCount > 0 && (
                        <Badge className="ml-2 bg-primary text-primary-foreground px-1.5 h-4 text-[8px] font-black min-w-4 justify-center">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
            </div>
        </div>
    );
}
