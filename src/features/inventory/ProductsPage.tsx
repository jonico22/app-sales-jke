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
import { useProducts } from './hooks/useProducts';

export default function ProductsPage() {
    const {
        products,
        isLoading,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        isFilterPanelOpen,
        setIsFilterPanelOpen,
        currentPage,
        setCurrentPage,
        totalPages,
        totalProducts,
        pageSize,
        setPageSize,
        sortBy,
        sortOrder,
        hasNextPage,
        hasPrevPage,
        editPanelOpen,
        setEditPanelOpen,
        selectedProductId,
        fetchProducts,
        handleDeleteProduct,
        handleNextPage,
        handlePrevPage,
        handleApplyFilters,
        handleSort,
        handleEditProduct,
    } = useProducts();

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
