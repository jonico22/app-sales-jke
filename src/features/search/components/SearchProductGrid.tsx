import { Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product } from '@/services/product.service';
import type { RefCallback } from 'react';

interface SearchProductGridProps {
    products: Product[];
    loading: boolean;
    isLoadingMore: boolean;
    favorites: Set<string>;
    onToggleFavorite: (id: string) => void;
    lastProductElementRef: RefCallback<HTMLDivElement>;
}

export function SearchProductGrid({
    products,
    loading,
    isLoadingMore,
    favorites,
    onToggleFavorite,
    lastProductElementRef
}: SearchProductGridProps) {
    if (loading && products.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Cargando Productos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {products.map((product, index) => {
                    const isLastElement = products.length === index + 1;
                    
                    return (
                        <div 
                            ref={isLastElement ? lastProductElementRef : undefined} 
                            key={`${product.id}-${index}`}
                            className="bg-card rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
                        >
                            <ProductCard
                                product={product}
                                isFavorite={favorites.has(product.id)}
                                onToggleFavorite={onToggleFavorite}
                            />
                        </div>
                    );
                })}
            </div>

            {isLoadingMore && (
                <div className="flex flex-col justify-center items-center py-8 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-bounce">Cargando más...</p>
                </div>
            )}

            {products.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                         <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 animate-spin-slow" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">No se encontraron productos</p>
                        <p className="text-xs text-muted-foreground">Prueba ajustando los filtros o cambiando el término de búsqueda.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
