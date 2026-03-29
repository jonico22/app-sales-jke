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
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 gap-3">
                {products.map((product, index) => {
                    const isLastElement = products.length === index + 1;
                    
                    return (
                        <div ref={isLastElement ? lastProductElementRef : undefined} key={product.id}>
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
                <div className="flex justify-center items-center py-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {products.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No se encontraron productos con los filtros seleccionados.</p>
                </div>
            )}
        </div>
    );
}
