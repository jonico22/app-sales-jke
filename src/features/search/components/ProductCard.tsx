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
        <div className={`bg-card border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all group ${quantity > 0 ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
            {/* Image/Icon */}
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0 border border-border">
                <Package className="w-8 h-8 text-muted-foreground/50" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground text-base truncate">
                        {product.name}
                        {product.color && <span className="font-normal text-muted-foreground ml-1">({product.color})</span>}
                    </h3>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
                        className="focus:outline-none"
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-destructive'} transition-colors`} />
                    </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground font-medium">SKU: {product.code || '---'}</span>
                    <span className="px-2 py-0.5 bg-muted rounded text-muted-foreground font-medium truncate max-w-[100px]">
                        {product.category?.name || 'General'}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${stockStatus.bg} ${stockStatus.color} font-medium`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                        {stockStatus.label}
                    </span>
                </div>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">PRECIO</div>
                <div className="text-xl font-bold text-primary">
                    {society?.mainCurrency?.symbol || 'S/'} {parseFloat(product.price).toFixed(2)}
                </div>
            </div>

            {/* Action Button / Quantity Selector */}
            {quantity > 0 ? (
                <div className="flex items-center bg-primary/10 rounded-xl border border-primary/20 h-12 shrink-0 overflow-hidden">
                    <button
                        onClick={handleDecrement}
                        className="w-10 h-full flex items-center justify-center text-primary hover:bg-primary/20 transition-colors active:bg-primary/30"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-primary text-lg">
                        {quantity}
                    </span>
                    <button
                        onClick={handleIncrement}
                        className="w-10 h-full flex items-center justify-center text-primary hover:bg-primary/20 transition-colors active:bg-primary/30"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleIncrement}
                    className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 shrink-0"
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}
        </div>
    );
}
