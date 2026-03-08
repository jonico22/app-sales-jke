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
    Package
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
import { ProductEditPanel } from './components/ProductEditPanel';
import { ProductFilterPanel, type FilterValues } from './components/ProductFilterPanel';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({
        createdBy: undefined,
        createdAtFrom: null,
        createdAtTo: null,
        updatedAtFrom: null,
        updatedAtTo: null,
        priceFrom: '',
        priceTo: '',
        priceCostFrom: '',
        priceCostTo: '',
        stockFrom: '',
        stockTo: '',
        lowStock: false,
    });

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [pageSize, setPageSize] = useState(10);

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

            // Add advanced filters
            if (advancedFilters.createdBy) {
                params.createdBy = advancedFilters.createdBy;
            }
            if (advancedFilters.createdAtFrom) {
                const date = advancedFilters.createdAtFrom;
                params.createdAtFrom = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.createdAtTo) {
                const date = advancedFilters.createdAtTo;
                params.createdAtTo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.updatedAtFrom) {
                const date = advancedFilters.updatedAtFrom;
                params.updatedAtFrom = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            if (advancedFilters.updatedAtTo) {
                const date = advancedFilters.updatedAtTo;
                params.updatedAtTo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }

            // New Filters
            if (advancedFilters.priceFrom) params.priceFrom = Number(advancedFilters.priceFrom);
            if (advancedFilters.priceTo) params.priceTo = Number(advancedFilters.priceTo);
            if (advancedFilters.priceCostFrom) params.priceCostFrom = Number(advancedFilters.priceCostFrom);
            if (advancedFilters.priceCostTo) params.priceCostTo = Number(advancedFilters.priceCostTo);
            if (advancedFilters.stockFrom) params.stockFrom = Number(advancedFilters.stockFrom);
            if (advancedFilters.stockTo) params.stockTo = Number(advancedFilters.stockTo);
            if (advancedFilters.lowStock) params.lowStock = true;

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
    }, [currentPage, debouncedSearchTerm, statusFilter, advancedFilters, pageSize]);

    const handleDeleteProduct = async (id: string) => {
        const isConfirmed = await alerts.confirm({
            title: '¿Estás seguro?',
            text: '¿Deseas eliminar este producto? Esta acción no se puede deshacer.',
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: 'hsl(var(--destructive))'
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-foreground tracking-tight uppercase">Inventario de Productos</h2>
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

            {/* Data Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50 border-b border-border">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[120px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70">Código</TableHead>
                            <TableHead className="w-[250px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70">Producto</TableHead>
                            <TableHead className="w-[150px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70">Categoría</TableHead>
                            <TableHead className="w-[100px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-right">Min.</TableHead>
                            <TableHead className="w-[100px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-right">Stock</TableHead>
                            <TableHead className="w-[120px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-right">P. Venta</TableHead>
                            <TableHead className="w-[120px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center">Registro</TableHead>
                            <TableHead className="w-[100px] h-10 font-bold text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center">Estado</TableHead>
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
                            products.map((product) => (
                                <TableRow key={product.id} className="hover:bg-muted/30 border-border transition-colors group">
                                    <TableCell className="font-mono text-[10px] text-muted-foreground">{product.code || '—'}</TableCell>
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
                                            <span className={`text-[11px] font-bold ${product.stock <= product.minStock ? 'text-destructive' : 'text-primary'}`}>
                                                {product.stock}
                                            </span>
                                            {product.stock <= product.minStock && (
                                                <span className="text-[8px] font-black uppercase tracking-tighter text-destructive">Crítico</span>
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
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border">
                                            <Package className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">
                                            No se encontraron productos
                                        </h3>
                                        <p className="text-muted-foreground max-w-sm mb-6">
                                            No hay productos que coincidan con tu búsqueda o los filtros seleccionados.
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('all');
                                                setAdvancedFilters({
                                                    createdBy: undefined,
                                                    createdAtFrom: null,
                                                    createdAtTo: null,
                                                    updatedAtFrom: null,
                                                    updatedAtTo: null,
                                                    priceFrom: '',
                                                    priceTo: '',
                                                    priceCostFrom: '',
                                                    priceCostTo: '',
                                                    stockFrom: '',
                                                    stockTo: '',
                                                    lowStock: false,
                                                });
                                            }}
                                            className="border-border text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-muted/50"
                                        >
                                            Limpiar filtros
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-border">
                    <div className="flex items-center gap-4">
                        <div className="text-[11px] text-muted-foreground font-medium">
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
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
                            disabled={!hasPrevPage || isLoading}
                            onClick={handlePrevPage}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[100px] text-center">
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
