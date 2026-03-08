import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button, Label, Input } from '@/components/ui';
import { DatePickerInput } from '@/components/shared/DatePickerInput';
import { TagInput, type TagOption } from '@/components/shared/TagInput';
import { orderService } from '@/services/order.service';
import { toast } from 'sonner';

interface SalesHistoryFilterPanelProps {
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
    totalFrom: string;
    totalTo: string;
}

export function SalesHistoryFilterPanel({
    open,
    onOpenChange,
    onApplyFilters,
}: SalesHistoryFilterPanelProps) {
    const [filters, setFilters] = useState<FilterValues>({
        createdBy: undefined,
        createdAtFrom: null,
        createdAtTo: null,
        updatedAtFrom: null,
        updatedAtTo: null,
        totalFrom: '',
        totalTo: '',
    });
    const [availableUsers, setAvailableUsers] = useState<TagOption[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await orderService.getCreatedByUsers();
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
            totalFrom: '',
            totalTo: '',
        };
        setFilters(emptyFilters);
        onApplyFilters(emptyFilters);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card border-l border-border">
                <SheetHeader className="p-6 border-b border-border">
                    <SheetTitle className="text-xl font-black text-foreground tracking-tight uppercase">Filtros Avanzados</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Created By */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-foreground">Vendedor / Usuario</Label>
                        <TagInput
                            options={availableUsers}
                            value={filters.createdBy ? [filters.createdBy] : []}
                            onChange={(userIds) => setFilters({ ...filters, createdBy: userIds[0] })}
                            placeholder="Seleccionar usuario..."
                            maxTags={1}
                        />
                    </div>

                    {/* Total Amount Range */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-foreground">Rango de Monto Total</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                placeholder="Mínimo"
                                value={filters.totalFrom}
                                onChange={(e) => setFilters({ ...filters, totalFrom: e.target.value })}
                                className="bg-muted/30 border-border focus:bg-background"
                            />
                            <Input
                                type="number"
                                placeholder="Máximo"
                                value={filters.totalTo}
                                onChange={(e) => setFilters({ ...filters, totalTo: e.target.value })}
                                className="bg-muted/30 border-border focus:bg-background"
                            />
                        </div>
                    </div>

                    {/* Creation Date Range */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-foreground">Rango de Fecha de Creación</Label>
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
                        <Label className="text-sm font-bold text-foreground">Rango de Fecha de Actualización</Label>
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
                <div className="p-6 border-t border-border bg-muted/20 space-y-3">
                    <Button
                        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground py-7 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        onClick={() => {
                            onApplyFilters(filters);
                            onOpenChange(false);
                        }}
                    >
                        ✓ Aplicar Filtros
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-foreground hover:bg-muted py-5 font-bold rounded-xl transition-colors"
                        onClick={handleClear}
                    >
                        Limpiar Filtros
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
