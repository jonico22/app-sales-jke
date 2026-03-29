import { Truck, Info, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog';
import { DialogTitle } from '@/components/ui/dialog';
import { type Product } from '@/services/product.service';

interface SelectedItem {
    product: Product;
    quantity: number;
    notes: string;
}

interface TransferPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    originBranchName: string;
    destinationBranchName: string;
    items: SelectedItem[];
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
}

export function TransferPreviewModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    originBranchName,
    destinationBranchName,
    items,
    onUpdateQuantity,
    onRemoveItem
}: TransferPreviewModalProps) {
    const totalItems = items.length;
    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-[95vw] md:w-full p-0 bg-card border-none shadow-2xl overflow-hidden rounded-3xl md:rounded-[2rem]">
                {/* Header Section */}
                <div className="p-5 md:p-8 pb-4 md:pb-6 border-b border-border/40 relative">
                    <div className="flex items-start gap-4 md:gap-5">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Truck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <div className="space-y-0.5 md:space-y-1">
                            <DialogTitle className="text-base md:text-2xl font-black text-foreground uppercase tracking-tight leading-tight">
                                Confirmar Traslado
                            </DialogTitle>
                            <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                                JKE SOLUTIONS • LOGÍSTICA
                            </p>
                        </div>
                    </div>
                </div>

                {/* Route Representation */}
                <div className="px-5 md:px-8 py-4 md:py-6 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 border-b border-border/40">
                    <div className="space-y-1 md:space-y-1.5">
                        <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">Origen</p>
                        <div className="flex items-center gap-2 md:gap-2.5">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary" />
                            <span className="text-[11px] md:text-[13px] font-black text-foreground uppercase tracking-tight">{originBranchName}</span>
                        </div>
                    </div>

                    <div className="hidden md:block h-px flex-1 mx-12 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-card border border-border/40 rounded-full shadow-sm text-primary">
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>

                    <div className="space-y-1 md:space-y-1.5 text-left md:text-right">
                        <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">Destino</p>
                        <div className="flex items-center gap-2 md:gap-2.5 justify-start md:justify-end">
                            <span className="text-[11px] md:text-[13px] font-black text-foreground uppercase tracking-tight">{destinationBranchName}</span>
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full border-2 border-primary" />
                        </div>
                    </div>
                </div>

                {/* Content Area - Products */}
                <div className="max-h-[40vh] md:max-h-[50vh] overflow-y-auto px-5 md:px-8 py-2 md:py-4">
                    {/* Desktop View */}
                    <table className="hidden md:table w-full">
                        <thead className="sticky top-0 bg-card z-10">
                            <tr className="border-b border-border/40">
                                <th className="py-4 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-2">Producto</th>
                                <th className="py-4 text-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">Stock Origen</th>
                                <th className="py-4 text-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">Cantidad</th>
                                <th className="py-4 text-right text-[9px] font-black text-muted-foreground uppercase tracking-widest pr-2">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {items.map((item) => (
                                <tr key={item.product.id} className="group hover:bg-muted/10 transition-colors">
                                    <td className="py-4 pl-2">
                                        <div className="flex items-center gap-4">
                                            {item.product.image ? (
                                                <img 
                                                    src={item.product.image} 
                                                    alt={item.product.name}
                                                    className="w-12 h-12 rounded-xl object-cover bg-muted border border-border/40" 
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-muted border border-border/40 flex items-center justify-center">
                                                    <Truck className="w-5 h-5 opacity-20" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black text-foreground uppercase leading-tight">{item.product.name}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground opacity-40">SKU-{item.product.code}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-center">
                                        <Badge variant="outline" className="h-7 px-3 bg-muted/40 border-border/40 text-[11px] font-black text-foreground rounded-lg">
                                            {item.product.stock} u.
                                        </Badge>
                                    </td>
                                    <td className="py-4 text-center">
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                                            className="w-24 h-10 mx-auto text-center font-black text-sm rounded-xl bg-muted/20 border-border"
                                        />
                                    </td>
                                    <td className="py-4 text-right pr-2">
                                        <button 
                                            onClick={() => onRemoveItem(item.product.id)}
                                            className="p-2.5 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Card List View */}
                    <div className="md:hidden divide-y divide-border/20">
                        {items.map((item) => (
                            <div key={item.product.id} className="py-4 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-muted border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                                            {item.product.image ? (
                                                <img src={item.product.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <Truck className="w-4 h-4 opacity-20" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-foreground uppercase tracking-tight leading-tight">{item.product.name}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground opacity-40">SKU-{item.product.code}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onRemoveItem(item.product.id)}
                                        className="p-2 text-destructive/40 hover:text-destructive hover:bg-destructive/5 rounded-lg shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-end">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest pl-1">Stock Orig.</p>
                                        <div className="h-9 flex items-center px-3 bg-muted/20 rounded-xl text-[10px] font-black text-foreground">
                                            {item.product.stock} u.
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest pl-1">Cant. Mover</p>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                                            className="h-9 text-center font-black text-xs rounded-xl bg-muted/20 border-border"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-5 md:p-8 pt-4 md:pt-6 border-t border-border/40 bg-muted/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-8">
                        <div className="flex items-center gap-6 md:gap-10">
                            <div className="space-y-1 md:space-y-1.5">
                                <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">Ítems</p>
                                <p className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                                    {totalItems} <span className="text-[10px] md:text-xs text-muted-foreground font-black opacity-40 ml-1">prod.</span>
                                </p>
                            </div>
                            <div className="space-y-1 md:space-y-1.5 border-l border-border/40 pl-6 md:pl-10">
                                <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">Total</p>
                                <p className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">
                                    {totalUnits} <span className="text-[10px] md:text-xs text-muted-foreground font-black opacity-40 ml-1">unid.</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <Button
                                onClick={onConfirm}
                                disabled={isLoading || items.filter(i => i.quantity > 0).length === 0}
                                className="h-12 md:h-14 w-full sm:w-auto px-8 md:px-10 rounded-xl md:rounded-[1.25rem] bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl md:shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 md:gap-4 text-xs font-black uppercase tracking-widest md:tracking-[0.2em] transition-all order-1 sm:order-2"
                            >
                                {isLoading ? (
                                    <Truck className="w-5 h-5 animate-bounce" />
                                ) : (
                                    <>
                                        Confirmar Traslado
                                        <Truck className="w-5 h-5" />
                                    </>
                                )}
                            </Button>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="w-full sm:w-auto px-8 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-all order-2 sm:order-1"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 md:gap-4 p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 text-sky-600/70">
                        <div className="p-2 bg-sky-500/10 rounded-xl shrink-0">
                            <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-sky-500" />
                        </div>
                        <p className="text-[10px] md:text-[11px] font-black uppercase tracking-wider leading-relaxed">
                            Asegúrese de contar con el transporte adecuado para el volumen total de unidades.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
