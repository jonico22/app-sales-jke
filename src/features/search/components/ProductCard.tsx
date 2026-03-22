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
                        <span className="px-2 py-[2px] bg-muted/60 rounded text-muted-foreground font-medium truncate max-w-[120px]">
                            {product.category?.name || 'General'}
                        </span>
                        {product.stock > 0 ? (
                            <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                                En Stock
                            </span>
                        ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                                Agotado
                            </span>
                        )}
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
                        <div className="flex items-center bg-[#f0f7ff] rounded-[8px] h-10 border border-[#e0f0ff] overflow-hidden">
                            <button
                                onClick={handleDecrement}
                                className="w-10 h-full flex items-center justify-center text-[#4096d8] hover:bg-blue-100 transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-[#4096d8] text-sm">
                                {quantity}
                            </span>
                            <button
                                onClick={handleIncrement}
                                className="w-10 h-full flex items-center justify-center text-[#4096d8] hover:bg-blue-100 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleIncrement}
                            className="w-12 h-10 flex items-center justify-center bg-[#f0f7ff] text-[#4096d8] rounded-[8px] hover:bg-[#e0f0ff] transition-all border border-[#e0f0ff]"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* MOBILE LAYOUT (less than lg) - New Design */}
            <div className={cn(
                "flex lg:hidden bg-white border rounded-[20px] md:rounded-[24px] overflow-hidden transition-all duration-200 group flex-col relative",
                quantity > 0 ? "border-[#5fa5d9] ring-1 ring-[#5fa5d9]/20" : "border-slate-100 shadow-sm"
            )}>
                {/* Top Row: Image + Details + Price */}
                <div className="flex p-3 gap-3 items-start">
                    {/* Image Placeholder */}
                    <div className="w-[60px] h-[60px] md:w-20 md:h-20 bg-slate-50 flex items-center justify-center rounded-[14px] shrink-0 border border-slate-100/50">
                        <Package className="w-6 h-6 md:w-10 md:h-10 text-slate-200" />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 pr-6 relative">
                        <h3 className="font-bold text-[14px] text-slate-900 leading-tight mb-0.5 truncate pr-4">
                            {product.name}
                            {product.color && <span className="text-slate-400 font-medium ml-1">({product.color})</span>}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">
                            SKU: {product.code || '---'}
                        </p>

                        <div className="flex flex-col gap-1">
                            <span className="text-lg font-black text-[#4096d8] leading-none">
                                {society?.mainCurrency?.symbol || 'S/'} {parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <div>
                                {product.stock > 0 ? (
                                    <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                                        En Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                                        Agotado
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Favorite Button Overlay */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
                            className="absolute top-0 right-0 p-1 rounded-full text-slate-300 hover:text-red-400 transition-colors"
                        >
                            <Heart className={cn("w-4 h-4", isFavorite ? "fill-[#4096d8] text-[#4096d8]" : "fill-current text-slate-200")} />
                        </button>
                    </div>

                    {/* Simple Add Button (Only if 0 quantity) */}
                    {quantity === 0 && (
                        <div className="absolute bottom-3 right-3">
                            <button
                                onClick={handleIncrement}
                                className="w-10 h-10 rounded-[14px] bg-[#f0f9ff] text-[#4096d8] flex items-center justify-center hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"
                            >
                                <Plus className="w-5 h-5 stroke-[3]" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom Row: Quantity Selector (Visible when qty > 0) */}
                {quantity > 0 && (
                    <div className="mt-auto px-3 pb-3">
                        <div className="flex items-center justify-between bg-slate-50 rounded-[16px] p-1 border border-slate-100">
                            <button
                                onClick={handleDecrement}
                                className="w-12 h-10 flex items-center justify-center bg-white rounded-[12px] text-slate-400 hover:text-[#4096d8] transition-colors border border-slate-100 shadow-sm"
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cantidad</span>
                                <span className="text-sm font-black text-[#4096d8] leading-tight">{quantity}</span>
                            </div>

                            <button
                                onClick={handleIncrement}
                                className="w-12 h-10 flex items-center justify-center bg-white rounded-[12px] text-[#4096d8] hover:bg-blue-50 transition-colors border border-slate-100 shadow-sm"
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
