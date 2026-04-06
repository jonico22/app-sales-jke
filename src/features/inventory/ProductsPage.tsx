import { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductEditPanel } from './components/ProductEditPanel';
import { ProductFilterPanel } from './components/ProductFilterPanel';
import { ProductsHeader } from './components/ProductsHeader';
import { ProductsFilterBar } from './components/ProductsFilterBar';
import { ProductsTable } from './components/ProductsTable';
import { ProductsMobileList } from './components/ProductsMobileList';
import { useProducts, useDeleteProduct } from './hooks/useProductQueries';
import { useProductFilters } from './hooks/useProductFilters';
import { alerts } from '@/utils/alerts';

export default function ProductsPage() {
    const {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        isFilterPanelOpen,
        setIsFilterPanelOpen,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        sortBy,
        sortOrder,
        handleSort,
        handleApplyFilters,
        getQueryParams,
    } = useProductFilters();

    const { data, isLoading } = useProducts(getQueryParams());
    const deleteMutation = useDeleteProduct();

    const products = data?.data || [];
    const pagination = data?.pagination || {
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    };

    // Edit panel state
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const handleEditProduct = (productId: string) => {
        setSelectedProductId(productId);
        setEditPanelOpen(true);
    };

    const handleDeleteProduct = async (id: string) => {
        const isConfirmed = await alerts.confirm({
            title: '¿Estás seguro?',
            text: '¿Deseas eliminar este producto? Esta acción no se puede deshacer.',
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#ef4444'
        });

        if (isConfirmed) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleNextPage = () => {
        if (pagination.hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (pagination.hasPrevPage) {
            setCurrentPage(prev => prev - 1);
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
                    isLoading={isLoading || deleteMutation.isPending}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                />

                <ProductsMobileList
                    products={products}
                    isLoading={isLoading || deleteMutation.isPending}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                />

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 border-t border-border">
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">
                        <div className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                            Mostrando <span className="font-bold text-foreground">{products.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, pagination.total)}</span> de <span className="font-bold text-foreground">{pagination.total}</span>
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
                            disabled={!pagination.hasPrevPage || isLoading}
                            onClick={handlePrevPage}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[80px] text-center">
                            Página {currentPage} / {pagination.totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
                            disabled={!pagination.hasNextPage || isLoading}
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
            />

            <ProductFilterPanel
                open={isFilterPanelOpen}
                onOpenChange={setIsFilterPanelOpen}
                onApplyFilters={handleApplyFilters}
            />
        </div>
    );
}
