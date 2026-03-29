import { ShoppingCart, Loader2 } from 'lucide-react';

interface SearchCartFooterProps {
    totalItems: number;
    totalPrice: number;
    currencySymbol: string;
    isCreatingOrder: boolean;
    onClearCart: () => void;
    onEditOrder: () => void;
    onPay: () => void;
}

export function SearchCartFooter({
    totalItems,
    totalPrice,
    currencySymbol,
    isCreatingOrder,
    onClearCart,
    onEditOrder,
    onPay
}: SearchCartFooterProps) {
    if (totalItems === 0) return null;

    return (
        <div className="sticky bottom-0 left-0 w-full bg-card border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Summary Info */}
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                            Productos Seleccionados
                        </span>
                        <span className="text-lg font-bold text-foreground leading-none">{totalItems}</span>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                            Subtotal Estimado
                        </span>
                        <span className="text-lg font-bold text-[#4096d8] leading-none">
                            {currencySymbol} {totalPrice.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 w-full md:w-auto">
                    <button
                        onClick={onClearCart}
                        className="hidden md:flex px-6 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors active:scale-95"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={onEditOrder}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-[#4096d8] text-[#4096d8] hover:bg-blue-50 transition-all active:scale-95 bg-white"
                    >
                        <span className="font-medium text-sm">EDITAR PEDIDO</span>
                    </button>
                    <button
                        onClick={onPay}
                        disabled={isCreatingOrder}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#4096d8] text-white hover:bg-blue-500 transition-all active:scale-95 shadow-md shadow-[#4096d8]/20 disabled:opacity-50"
                    >
                        {isCreatingOrder ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span className="font-medium text-sm">PAGAR</span>
                                <div className="relative flex items-center justify-center ml-1">
                                    <ShoppingCart className="w-[18px] h-[18px]" />
                                    <div className="absolute -top-1.5 -right-2 bg-cyan-400 text-white text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                                        {totalItems}
                                    </div>
                                </div>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
