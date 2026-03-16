import { Truck, Info, Trash2, ArrowRight } from 'lucide-react';
import { 
    Button, 
    Badge, 
    Input,
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui';
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
            <DialogContent className="max-w-4xl p-0 bg-card border-none shadow-2xl overflow-hidden rounded-[2rem]">
                {/* Header Section */}
                <div className="p-8 pb-6 border-b border-border/40 relative">
                    <div className="flex items-start gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Truck className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tight leading-none">
                                Productos Seleccionados para Traslado
                            </DialogTitle>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                                JKE SOLUTIONS • LOGÍSTICA
                            </p>
                        </div>
                    </div>
                </div>

                {/* Route Representation */}
                <div className="px-8 py-6 bg-muted/20 flex items-center justify-between border-b border-border/40">
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">Origen</p>
                        <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[13px] font-black text-foreground uppercase tracking-tight">{originBranchName}</span>
                        </div>
                    </div>

                    <div className="h-px flex-1 mx-12 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-card border border-border/40 rounded-full shadow-sm text-primary">
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>

                    <div className="space-y-1.5 text-right">
                        <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">Destino</p>
                        <div className="flex items-center gap-2.5 justify-end">
                            <span className="text-[13px] font-black text-foreground uppercase tracking-tight">{destinationBranchName}</span>
                            <div className="w-2 h-2 rounded-full border-2 border-primary" />
                        </div>
                    </div>
                </div>

                {/* Content Area - Table */}
                <div className="max-h-[50vh] overflow-y-auto px-8 py-4">
                    <table className="w-full">
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
                </div>

                {/* Footer Section */}
                <div className="p-8 pt-6 border-t border-border/40 bg-muted/10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-10">
                            <div className="space-y-1.5">
                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">Total Ítems</p>
                                <p className="text-xl font-black text-foreground uppercase tracking-tight">
                                    {totalItems} <span className="text-xs text-muted-foreground font-black opacity-40 ml-1">productos</span>
                                </p>
                            </div>
                            <div className="space-y-1.5 border-l border-border/40 pl-10">
                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">Total Movimiento</p>
                                <p className="text-xl font-black text-foreground uppercase tracking-tight">
                                    {totalUnits} <span className="text-xs text-muted-foreground font-black opacity-40 ml-1">unidades</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-8 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-all"
                            >
                                Cancelar
                            </button>
                            <Button
                                onClick={onConfirm}
                                disabled={isLoading || items.filter(i => i.quantity > 0).length === 0}
                                className="h-14 px-10 rounded-[1.25rem] bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 text-sky-600/70">
                        <div className="p-2 bg-sky-500/10 rounded-xl shrink-0">
                            <Info className="w-4 h-4 text-sky-500" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-wider leading-relaxed">
                            Asegúrese de contar con el transporte adecuado para el volumen total de unidades.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
