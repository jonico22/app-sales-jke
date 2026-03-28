import { Check, Package, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Product } from '@/services/product.service';

interface CreateMovementStep2Props {
    referenceCode: string;
    originBranchId: string;
    destinationBranchId: string;
    selectedProduct: Product | null;
    quantity: number;
    isLoading: boolean;
    onComplete: () => void;
    getBranchName: (id: string) => string;
    getBranchAddress: (id: string) => string;
}

export function CreateMovementStep2({
    referenceCode,
    originBranchId,
    destinationBranchId,
    selectedProduct,
    quantity,
    isLoading,
    onComplete,
    getBranchName,
    getBranchAddress
}: CreateMovementStep2Props) {
    return (
        <div className="space-y-4">
            {/* Summary Header */}
            <div className="bg-card border-border border shadow-sm rounded-3xl overflow-hidden">
                <div className="p-4 px-6 border-b border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Check className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-black text-foreground tracking-tight uppercase">Resumen del Traslado</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50">REF:</span>
                        <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest py-1 border-border bg-muted/20">
                            {referenceCode}
                        </Badge>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                        {/* Connection Line */}
                        <div className="hidden lg:block absolute left-[1.75rem] top-[4rem] bottom-[4rem] w-px bg-gradient-to-b from-primary/40 via-primary/20 to-primary/40 border-l border-dashed border-primary/30" />

                        {/* Locations Column */}
                        <div className="space-y-8">
                            {/* Origin */}
                            <div className="flex gap-6 relative">
                                <div className="w-14 h-14 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center shrink-0 shadow-sm z-10">
                                    <div className="w-3 h-3 rounded-full border-[3px] border-primary/40" />
                                </div>
                                <div className="space-y-1 py-1">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-60">Origen</p>
                                    <h3 className="text-base font-black text-foreground uppercase tracking-tight leading-none">{getBranchName(originBranchId)}</h3>
                                    <p className="text-[11px] text-muted-foreground font-medium opacity-60">{getBranchAddress(originBranchId)}</p>
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="flex gap-6 relative">
                                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-xl shadow-primary/20 z-10">
                                    <div className="w-3 h-3 rounded-full border-[3px] border-white" />
                                </div>
                                <div className="space-y-1 py-1">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-60">Destino</p>
                                    <h3 className="text-base font-black text-foreground uppercase tracking-tight leading-none">{getBranchName(destinationBranchId)}</h3>
                                    <p className="text-[11px] text-muted-foreground font-medium opacity-60">{getBranchAddress(destinationBranchId)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Details Card */}
                        <div className="lg:pl-4">
                            <div className="bg-muted/10 border border-border/40 rounded-3xl p-6 space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center p-2">
                                        {selectedProduct?.image ? (
                                            <img src={selectedProduct.image} className="w-full h-full object-cover rounded-xl" alt={selectedProduct.name} />
                                        ) : (
                                            <Package className="w-6 h-6 text-primary/40" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">Producto a Trasladar</p>
                                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight leading-tight">{selectedProduct?.name}</h4>
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">SKU-{selectedProduct?.code || '---'}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-foreground tracking-tighter">{quantity}</span>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">UNID.</span>
                                    </div>
                                    <div className="max-w-[140px] text-right">
                                        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic opacity-60">
                                            Cantidad verificada para envío inmediato.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4">
                <Button
                    onClick={onComplete}
                    disabled={isLoading}
                    className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Finalizar y Completar Traslado
                            <Check className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
