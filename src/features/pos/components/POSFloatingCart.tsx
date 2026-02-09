import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore, selectTotalItems, selectTotalPrice } from '@/store/cart.store';

interface POSFloatingCartProps {
    onClick: () => void;
}

export function POSFloatingCart({ onClick }: POSFloatingCartProps) {
    const totalItems = useCartStore(selectTotalItems);
    const totalPrice = useCartStore(selectTotalPrice);

    if (totalItems === 0) return null;

    return (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 animate-in fade-in zoom-in-95 duration-300">
            <button
                onClick={onClick}
                className="group flex items-center bg-sky-500 hover:bg-sky-600 text-white rounded-2xl shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 overflow-hidden"
            >
                <div className="flex items-center gap-3 px-5 py-3 border-r border-sky-400/30">
                    <div className="relative">
                        <ShoppingCart className="h-6 w-6" />
                        <span className="absolute -top-2 -right-2 bg-white text-sky-600 text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm">
                            {totalItems}
                        </span>
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] font-bold text-sky-100 uppercase tracking-wider">CARRITO</span>
                        <span className="text-lg font-bold leading-none">S/ {totalPrice.toFixed(2)}</span>
                    </div>
                </div>
                <div className="px-4 py-4 bg-sky-600/50 group-hover:bg-sky-600 transition-colors">
                    <ArrowRight className="h-5 w-5" />
                </div>
            </button>
        </div>
    );
}
