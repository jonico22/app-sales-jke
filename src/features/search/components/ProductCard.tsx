import { Heart, Package, Plus, Minus } from 'lucide-react';
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

    // Helper for stock status
    let stockStatus: { label: string; color: string; bg: string } = { label: `${product.stock} en stock`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (product.stock <= 0) {
        stockStatus = { label: 'Agotado', color: 'text-muted-foreground', bg: 'bg-muted' };
    } else if (product.stock <= (product.minStock || 5)) {
        stockStatus = { label: `Solo ${product.stock} en stock`, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    }

    return (
        <div className={`bg-card text-card-foreground border rounded-[12px] p-4 flex items-center justify-between gap-6 hover:shadow-md transition-all group ${quantity > 0 ? 'border-[#4096d8] shadow-sm shadow-[#4096d8]/10' : 'border-border'}`}>
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
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#4096d8] text-[#4096d8]' : 'text-muted-foreground hover:text-[#4096d8]'} transition-colors`} />
                    </button>
                </div>

                <div className="flex items-center gap-3 text-[13px]">
                    <span className="text-muted-foreground font-medium">SKU: {product.code || '---'}</span>
                    <span className="px-2 py-[2px] bg-muted/60 rounded text-muted-foreground font-medium truncate max-w-[120px]">
                        {product.category?.name || 'General'}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-[2px] rounded-md bg-transparent ${stockStatus.color} font-medium`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                        {stockStatus.label}
                    </span>
                </div>
            </div>

            {/* Price */}
            <div className="flex flex-col items-end shrink-0 mr-4">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">PRECIO</div>
                <div className="text-xl font-bold text-[#4096d8]">
                    {society?.mainCurrency?.symbol || 'S/'} {parseFloat(product.price).toFixed(2)}
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
    );
}
