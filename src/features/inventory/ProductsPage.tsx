import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    SlidersHorizontal,
    ChevronDown,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Package,
} from 'lucide-react';
import {
    Button,
    Input,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from '@/components/ui';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { productService, type Product } from '@/services/product.service';
import { alerts } from '@/utils/alerts';
import { cn } from '@/lib/utils';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { ProductEditPanel } from './components/ProductEditPanel';
import { ProductFilterPanel, type FilterValues } from './components/ProductFilterPanel';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({
        categoryCode: undefined,
        priceFrom: '',
        priceTo: '',
        priceCostFrom: '',
        priceCostTo: '',
        stockFrom: '',
        stockTo: '',
        lowStock: false,
        stockStatus: undefined,
    });

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [pageSize, setPageSize] = useState(10);

    // Sorting state
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Edit panel state
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const handleEditProduct = (productId: string) => {
        setSelectedProductId(productId);
        setEditPanelOpen(true);
    };

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            if (searchTerm !== debouncedSearchTerm) {
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page when status filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const params: any = {
                page: currentPage,
                limit: pageSize,
            };

            if (debouncedSearchTerm) {
                params.search = debouncedSearchTerm;
            }

            if (statusFilter !== 'all') {
                params.isActive = statusFilter === 'active';
            }

            if (advancedFilters.categoryCode) {
                params.categoryCode = advancedFilters.categoryCode;
            }

            // New Filters
            if (advancedFilters.priceFrom) params.priceFrom = Number(advancedFilters.priceFrom);
            if (advancedFilters.priceTo) params.priceTo = Number(advancedFilters.priceTo);
            if (advancedFilters.priceCostFrom) params.priceCostFrom = Number(advancedFilters.priceCostFrom);
            if (advancedFilters.priceCostTo) params.priceCostTo = Number(advancedFilters.priceCostTo);
            if (advancedFilters.stockFrom) params.stockFrom = Number(advancedFilters.stockFrom);
            if (advancedFilters.stockTo) params.stockTo = Number(advancedFilters.stockTo);
            if (advancedFilters.lowStock) params.lowStock = true;
            if (advancedFilters.stockStatus) params.stockStatus = advancedFilters.stockStatus;

            params.sortBy = sortBy;
            params.sortOrder = sortOrder;

            const response = await productService.getAll(params);

            setProducts(response.data.data || []);
            setTotalPages(response.data.pagination.totalPages);
            setTotalProducts(response.data.pagination.total);
            setHasNextPage(response.data.pagination.hasNextPage);
            setHasPrevPage(response.data.pagination.hasPrevPage);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error fetching products:', error);
            toast.error(error.response?.data?.message || 'Error al cargar los productos');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, debouncedSearchTerm, statusFilter, advancedFilters, pageSize, sortBy, sortOrder]);

    const handleDeleteProduct = async (id: string) => {
        const isConfirmed = await alerts.confirm({
            title: '¿Estás seguro?',
            text: '¿Deseas eliminar este producto? Esta acción no se puede deshacer.',
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#ef4444'
        });

        if (!isConfirmed) return;

        try {
            await productService.delete(id);
            toast.success('Producto eliminado exitosamente');
            await fetchProducts();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error deleting product:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar el producto');
        }
    };

    const getStatusLabel = () => {
        switch (statusFilter) {
            case 'active': return 'Activos';
            case 'inactive': return 'Inactivos';
            default: return 'Todos los estados';
        }
    };

    const handleNextPage = () => {
        if (hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (hasPrevPage) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const formatCurrency = (value: string | number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(Number(value));
    };

    const handleApplyFilters = (filters: FilterValues) => {
        setAdvancedFilters(filters);
        setCurrentPage(1); // Reset to first page when applying filters
        setIsFilterPanelOpen(false);
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-bold text-foreground tracking-tight uppercase">Inventario de Productos</h2>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Gestione su inventario de productos y controle existencias.</p>
                </div>
                <Link to="/inventory/new">
                    <Button className="h-9 px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Nuevo Producto
                    </Button>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Buscar por nombre o código..."
                        className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex w-full sm:w-auto gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 sm:flex-none justify-between h-10 text-[11px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted min-w-[160px] rounded-xl transition-all">
                                {getStatusLabel()}
                                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] bg-card border-border shadow-xl rounded-xl p-1">
                            <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('all')}>
                                Todos los estados
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('active')}>
                                Solo Activos
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('inactive')}>
                                Solo Inactivos
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        className="flex-1 sm:flex-none h-10 text-[11px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted gap-2 rounded-xl transition-all"
                        onClick={() => setIsFilterPanelOpen(true)}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filtros
                    </Button>
                </div>
            </div>

            {/* Data Table / Cards View */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Desktop/Tablet Table View */}
                <div className="hidden md:block">
                    <Table>
                    <TableHeader className="bg-muted/50 border-b border-border">
                        <TableRow className="hover:bg-transparent border-none">
                            <SortableTableHead 
                                field="code" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort} 
                                className="w-[120px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                            >
                                Código
                            </SortableTableHead>
                            <SortableTableHead 
                                field="name" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort} 
                                className="w-[250px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                            >
                                Producto
                            </SortableTableHead>
                            <SortableTableHead 
                                field="categoryId" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort} 
                                className="w-[150px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                            >
                                Categoría
                            </SortableTableHead>
                            <SortableTableHead 
                                field="minStock" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort} 
                                className="w-[100px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-right"
                            >
                                Min.
                            </SortableTableHead>
                            <SortableTableHead 
                                field="stock" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort} 
                                className="w-[100px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-right"
                            >
                                Stock
                            </SortableTableHead>
                            <SortableTableHead 
                                field="price" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort} 
                                className="w-[120px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-right"
                            >
                                P. Venta
                            </SortableTableHead>
                            <SortableTableHead 
                                field="createdAt" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort} 
                                className="w-[120px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center"
                            >
                                Registro
                            </SortableTableHead>
                            <SortableTableHead 
                                field="isActive" 
                                currentSortBy={sortBy} 
                                currentSortOrder={sortOrder} 
                                onSort={handleSort} 
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
                                                    onClick={() => handleEditProduct(product.id)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteProduct(product.id)}
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

                {/* Mobile Card View */}
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
                                            onClick={() => handleEditProduct(product.id)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDeleteProduct(product.id)}
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

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 border-t border-border">
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">
                        <div className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                            Mostrando <span className="font-bold text-foreground">{products.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, totalProducts)}</span> de <span className="font-bold text-foreground">{totalProducts}</span>
                        </div>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-muted/30 border border-border text-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg focus:ring-primary focus:border-primary block p-1.5 h-8 transition-colors hover:bg-muted/50"
                        >
                            <option value="10">10 Filas</option>
                            <option value="20">20 Filas</option>
                            <option value="40">40 Filas</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
                            disabled={!hasPrevPage || isLoading}
                            onClick={handlePrevPage}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[80px] text-center">
                            Página {currentPage} / {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
                            disabled={!hasNextPage || isLoading}
                            onClick={handleNextPage}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Edit Panel */}
            <ProductEditPanel
                open={editPanelOpen}
                onOpenChange={setEditPanelOpen}
                productId={selectedProductId}
                onSuccess={fetchProducts}
            />

            <ProductFilterPanel
                open={isFilterPanelOpen}
                onOpenChange={setIsFilterPanelOpen}
                onApplyFilters={handleApplyFilters}
            />
        </div>
    );
}
