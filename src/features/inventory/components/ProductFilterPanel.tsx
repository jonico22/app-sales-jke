import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { categoryService, type CategorySelectOption } from '@/services/category.service';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

interface ProductFilterPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApplyFilters: (filters: FilterValues) => void;
}

export interface FilterValues {
    categoryCode?: string;
    priceFrom: string;
    priceTo: string;
    priceCostFrom: string;
    priceCostTo: string;
    stockFrom: string;
    stockTo: string;
    lowStock: boolean;
    stockStatus?: 'out';
}



export function ProductFilterPanel({
    open,
    onOpenChange,
    onApplyFilters,
}: ProductFilterPanelProps) {
    const [filters, setFilters] = useState<FilterValues>({
        categoryCode: undefined,
        priceFrom: '',
        priceTo: '',
        priceCostFrom: '',
        priceCostTo: '',
        stockFrom: '',
        stockTo: '',
        lowStock: false,
        stockStatus: undefined,
    });
    const [categories, setCategories] = useState<CategorySelectOption[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoadingCategories(true);
                const response = await categoryService.getForSelect();
                if (response.success && response.data) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Error al cargar lista de categorías');
            } finally {
                setIsLoadingCategories(false);
            }
        };

        if (open) {
            fetchCategories();
        }
    }, [open]);

    const handleClear = () => {
        const emptyFilters: FilterValues = {
            categoryCode: undefined,
            priceFrom: '',
            priceTo: '',
            priceCostFrom: '',
            priceCostTo: '',
            stockFrom: '',
            stockTo: '',
            lowStock: false,
            stockStatus: undefined,
        };
        setFilters(emptyFilters);
        onApplyFilters(emptyFilters);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card border-l border-border shadow-2xl">
                <SheetHeader className="px-6 py-5 border-b border-border bg-card shrink-0">
                    <SheetTitle className="text-lg font-bold text-foreground tracking-tight uppercase">Filtros Avanzados</SheetTitle>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Refine su búsqueda de productos con filtros detallados.</p>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Category */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Categoría</Label>
                        <div className="relative">
                            <select
                                value={filters.categoryCode || ''}
                                onChange={(e) => setFilters({ ...filters, categoryCode: e.target.value || undefined })}
                                disabled={isLoadingCategories}
                                className="w-full h-10 px-3 py-2 text-xs rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors"
                            >
                                <option value="">{isLoadingCategories ? 'Cargando...' : 'Seleccionar...'}</option>
                                {categories.map((cat) => (
                                    <option key={cat.code} value={cat.code}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rango de Precio Venta</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                placeholder="Mínimo"
                                value={filters.priceFrom}
                                className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                                onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
                            />
                            <Input
                                type="number"
                                placeholder="Máximo"
                                value={filters.priceTo}
                                className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                                onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Cost Range */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rango de Precio Costo</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                placeholder="Mínimo"
                                value={filters.priceCostFrom}
                                className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                                onChange={(e) => setFilters({ ...filters, priceCostFrom: e.target.value })}
                            />
                            <Input
                                type="number"
                                placeholder="Máximo"
                                value={filters.priceCostTo}
                                className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                                onChange={(e) => setFilters({ ...filters, priceCostTo: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Stock Control */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Control de Stock</Label>

                        <div className="flex items-center justify-between border border-border rounded-lg p-3 bg-muted/20">
                            <Label htmlFor="lowStock" className="text-[11px] font-bold text-foreground cursor-pointer uppercase tracking-wide">Stock Bajo (≤ Mínimo)</Label>
                            <Switch
                                id="lowStock"
                                checked={filters.lowStock}
                                onChange={(checked) => {
                                    setFilters({ ...filters, lowStock: checked.target.checked });
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-between border border-border rounded-lg p-3 bg-muted/20 mt-3">
                            <Label htmlFor="stockStatus" className="text-[11px] font-bold text-foreground cursor-pointer uppercase tracking-wide">Sin Stock (≤ 0)</Label>
                            <Switch
                                id="stockStatus"
                                checked={filters.stockStatus === 'out'}
                                onChange={(checked) => {
                                    setFilters({ ...filters, stockStatus: checked.target.checked ? 'out' : undefined });
                                }}
                            />
                        </div>
                    </div>

                    {/* Stock Range */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stock</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                placeholder="Mínimo"
                                value={filters.stockFrom}
                                className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                                onChange={(e) => setFilters({ ...filters, stockFrom: e.target.value })}
                            />
                            <Input
                                type="number"
                                placeholder="Máximo"
                                value={filters.stockTo}
                                className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                                onChange={(e) => setFilters({ ...filters, stockTo: e.target.value })}
                            />
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-border bg-card shrink-0 space-y-3">
                    <Button
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-wider"
                        onClick={() => {
                            onApplyFilters(filters);
                            onOpenChange(false);
                        }}
                    >
                        ✓ Aplicar Filtros
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full h-10 text-muted-foreground hover:text-foreground hover:bg-muted font-bold text-[10px] uppercase tracking-wider transition-all"
                        onClick={handleClear}
                    >
                        Limpiar Filtros
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
