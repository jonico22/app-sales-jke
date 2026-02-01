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

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const pageLimit = 10;

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
            const params: any = {
                page: currentPage,
                limit: pageLimit,
            };

            if (debouncedSearchTerm) {
                params.search = debouncedSearchTerm;
            }

            if (statusFilter !== 'all') {
                params.isActive = statusFilter === 'active';
            }

            const response = await productService.getAll(params);

            setProducts(response.data.data || []);
            setTotalPages(response.data.pagination.totalPages);
            setTotalProducts(response.data.pagination.total);
            setHasNextPage(response.data.pagination.hasNextPage);
            setHasPrevPage(response.data.pagination.hasPrevPage);
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
    }, [currentPage, debouncedSearchTerm, statusFilter]);

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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Inventario de Productos</h2>
                    <p className="text-sm text-slate-500 mt-1">Gestione su inventario de productos y controle existencias.</p>
                </div>
                <Link to="/inventory/new">
                    <Button className="flex items-center gap-2 shadow-lg shadow-sky-500/20">
                        <Plus className="h-4 w-4" /> Nuevo Producto
                    </Button>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nombre o código..."
                        className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 sm:flex-none justify-between text-secondary border-slate-200 font-normal hover:bg-accent/10 min-w-[160px]">
                                {getStatusLabel()}
                                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                                Todos los estados
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                                Activo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                                Inactivo
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        className="flex-1 sm:flex-none text-secondary border-slate-200 font-normal gap-2 hover:bg-accent/10"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Más Filtros
                    </Button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-700">
                        <TableRow className="hover:bg-slate-700/90 border-slate-600">
                            <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider text-slate-100">Código</TableHead>
                            <TableHead className="w-[280px] font-bold text-xs uppercase tracking-wider text-slate-100">Nombre del Producto</TableHead>
                            <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider text-slate-100">Precio Costo</TableHead>
                            <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider text-slate-100">Precio Venta</TableHead>
                            <TableHead className="w-[100px] font-bold text-xs uppercase tracking-wider text-slate-100">Stock</TableHead>
                            <TableHead className="w-[100px] font-bold text-xs uppercase tracking-wider text-slate-100">Estado</TableHead>
                            <TableHead className="w-[100px] text-right font-bold text-xs uppercase tracking-wider text-slate-100">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-500">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Cargando productos...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : products.length > 0 ? (
                            products.map((product) => (
                                <TableRow key={product.id} className="hover:bg-accent/10 border-slate-100 transition-colors">
                                    <TableCell className="font-semibold text-secondary">{product.code}</TableCell>
                                    <TableCell className="font-bold text-secondary">{product.name}</TableCell>
                                    <TableCell className="text-slate-600">{formatCurrency(product.priceCost)}</TableCell>
                                    <TableCell className="text-slate-600 font-semibold">{formatCurrency(product.price)}</TableCell>
                                    <TableCell>
                                        <span className={`font-semibold ${product.stock <= product.minStock ? 'text-destructive' : 'text-slate-700'}`}>
                                            {product.stock}
                                        </span>
                                        {product.stock <= product.minStock && (
                                            <span className="ml-1 text-xs text-destructive">(Bajo)</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={product.isActive ? 'success' : 'destructive'} className="uppercase text-[10px] tracking-wide px-2.5 py-1">
                                            {product.isActive ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link to={`/inventory/${product.id}/edit`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-primary hover:bg-accent/20"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-slate-400 hover:text-destructive hover:bg-destructive/10"
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
                                <TableCell colSpan={7} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                            <Package className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                            No se encontraron productos
                                        </h3>
                                        <p className="text-slate-500 max-w-sm mb-6">
                                            No hay productos que coincidan con tu búsqueda o los filtros seleccionados.
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('all');
                                            }}
                                            className="border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30"
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
                <div className="flex items-center justify-between p-4 border-t border-slate-100">
                    <div className="text-sm text-slate-500">
                        Mostrando <span className="font-semibold text-secondary">{products.length > 0 ? ((currentPage - 1) * pageLimit) + 1 : 0}-{Math.min(currentPage * pageLimit, totalProducts)}</span> de <span className="font-semibold text-secondary">{totalProducts}</span> productos
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 disabled:opacity-50 text-slate-500 border-slate-200"
                            disabled={!hasPrevPage || isLoading}
                            onClick={handlePrevPage}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm text-slate-600 min-w-[80px] text-center">
                            Página {currentPage} de {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 border-slate-200 hover:bg-accent/10 hover:text-secondary disabled:opacity-50"
                            disabled={!hasNextPage || isLoading}
                            onClick={handleNextPage}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
