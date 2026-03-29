import { Loader2, Package, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
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

interface ProductsTableProps {
    products: Product[];
    isLoading: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export function ProductsTable({
    products,
    isLoading,
    sortBy,
    sortOrder,
    onSort,
    onEdit,
    onDelete
}: ProductsTableProps) {
    return (
        <div className="hidden md:block">
            <Table>
                <TableHeader className="bg-muted/50 border-b border-border">
                    <TableRow className="hover:bg-transparent border-none">
                        <SortableTableHead
                            field="code"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[120px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                        >
                            Código
                        </SortableTableHead>
                        <SortableTableHead
                            field="name"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[250px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                        >
                            Producto
                        </SortableTableHead>
                        <SortableTableHead
                            field="categoryId"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[150px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                        >
                            Categoría
                        </SortableTableHead>
                        <SortableTableHead
                            field="minStock"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[100px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-right"
                        >
                            Min.
                        </SortableTableHead>
                        <SortableTableHead
                            field="stock"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[100px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-right"
                        >
                            Stock
                        </SortableTableHead>
                        <SortableTableHead
                            field="price"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[120px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-right"
                        >
                            P. Venta
                        </SortableTableHead>
                        <SortableTableHead
                            field="createdAt"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[120px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center"
                        >
                            Registro
                        </SortableTableHead>
                        <SortableTableHead
                            field="isActive"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[100px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center"
                        >
                            Estado
                        </SortableTableHead>
                        <TableHead className="w-[100px] h-10 text-right font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={9} className="h-32 text-center">
                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Cargando productos...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : products.length > 0 ? (
                        products.map((product) => {
                            const isNoStock = product.stock === 0;
                            const isLowStock = !isNoStock && product.stock <= product.minStock;

                            return (
                                <TableRow
                                    key={product.id}
                                    className={cn(
                                        "border-border transition-colors group relative",
                                        isNoStock ? "bg-rose-50/50 hover:bg-rose-100/60 dark:bg-rose-950/10 dark:hover:bg-rose-900/20 border-l-2 border-l-rose-500 shadow-[inset_2px_0_0_0_#f43f5e]" :
                                            isLowStock ? "bg-amber-50/30 hover:bg-amber-100/40 dark:bg-amber-950/5 dark:hover:bg-amber-900/10 border-l-2 border-l-amber-500 shadow-[inset_2px_0_0_0_#f59e0b]" :
                                                "hover:bg-muted/30"
                                    )}
                                >
                                    <TableCell className="font-mono text-[10px] text-muted-foreground pl-4">{product.code || '—'}</TableCell>
                                    <TableCell>
                                        <div className="text-[11px] font-bold text-foreground line-clamp-1">{product.name}</div>
                                        <div className="text-[9px] text-muted-foreground font-medium group-hover:text-primary transition-colors">{product.category?.name || 'Genérico'}</div>
                                    </TableCell>
                                    <TableCell className="text-[11px] font-medium text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                            {product.category?.name || '—'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-[11px] font-bold text-muted-foreground/60">{product.minStock}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={cn(
                                                "text-[11px] font-black tabular-nums",
                                                isNoStock ? "text-rose-600 dark:text-rose-400" :
                                                    isLowStock ? "text-amber-600 dark:text-amber-400" :
                                                        "text-primary"
                                            )}>
                                                {product.stock}
                                            </span>
                                            {(isNoStock || isLowStock) && (
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-tighter",
                                                    isNoStock ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
                                                )}>
                                                    {isNoStock ? 'Sin Stock' : 'Crítico'}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-[11px] font-bold text-foreground">
                                        {formatCurrency(product.price)}
                                    </TableCell>
                                    <TableCell className="text-center text-[10px] font-medium text-muted-foreground">
                                        {product.createdAt?.split(' ')[0] || '—'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={product.isActive ? 'success' : 'outline'} className={`uppercase text-[9px] font-black tracking-tight px-2 py-0.5 rounded-md ${!product.isActive && 'bg-muted/50 border-border text-muted-foreground'}`}>
                                            {product.isActive ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                onClick={() => onEdit(product.id)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => onDelete(product.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={9} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border">
                                        <Package className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground mb-1">
                                        No se encontraron productos
                                    </h3>
                                    <p className="text-muted-foreground max-w-sm mb-6">
                                        No hay productos que coincidan con tu búsqueda o los filtros seleccionados.
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
