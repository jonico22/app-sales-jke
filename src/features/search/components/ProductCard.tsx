import { Heart, Package, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/services/product.service';
import { useSocietyStore } from '@/store/society.store';
import { useCartStore } from '@/store/cart.store';

interface ProductCardProps {
    product: Product;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
    onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, isFavorite, onToggleFavorite }: Omit<ProductCardProps, 'onAddToCart'>) {
    const society = useSocietyStore(state => state.society);
    const { items, addItem, updateQuantity, removeItem } = useCartStore();

    const cartItem = items.find(item => item.product.id === product.id);
    const quantity = cartItem?.quantity || 0;

    const handleIncrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (stock <= 0) return;
        if (quantity >= stock) return;

        if (quantity === 0) {
            addItem(product, 1);
        } else {
            updateQuantity(product.id, quantity + 1);
        }
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (quantity > 1) {
            updateQuantity(product.id, quantity - 1);
        } else {
            removeItem(product.id);
        }
    };

    // Stock Level Logic
    const stock = Number(product.stock);
    const minStock = Number(product.minStock || 10);
    
    let stockStatus: 'normal' | 'low' | 'out' = 'normal';
    if (stock <= 0) stockStatus = 'out';
    else if (stock <= minStock) stockStatus = 'low';

    const stockStyles = {
        normal: "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30",
        low: "bg-orange-100/80 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200/50 dark:border-orange-500/30",
        out: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
    };

    const stockLabels = {
        normal: `STOCK: ${stock}`,
        low: `STOCK BAJO: ${stock}`,
        out: `AGOTADO`
    };

    return (
        <>
            {/* DESKTOP LAYOUT (lg and up) - Restored Old Design */}
            <div className={cn(
                "hidden lg:flex bg-card text-card-foreground border rounded-[12px] p-4 items-center justify-between gap-6 hover:shadow-md transition-all group",
                quantity > 0 ? 'border-[#4096d8] shadow-sm shadow-[#4096d8]/10' : 'border-border'
            )}>
                {/* Image/Icon */}
                <div className="w-16 h-16 bg-muted/60 rounded-[8px] flex items-center justify-center shrink-0 border border-muted">
                    <Package className="w-8 h-8 text-muted-foreground/50" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-bold text-[15px] text-foreground truncate">
                            {product.name}
                            {product.color && <span className="font-normal text-muted-foreground ml-1">({product.color})</span>}
                        </h3>
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
                            className="focus:outline-none shrink-0"
                        >
                            <Heart className={cn("w-4 h-4 transition-colors", isFavorite ? 'fill-[#4096d8] text-[#4096d8]' : 'text-muted-foreground hover:text-[#4096d8]')} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 text-[13px]">
                        <span className="text-muted-foreground font-medium">SKU: {product.code || '---'}</span>
                        <span className="px-2 py-[2px] bg-muted/60 dark:bg-muted/30 rounded text-muted-foreground font-medium truncate max-w-[120px]">
                            {product.category?.name || 'General'}
                        </span>
                        <span className={cn(
                            "inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                            stockStyles[stockStatus]
                        )}>
                            {stockLabels[stockStatus]}
                        </span>
                    </div>
                </div>

                {/* Price */}
                <div className="flex flex-col items-end shrink-0 mr-4">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">PRECIO</div>
                    <div className="text-xl font-bold text-[#4096d8]">
                        {society?.mainCurrency?.symbol || 'S/'} {parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>

                {/* Action Button / Quantity Selector */}
                <div className="shrink-0">
                    {quantity > 0 ? (
                        <div className="flex items-center bg-[#f0f7ff] dark:bg-blue-500/10 rounded-[8px] h-10 border border-[#e0f0ff] dark:border-blue-500/20 overflow-hidden">
                            <button
                                onClick={handleDecrement}
                                className="w-10 h-full flex items-center justify-center text-[#4096d8] hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-[#4096d8] text-sm">
                                {quantity}
                            </span>
                            <button
                                onClick={handleIncrement}
                                disabled={quantity >= stock}
                                className={cn(
                                    "w-10 h-full flex items-center justify-center text-[#4096d8] transition-colors",
                                    quantity >= stock ? "opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800" : "hover:bg-blue-100 dark:hover:bg-blue-500/20"
                                )}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleIncrement}
                            disabled={stock <= 0}
                            className={cn(
                                "w-12 h-10 flex items-center justify-center rounded-[8px] transition-all border",
                                stock <= 0 
                                    ? "bg-muted text-muted-foreground/30 border-muted cursor-not-allowed" 
                                    : "bg-[#f0f7ff] dark:bg-blue-500/10 text-[#4096d8] hover:bg-[#e0f0ff] dark:hover:bg-blue-500/20 border-[#e0f0ff] dark:border-blue-500/20"
                            )}
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* MOBILE LAYOUT (less than lg) - New Design */}
            <div className={cn(
                "flex lg:hidden bg-card border rounded-[20px] md:rounded-[24px] overflow-hidden transition-all duration-200 group flex-col relative",
                quantity > 0 ? "border-[#5fa5d9] ring-1 ring-[#5fa5d9]/20" : "border-border shadow-sm dark:bg-card/40"
            )}>
                {/* Top Row: Image + Details + Price */}
                <div className="flex p-3 gap-3 items-start">
                    {/* Image Placeholder */}
                    <div className="w-[60px] h-[60px] md:w-20 md:h-20 bg-muted/30 flex items-center justify-center rounded-[14px] shrink-0 border border-border/50">
                        <Package className="w-6 h-6 md:w-10 md:h-10 text-muted-foreground/30" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 pr-6 relative">
                        <h3 className="font-bold text-[14px] text-foreground leading-tight mb-0.5 truncate pr-4">
                            {product.name}
                            {product.color && <span className="text-muted-foreground font-medium ml-1">({product.color})</span>}
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mb-2">
                            SKU: {product.code || '---'}
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-[17px] font-black text-[#4096d8] leading-none">
                                {society?.mainCurrency?.symbol || 'S/'} {parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <div>
                                <span className={cn(
                                    "inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider",
                                    stockStyles[stockStatus]
                                )}>
                                    {stockLabels[stockStatus]}
                                </span>
                            </div>
                        </div>

                        {/* Favorite Button Overlay */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
                            className="absolute top-0 right-0 p-1 rounded-full text-muted-foreground/40 hover:text-[#4096d8] transition-colors"
                        >
                            <Heart className={cn("w-4 h-4", isFavorite ? "fill-[#4096d8] text-[#4096d8]" : "fill-current text-muted-foreground/20")} />
                        </button>
                    </div>

                    {/* Simple Add Button (Only if 0 quantity) */}
                    {quantity === 0 && (
                        <div className="absolute bottom-3 right-3">
                            <button
                                onClick={handleIncrement}
                                disabled={stock <= 0}
                                className={cn(
                                    "w-10 h-10 rounded-[14px] flex items-center justify-center transition-all border shadow-sm",
                                    stock <= 0
                                        ? "bg-muted text-muted-foreground/30 border-muted cursor-not-allowed"
                                        : "bg-primary/5 dark:bg-primary/10 text-primary hover:bg-primary/10 border-primary/20"
                                )}
                            >
                                <Plus className="w-5 h-5 stroke-[3]" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom Row: Quantity Selector (Visible when qty > 0) */}
                {quantity > 0 && (
                    <div className="mt-auto px-3 pb-3">
                        <div className="flex items-center justify-between bg-muted/30 rounded-[16px] p-1 border border-border/50">
                            <button
                                onClick={handleDecrement}
                                className="w-12 h-10 flex items-center justify-center bg-card rounded-[12px] text-muted-foreground hover:text-[#4096d8] transition-colors border border-border/50 shadow-sm"
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">Cantidad</span>
                                <span className="text-sm font-black text-[#4096d8] leading-tight">{quantity}</span>
                            </div>

                            <button
                                onClick={handleIncrement}
                                disabled={quantity >= stock}
                                className={cn(
                                    "w-12 h-10 flex items-center justify-center bg-card rounded-[12px] transition-colors border border-border/50 shadow-sm",
                                    quantity >= stock 
                                        ? "opacity-30 cursor-not-allowed grayscale" 
                                        : "text-[#4096d8] hover:bg-primary/5"
                                )}
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
