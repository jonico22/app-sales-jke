import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button, Label, Input, Switch } from '@/components/ui';
import { DatePickerInput } from '@/components/shared/DatePickerInput';
import { TagInput, type TagOption } from '@/components/shared/TagInput';
import { productService } from '@/services/product.service';
import { toast } from 'sonner';

interface ProductFilterPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApplyFilters: (filters: FilterValues) => void;
}

export interface FilterValues {
    createdBy?: string;
    createdAtFrom: Date | null;
    createdAtTo: Date | null;
    updatedAtFrom: Date | null;
    updatedAtTo: Date | null;
    priceFrom: string;
    priceTo: string;
    priceCostFrom: string;
    priceCostTo: string;
    stockFrom: string;
    stockTo: string;
    lowStock: boolean;
}



export function ProductFilterPanel({
    open,
    onOpenChange,
    onApplyFilters,
}: ProductFilterPanelProps) {
    const [filters, setFilters] = useState<FilterValues>({
        createdBy: undefined,
        createdAtFrom: null,
        createdAtTo: null,
        updatedAtFrom: null,
        updatedAtTo: null,
        priceFrom: '',
        priceTo: '',
        priceCostFrom: '',
        priceCostTo: '',
        stockFrom: '',
        stockTo: '',
        lowStock: false,
    });
    const [availableUsers, setAvailableUsers] = useState<TagOption[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await productService.getCreatedByUsers();
                if (response.success && response.data) {
                    setAvailableUsers(response.data.map(user => ({
                        id: user.id,
                        name: user.name
                    })));
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error('Error al cargar lista de usuarios');
            }
        };

        if (open) {
            fetchUsers();
        }
    }, [open]);

    const handleClear = () => {
        const emptyFilters = {
            createdBy: undefined,
            createdAtFrom: null,
            createdAtTo: null,
            updatedAtFrom: null,
            updatedAtTo: null,
            priceFrom: '',
            priceTo: '',
            priceCostFrom: '',
            priceCostTo: '',
            stockFrom: '',
            stockTo: '',
            lowStock: false,
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

                    {/* Created By */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Creado por</Label>
                        <TagInput
                            options={availableUsers}
                            value={filters.createdBy ? [filters.createdBy] : []}
                            onChange={(userIds) => setFilters({ ...filters, createdBy: userIds[0] })}
                            placeholder="Seleccionar..."
                            maxTags={1}
                        />
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

                    {/* Stock Range */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Control de Stock</Label>

                        <div className="flex items-center justify-between border border-border rounded-lg p-3 mb-3 bg-muted/20">
                            <Label htmlFor="lowStock" className="text-[11px] font-bold text-foreground cursor-pointer uppercase tracking-wide">Stock Bajo (≤ Mínimo)</Label>
                            <Switch
                                id="lowStock"
                                checked={filters.lowStock}
                                onChange={(checked) => {
                                    setFilters({ ...filters, lowStock: checked.target.checked });
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                placeholder="Stock Mín"
                                value={filters.stockFrom}
                                className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                                onChange={(e) => setFilters({ ...filters, stockFrom: e.target.value })}
                            />
                            <Input
                                type="number"
                                placeholder="Stock Máx"
                                value={filters.stockTo}
                                className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                                onChange={(e) => setFilters({ ...filters, stockTo: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Creation Date Range */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fecha de Creación</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <DatePickerInput
                                value={filters.createdAtFrom}
                                onChange={(date) => setFilters({ ...filters, createdAtFrom: date })}
                                maxDate={filters.createdAtTo || undefined}
                                placeholder="Desde"
                                aria-label="Fecha inicio creación"
                            />
                            <DatePickerInput
                                value={filters.createdAtTo}
                                onChange={(date) => setFilters({ ...filters, createdAtTo: date })}
                                minDate={filters.createdAtFrom || undefined}
                                placeholder="Hasta"
                                aria-label="Fecha fin creación"
                            />
                        </div>
                    </div>

                    {/* Update Date Range */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fecha de Actualización</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <DatePickerInput
                                value={filters.updatedAtFrom}
                                onChange={(date) => setFilters({ ...filters, updatedAtFrom: date })}
                                maxDate={filters.updatedAtTo || undefined}
                                placeholder="Desde"
                                aria-label="Fecha inicio actualización"
                            />
                            <DatePickerInput
                                value={filters.updatedAtTo}
                                onChange={(date) => setFilters({ ...filters, updatedAtTo: date })}
                                minDate={filters.updatedAtFrom || undefined}
                                placeholder="Hasta"
                                aria-label="Fecha fin actualización"
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
