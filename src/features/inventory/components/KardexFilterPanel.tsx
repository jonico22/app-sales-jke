import { useState } from 'react';
import { 
    Filter, 
    RotateCcw, 
    Calendar,
    Search,
    ArrowRightLeft
} from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import type { KardexMovementType } from '@/services/kardex.service';

export interface KardexFilterValues {
    type?: string;
    branchId?: string;
    productId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

interface KardexFilterPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApplyFilters: (filters: KardexFilterValues) => void;
    currentFilters: KardexFilterValues;
}

export function KardexFilterPanel({ 
    open, 
    onOpenChange, 
    onApplyFilters,
    currentFilters 
}: KardexFilterPanelProps) {
    const [filters, setFilters] = useState<KardexFilterValues>(currentFilters);
    const isMobile = useMediaQuery('(max-width: 767px)');

    const handleReset = () => {
        const resetFilters: KardexFilterValues = {};
        setFilters(resetFilters);
        onApplyFilters(resetFilters);
        onOpenChange(false);
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onOpenChange(false);
    };

    const movementTypes: { value: KardexMovementType | 'ALL'; label: string }[] = [
        { value: 'ALL', label: 'Todos los tipos' },
        { value: 'SALE_EXIT', label: 'Venta (Salida)' },
        { value: 'TRANSFER_IN', label: 'Traslado (Entrada)' },
        { value: 'TRANSFER_OUT', label: 'Traslado (Salida)' },
        { value: 'ADJUSTMENT_ADD', label: 'Ajuste (Ingreso)' },
        { value: 'ADJUSTMENT_SUB', label: 'Ajuste (Salida)' },
        { value: 'PURCHASE_ENTRY', label: 'Compra (Entrada)' },
        { value: 'RETURN_ENTRY', label: 'Devolución (Entrada)' },
    ];

    const renderContent = () => (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-6 pt-2 pb-6 space-y-6 custom-scrollbar">
                {/* Movement Type */}
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                        <ArrowRightLeft className="w-3 h-3 text-primary" />
                        Tipo de Movimiento
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {movementTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setFilters(prev => ({ ...prev, type: type.value === 'ALL' ? undefined : type.value }))}
                                className={cn(
                                    "px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95",
                                    (filters.type === type.value || (type.value === 'ALL' && !filters.type))
                                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                        : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50'
                                )}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-primary" />
                        Rango de Fechas
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest ml-1 text-center">Desde</p>
                            <Input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                className="h-11 rounded-xl bg-muted/30 border-border/50 text-[11px] font-bold uppercase tracking-wider focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest ml-1 text-center">Hasta</p>
                            <Input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                className="h-11 rounded-xl bg-muted/30 border-border/50 text-[11px] font-bold uppercase tracking-wider focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Search by Product/Doc */}
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                        <Search className="w-3 h-3 text-primary" />
                        Búsqueda Directa
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                        <Input
                            placeholder="PRODUCTO, CÓDIGO O DOCUMENTO..."
                            value={filters.search || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="h-12 pl-10 rounded-xl bg-muted/30 border-border/50 text-[10px] font-bold uppercase tracking-widest focus:ring-primary/20 placeholder:text-muted-foreground/30"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="shrink-0 p-6 mt-auto bg-background border-t border-border/50 flex flex-row gap-3 pb-safe-area-bottom pb-24 lg:pb-6">
                <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted transition-all active:scale-95"
                >
                    <RotateCcw className="w-4 h-4 mr-2 opacity-50" />
                    Limpiar
                </Button>
                <Button
                    onClick={handleApply}
                    className="flex-[2] h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Aplicar Filtros
                </Button>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent side="bottom" className="h-[92vh] p-0 rounded-t-[32px] overflow-hidden bg-background border-none">
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
                    </div>
                    <SheetHeader className="px-6 pb-0 text-left">
                        <SheetTitle className="text-xl font-black text-foreground uppercase tracking-tight">Filtros Avanzados</SheetTitle>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Refina tu búsqueda en el historial</p>
                    </SheetHeader>
                    {renderContent()}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-background">
                <DialogHeader className="p-6 pb-0">
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-black text-foreground uppercase tracking-tight">Filtros Avanzados</DialogTitle>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Refina tu búsqueda en el historial</p>
                    </div>
                </DialogHeader>
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}
