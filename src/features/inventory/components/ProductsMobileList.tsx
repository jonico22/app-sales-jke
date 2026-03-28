import { Loader2, Package, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Product } from '@/services/product.service';
import { cn } from '@/lib/utils';

// Rule js-cache-function-results (Priority 2)
const CURRENCY_FORMATTER = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
});

const formatCurrency = (value: string | number) => {
    return CURRENCY_FORMATTER.format(Number(value));
};

interface ProductsMobileListProps {
    products: Product[];
    isLoading: boolean;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export function ProductsMobileList({
    products,
    isLoading,
    onEdit,
    onDelete
}: ProductsMobileListProps) {
    return (
        <div className="md:hidden divide-y divide-border">
            {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs font-medium tracking-tight uppercase">Cargando productos...</span>
                </div>
            ) : products.length > 0 ? (
                products.map((product) => {
                    const isNoStock = product.stock === 0;
                    const isLowStock = !isNoStock && product.stock <= product.minStock;

                    return (
                        <div
                            key={product.id}
                            className={cn(
                                "p-4 bg-card active:bg-muted/50 transition-colors relative",
                                isNoStock ? "bg-rose-50/50 dark:bg-rose-950/10 border-l-4 border-l-rose-500 shadow-[inset_4px_0_0_0_#f43f5e]" :
                                    isLowStock ? "bg-amber-50/30 dark:bg-amber-950/5 border-l-4 border-l-amber-500 shadow-[inset_4px_0_0_0_#f59e0b]" :
                                        ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                            {product.code || 'S/C'}
                                        </span>
                                        <Badge variant={product.isActive ? 'success' : 'secondary'} className="uppercase text-[8px] font-bold px-1.5 py-0 h-4">
                                            {product.isActive ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground leading-tight truncate">{product.name}</h3>
                                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{product.category?.name || 'Varios'}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground"
                                        onClick={() => onEdit(product.id)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => onDelete(product.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Precio Venta</p>
                                    <p className="text-sm font-black text-primary">{formatCurrency(product.price)}</p>
                                </div>
                                <div className="space-y-0.5 text-right">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Stock Actual</p>
                                    <div className="flex items-center justify-end gap-1.5">
                                        {product.stock <= product.minStock && (
                                            <Badge variant="destructive" className="h-4 px-1 text-[8px] font-black uppercase">Crítico</Badge>
                                        )}
                                        <p className={`text-sm font-black ${product.stock <= product.minStock ? 'text-destructive' : 'text-foreground'}`}>
                                            {product.stock}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })
            ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <Package className="h-10 w-10 text-muted-foreground/20 mb-3" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron productos</p>
                </div>
            )}
        </div>
    );
}
