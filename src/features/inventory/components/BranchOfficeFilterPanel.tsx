import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button, Label } from '@/components/ui';
import { DatePickerInput } from '@/components/shared/DatePickerInput';
import { TagInput, type TagOption } from '@/components/shared/TagInput';
import { branchOfficeService } from '@/services/branch-office.service';
import { toast } from 'sonner';

interface BranchOfficeFilterPanelProps {
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
}

export function BranchOfficeFilterPanel({
    open,
    onOpenChange,
    onApplyFilters,
}: BranchOfficeFilterPanelProps) {
    const [filters, setFilters] = useState<FilterValues>({
        createdBy: undefined,
        createdAtFrom: null,
        createdAtTo: null,
        updatedAtFrom: null,
        updatedAtTo: null,
    });
    const [availableUsers, setAvailableUsers] = useState<TagOption[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await branchOfficeService.getCreatedByUsers();
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
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Refine su búsqueda de sucursales con filtros detallados.</p>
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

                    {/* Creation Date Range */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fecha de Creación</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <DatePickerInput
                                value={filters.createdAtFrom}
                                onChange={(date) => setFilters({ ...filters, createdAtFrom: date })}
                                maxDate={filters.createdAtTo || undefined}
                                placeholder="Desde"
                            />
                            <DatePickerInput
                                value={filters.createdAtTo}
                                onChange={(date) => setFilters({ ...filters, createdAtTo: date })}
                                minDate={filters.createdAtFrom || undefined}
                                placeholder="Hasta"
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
                            />
                            <DatePickerInput
                                value={filters.updatedAtTo}
                                onChange={(date) => setFilters({ ...filters, updatedAtTo: date })}
                                minDate={filters.updatedAtFrom || undefined}
                                placeholder="Hasta"
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
