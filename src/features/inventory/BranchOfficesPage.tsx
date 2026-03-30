import { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { alerts } from '@/utils/alerts';
import { BranchOfficeEditPanel } from './components/BranchOfficeEditPanel';
import { BranchOfficeFilterPanel } from './components/BranchOfficeFilterPanel';
import { BranchOfficesHeader } from './components/BranchOfficesHeader';
import { BranchOfficesFilterBar } from './components/BranchOfficesFilterBar';
import { BranchOfficesTable } from './components/BranchOfficesTable';
import { BranchOfficesMobileList } from './components/BranchOfficesMobileList';
import { useBranchOffices, useDeleteBranchOffice } from './hooks/useBranchOfficeQueries';
import { useBranchOfficeFilters } from './hooks/useBranchOfficeFilters';

export default function BranchOfficesPage() {
    const {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        pageSize,
        setPageSize,
        currentPage,
        setCurrentPage,
        sortBy,
        sortOrder,
        handleSort,
        isFilterPanelOpen,
        setIsFilterPanelOpen,
        handleApplyFilters,
        getQueryParams,
    } = useBranchOfficeFilters();

    const { data, isLoading } = useBranchOffices(getQueryParams());
    const deleteMutation = useDeleteBranchOffice();

    // Edit panel state
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

    const branchOffices = data?.data || [];
    const pagination = data?.pagination || {
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    };

    const handleEditBranch = (branchId: string) => {
        setSelectedBranchId(branchId);
        setEditPanelOpen(true);
    };

    const handleNewBranch = () => {
        setSelectedBranchId(null);
        setEditPanelOpen(true);
    };

    const handleDeleteBranch = async (id: string) => {
        const isConfirmed = await alerts.confirm({
            title: '¿Estás seguro?',
            text: '¿Deseas eliminar esta sucursal? Esta acción no se puede deshacer.',
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
            <BranchOfficesHeader onNewBranch={handleNewBranch} />

            <BranchOfficesFilterBar
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onOpenFilters={() => setIsFilterPanelOpen(true)}
            />

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <BranchOfficesTable
                    branchOffices={branchOffices}
                    isLoading={isLoading || deleteMutation.isPending}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onEdit={handleEditBranch}
                    onDelete={handleDeleteBranch}
                />

                <BranchOfficesMobileList
                    branchOffices={branchOffices}
                    isLoading={isLoading || deleteMutation.isPending}
                    onEdit={handleEditBranch}
                    onDelete={handleDeleteBranch}
                />

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 border-t border-border bg-card">
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">
                        <div className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                            Mostrando <span className="font-bold text-foreground">{branchOffices.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, pagination.total)}</span> de <span className="font-bold text-foreground">{pagination.total}</span>
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

            {/* Panels */}
            <BranchOfficeEditPanel
                open={editPanelOpen}
                onOpenChange={setEditPanelOpen}
                branchOfficeId={selectedBranchId}
            />

            <BranchOfficeFilterPanel
                open={isFilterPanelOpen}
                onOpenChange={setIsFilterPanelOpen}
                onApplyFilters={handleApplyFilters}
            />
        </div>
    );
}
