import { useState, useCallback } from 'react';
import { 
    PlusCircle, 
    MinusCircle, 
    Package, 
    Building2, 
    Search,
    Loader2,
    CheckCircle2,
    ChevronDown
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
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Product } from '@/services/product.service';
import { cn } from '@/lib/utils';
import { useBranchOfficesSelect } from '../hooks/useBranchOfficeQueries';
import { useBranchOfficeProductSearch, useManualAdjustment } from '../hooks/useKardexQueries';

interface ManualAdjustmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ManualAdjustmentModal({ 
    open, 
    onOpenChange, 
    onSuccess 
}: ManualAdjustmentModalProps) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    
    // Data fetching
    const { data: branches = [] } = useBranchOfficesSelect();
    
    // Form state
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [adjustmentType, setAdjustmentType] = useState<'ADJUSTMENT_ADD' | 'ADJUSTMENT_SUB'>('ADJUSTMENT_ADD');
    const [quantity, setQuantity] = useState<string>('');
    const [unitCost, setUnitCost] = useState<string>('');
    const [notes, setNotes] = useState('');

    // Product search query
    const { data: searchResults = { data: [] }, isLoading: isSearchingProducts } = useBranchOfficeProductSearch(selectedBranchId, searchTerm);
    const products = searchResults.data;

    // Mutation
    const adjustmentMutation = useManualAdjustment();

    const resetForm = useCallback(() => {
        setSelectedBranchId('');
        setSearchTerm('');
        setSelectedProduct(null);
        setAdjustmentType('ADJUSTMENT_ADD');
        setQuantity('');
        setUnitCost('');
        setNotes('');
    }, []);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        if (!newOpen) {
            resetForm();
        }
        onOpenChange(newOpen);
    }, [onOpenChange, resetForm]);

    const handleSubmit = async () => {
        if (!selectedProduct || !selectedBranchId || !quantity || !unitCost) {
            toast.error('Por favor complete todos los campos obligatorios');
            return;
        }

        try {
            await adjustmentMutation.mutateAsync({
                productId: selectedProduct.id,
                branchOfficeId: selectedBranchId,
                type: adjustmentType,
                quantity: Number(quantity),
                unitCost: Number(unitCost),
                notes: notes || undefined
            });

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            // Error is handled by mutation
            console.error('Error creating adjustment:', error);
        }
    };

    const isSubmitting = adjustmentMutation.isPending;

    const renderContent = () => (
        <div className="flex flex-col h-full bg-background">
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-5 space-y-5 custom-scrollbar-hide">
                {/* Branch Selection */}
                <div className="space-y-2">
                    <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em] flex items-center gap-2">
                        <Building2 className="w-3 h-3 text-primary" />
                        Sucursal de Origen
                    </label>
                    <div className="relative">
                        <select
                            value={selectedBranchId}
                            onChange={(e) => {
                                setSelectedBranchId(e.target.value);
                                setSelectedProduct(null);
                                setSearchTerm('');
                            }}
                            className="w-full h-11 px-4 pr-12 rounded-xl bg-muted/30 border border-border/50 text-[11px] font-semibold tracking-[0.02em] outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                        >
                            <option value="">Selecciona una sucursal...</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                    </div>
                </div>

                {/* Product Search */}
                <div className="space-y-2">
                    <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em] flex items-center gap-2">
                        <Package className="w-3 h-3 text-primary" />
                        Producto a Ajustar
                    </label>
                    {selectedProduct ? (
                        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Package className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[11px] font-semibold text-foreground truncate">{selectedProduct.name}</span>
                                    <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.12em]">{selectedProduct.code}</span>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSelectedProduct(null)}
                                className="h-8 text-[10px] font-semibold text-rose-500 uppercase tracking-[0.12em] hover:bg-rose-500/10 ml-2"
                            >
                                Cambiar
                            </Button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                            <Input
                                placeholder={selectedBranchId ? "BUSCAR POR NOMBRE O CÓDIGO..." : "PRIMERO SELECCIONA UNA SUCURSAL"}
                                disabled={!selectedBranchId}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 pl-10 rounded-xl bg-muted/30 border-border/50 text-[11px] font-medium tracking-[0.02em]"
                            />
                            {isSearchingProducts && (
                                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                            )}
                            
                            {products && products.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 p-1.5 space-y-0.5">
                                    {products.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => setSelectedProduct(product)}
                                            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted text-left transition-colors"
                                        >
                                            <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                                                <Package className="w-3.5 h-3.5 text-muted-foreground" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-semibold text-foreground truncate">{product.name}</span>
                                                <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-[0.12em]">{product.code}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Adjustment Type & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">Tipo de Ajuste</label>
                        <div className="flex p-1 bg-muted/40 rounded-xl gap-1">
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('ADJUSTMENT_ADD')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-[0.12em] transition-all",
                                    adjustmentType === 'ADJUSTMENT_ADD'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-muted-foreground hover:bg-muted'
                                )}
                            >
                                <PlusCircle size={14} />
                                Ingreso
                            </button>
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('ADJUSTMENT_SUB')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-[0.12em] transition-all",
                                    adjustmentType === 'ADJUSTMENT_SUB'
                                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                        : 'text-muted-foreground hover:bg-muted'
                                )}
                            >
                                <MinusCircle size={14} />
                                Salida
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">Cantidad</label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="h-11 rounded-xl bg-muted/30 border-border/50 text-[14px] font-semibold text-center"
                        />
                    </div>
                </div>

                {/* Cost & Notes */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">Costo Unitario (S/)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-muted-foreground/40">S/</span>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={unitCost}
                                onChange={(e) => setUnitCost(e.target.value)}
                                className="h-11 pl-10 rounded-xl bg-muted/30 border-border/50 text-[14px] font-semibold"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">Notas / Observaciones</label>
                        <Textarea
                            placeholder="Indica el motivo del ajuste (ej. Rotura, Error de inventario físico...)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px] rounded-2xl bg-muted/30 border-border/50 text-[11px] font-medium p-4 resize-none focus:bg-card transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="shrink-0 p-5 mt-auto bg-background border-t border-border/50 flex flex-row gap-3 pb-safe-area-bottom pb-24 lg:pb-5">
                <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 h-11 rounded-2xl text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:bg-muted"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedProduct}
                    className="flex-[2] h-11 rounded-2xl text-[9px] font-semibold uppercase tracking-[0.12em] bg-primary hover:bg-primary-hover text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirmar
                        </>
                    )}
                </Button>
            </div>
        </div>
    );

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-background">
                    <DialogHeader className="p-5 pb-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">Ajuste Manual</DialogTitle>
                                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.12em] opacity-70">Corrige discrepancias en el inventario</p>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-hidden">
                        {renderContent()}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent side="bottom" className="h-[92vh] p-0 rounded-t-[32px] overflow-hidden bg-background border-none">
                {/* Handle Bar */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
                </div>
                <SheetHeader className="p-5 pb-0 border-none bg-background text-left">
                    <div className="space-y-0.5">
                        <SheetTitle className="text-lg font-semibold text-foreground tracking-tight">Ajuste Manual</SheetTitle>
                        <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.12em] opacity-70">Corrige discrepancias en el inventario</p>
                    </div>
                </SheetHeader>
                <div className="flex-1 overflow-hidden mt-2">
                    {renderContent()}
                </div>
            </SheetContent>
        </Sheet>
    );
}
