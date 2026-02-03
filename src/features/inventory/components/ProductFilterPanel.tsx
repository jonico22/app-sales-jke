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
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white">
                <SheetHeader>
                    <SheetTitle>Filtros Avanzados de Productos</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Created By */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700">Creado por (UUID)</Label>
                        <TagInput
                            options={availableUsers}
                            value={filters.createdBy ? [filters.createdBy] : []}
                            onChange={(userIds) => setFilters({ ...filters, createdBy: userIds[0] })}
                            placeholder="Seleccionar usuario..."
                            maxTags={1}
                        />
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700">Rango de Precio Venta</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                placeholder="Mínimo"
                                value={filters.priceFrom}
                                onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
                            />
                            <Input
                                type="number"
                                placeholder="Máximo"
                                value={filters.priceTo}
                                onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Cost Range */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700">Rango de Precio Costo</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                placeholder="Mínimo"
                                value={filters.priceCostFrom}
                                onChange={(e) => setFilters({ ...filters, priceCostFrom: e.target.value })}
                            />
                            <Input
                                type="number"
                                placeholder="Máximo"
                                value={filters.priceCostTo}
                                onChange={(e) => setFilters({ ...filters, priceCostTo: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Stock Range */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700">Control de Stock</Label>

                        <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 mb-3">
                            <Label htmlFor="lowStock" className="text-sm font-medium cursor-pointer">Stock Bajo (≤ Mínimo)</Label>
                            <Switch
                                id="lowStock"
                                checked={filters.lowStock}
                                onChange={(checked) => {
                                    // Custom onChange for our Switch component or native checkbox behavior
                                    // If the Switch component expects a boolean event or value directly, adjust accordingly.
                                    // Assuming the Switch component takes an 'onChange' prop that receives a boolean based on previous usages or standard pattern.
                                    // Checking ProductForm usage: onChange={(e) => onChange(e.target.checked)} for native event or direct boolean.
                                    // Let's assume it accepts an event based on `ProductForm` usage `onChange={(e) => onChange(e.target.checked)}`
                                    // Wait, in ProductForm it was used with Controller.
                                    // Let's check CategoryEditModal usage: `onChange={(e) => setValue('active', e.target.checked)}` -> it receives an event.
                                    // So we need to create a synthetic event handler or just pass the value if the component supports it.
                                    // Let's rely on standard event for now:
                                    // The custom Switch component usually takes `onChange` with event.
                                    // Let's verify Switch usage in ProductForm: `onChange={(e) => onChange(e.target.checked)}`
                                    // So `e` is the event.
                                    // BUT, wait, I can just define the handler inline.
                                    setFilters({ ...filters, lowStock: checked.target.checked });
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                placeholder="Stock Mín"
                                value={filters.stockFrom}
                                onChange={(e) => setFilters({ ...filters, stockFrom: e.target.value })}
                            />
                            <Input
                                type="number"
                                placeholder="Stock Máx"
                                value={filters.stockTo}
                                onChange={(e) => setFilters({ ...filters, stockTo: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Creation Date Range */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700">Rango de Fecha de Creación</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <DatePickerInput
                                value={filters.createdAtFrom}
                                onChange={(date) => setFilters({ ...filters, createdAtFrom: date })}
                                maxDate={filters.createdAtTo || undefined}
                                placeholder="dd/mm/aaaa"
                                aria-label="Fecha inicio creación"
                            />
                            <DatePickerInput
                                value={filters.createdAtTo}
                                onChange={(date) => setFilters({ ...filters, createdAtTo: date })}
                                minDate={filters.createdAtFrom || undefined}
                                placeholder="dd/mm/aaaa"
                                aria-label="Fecha fin creación"
                            />
                        </div>
                    </div>

                    {/* Update Date Range */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-700">Rango de Fecha de Actualización</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <DatePickerInput
                                value={filters.updatedAtFrom}
                                onChange={(date) => setFilters({ ...filters, updatedAtFrom: date })}
                                maxDate={filters.updatedAtTo || undefined}
                                placeholder="dd/mm/aaaa"
                                aria-label="Fecha inicio actualización"
                            />
                            <DatePickerInput
                                value={filters.updatedAtTo}
                                onChange={(date) => setFilters({ ...filters, updatedAtTo: date })}
                                minDate={filters.updatedAtFrom || undefined}
                                placeholder="dd/mm/aaaa"
                                aria-label="Fecha fin actualización"
                            />
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-white space-y-3">
                    <Button
                        className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-6 rounded-xl text-base shadow-lg shadow-sky-500/20"
                        onClick={() => {
                            onApplyFilters(filters);
                            onOpenChange(false);
                        }}
                    >
                        ✓ Aplicar Filtros
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-4"
                        onClick={handleClear}
                    >
                        Limpiar Filtros
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
