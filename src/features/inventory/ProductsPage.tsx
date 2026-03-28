import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { productService, type Product } from '@/services/product.service';
import { alerts } from '@/utils/alerts';
import { ProductEditPanel } from './components/ProductEditPanel';
import { ProductFilterPanel, type FilterValues } from './components/ProductFilterPanel';
import { ProductsHeader } from './components/ProductsHeader';
import { ProductsFilterBar } from './components/ProductsFilterBar';
import { ProductsTable } from './components/ProductsTable';
import { ProductsMobileList } from './components/ProductsMobileList';
import { useSocietyStore } from '@/store/society.store';


export default function ProductsPage() {
    const { society } = useSocietyStore();
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
    const [sortBy, setSortBy] = useState<string>('');
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
    }, [currentPage, debouncedSearchTerm, statusFilter, advancedFilters, pageSize, sortBy, sortOrder, society?.id]);

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
            <ProductsHeader />

            <ProductsFilterBar
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onOpenFilters={() => setIsFilterPanelOpen(true)}
            />

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <ProductsTable
                    products={products}
                    isLoading={isLoading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                />

                <ProductsMobileList
                    products={products}
                    isLoading={isLoading}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                />

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
