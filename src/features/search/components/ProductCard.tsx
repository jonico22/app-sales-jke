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
    let stockStatus: { label: string; color: string; bg: string } = { label: 'En Stock', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (product.stock <= 0) {
        stockStatus = { label: 'Agotado', color: 'text-slate-500', bg: 'bg-slate-100' };
    } else if (product.stock <= (product.minStock || 5)) {
        stockStatus = { label: 'Bajo Stock', color: 'text-amber-600', bg: 'bg-amber-50' };
    }

    return (
        <div className={`bg-white border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all group ${quantity > 0 ? 'border-sky-500 ring-1 ring-sky-500' : 'border-slate-100'}`}>
            {/* Image/Icon */}
            <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                <Package className="w-8 h-8 text-slate-300" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-base truncate">
                        {product.name}
                        {product.color && <span className="font-normal text-slate-500 ml-1">({product.color})</span>}
                    </h3>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
                        className="focus:outline-none"
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-sky-500 text-sky-500' : 'text-slate-300 hover:text-red-400'} transition-colors`} />
                    </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 font-medium">SKU: {product.code || '---'}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-500 font-medium truncate max-w-[100px]">
                        {product.category?.name || 'General'}
                    </span>
                    <span className={`flex items-center gap-1 ${stockStatus.color} font-medium`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                        {stockStatus.label}
                    </span>
                </div>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">PRECIO</div>
                <div className="text-xl font-bold text-sky-600">
                    {society?.mainCurrency?.symbol || 'S/'} {parseFloat(product.price).toFixed(2)}
                </div>
            </div>

            {/* Action Button / Quantity Selector */}
            {quantity > 0 ? (
                <div className="flex items-center bg-sky-50 rounded-xl border border-sky-100 h-12 shrink-0 overflow-hidden">
                    <button
                        onClick={handleDecrement}
                        className="w-10 h-full flex items-center justify-center text-sky-600 hover:bg-sky-100 transition-colors active:bg-sky-200"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sky-700 text-lg">
                        {quantity}
                    </span>
                    <button
                        onClick={handleIncrement}
                        className="w-10 h-full flex items-center justify-center text-sky-600 hover:bg-sky-100 transition-colors active:bg-sky-200"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleIncrement}
                    className="w-12 h-12 flex items-center justify-center bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-500 hover:text-white transition-all active:scale-95 shrink-0"
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}
        </div>
    );
}
