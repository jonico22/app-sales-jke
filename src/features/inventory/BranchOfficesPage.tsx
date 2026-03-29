import { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { branchOfficeService, type BranchOffice } from '@/services/branch-office.service';
import { alerts } from '@/utils/alerts';
import { BranchOfficeEditPanel } from './components/BranchOfficeEditPanel';
import { BranchOfficeFilterPanel, type FilterValues } from './components/BranchOfficeFilterPanel';
import { BranchOfficesHeader } from './components/BranchOfficesHeader';
import { BranchOfficesFilterBar } from './components/BranchOfficesFilterBar';
import { BranchOfficesTable } from './components/BranchOfficesTable';
import { BranchOfficesMobileList } from './components/BranchOfficesMobileList';

export default function BranchOfficesPage() {
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>([]);
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
    });

    // Sorting state
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBranches, setTotalBranches] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [pageSize, setPageSize] = useState(10);

    // Edit panel state
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

    const handleEditBranch = (branchId: string) => {
        setSelectedBranchId(branchId);
        setEditPanelOpen(true);
    };

    const handleNewBranch = () => {
        setSelectedBranchId(null);
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

    const fetchBranches = async () => {
        try {
            setIsLoading(true);
            const params: any = {
                page: currentPage,
                limit: pageSize,
                sortBy,
                sortOrder,
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

            const response = await branchOfficeService.getAll(params);

            setBranchOffices(response.data.data || []);
            setTotalPages(response.data.pagination.totalPages);
            setTotalBranches(response.data.pagination.total);
            setHasNextPage(response.data.pagination.hasNextPage);
            setHasPrevPage(response.data.pagination.hasPrevPage);
        } catch (error: any) {
            console.error('Error fetching branch offices:', error);
            toast.error(error.response?.data?.message || 'Error al cargar las sucursales');
            setBranchOffices([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    useEffect(() => {
        fetchBranches();
    }, [currentPage, debouncedSearchTerm, statusFilter, advancedFilters, pageSize, sortBy, sortOrder]);

    const handleDeleteBranch = async (id: string) => {
        const isConfirmed = await alerts.confirm({
            title: '¿Estás seguro?',
            text: '¿Deseas eliminar esta sucursal? Esta acción no se puede deshacer.',
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#ef4444'
        });

        if (!isConfirmed) return;

        try {
            await branchOfficeService.delete(id);
            toast.success('Sucursal eliminada exitosamente');
            await fetchBranches();
        } catch (error: any) {
            console.error('Error deleting branch office:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar la sucursal');
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
        setCurrentPage(1);
        setIsFilterPanelOpen(false);
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
                    isLoading={isLoading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onEdit={handleEditBranch}
                    onDelete={handleDeleteBranch}
                />

                <BranchOfficesMobileList
                    branchOffices={branchOffices}
                    isLoading={isLoading}
                    onEdit={handleEditBranch}
                    onDelete={handleDeleteBranch}
                />

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 border-t border-border bg-card">
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">
                        <div className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                            Mostrando <span className="font-bold text-foreground">{branchOffices.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, totalBranches)}</span> de <span className="font-bold text-foreground">{totalBranches}</span>
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

            {/* Panels */}
            <BranchOfficeEditPanel
                open={editPanelOpen}
                onOpenChange={setEditPanelOpen}
                branchOfficeId={selectedBranchId}
                onSuccess={fetchBranches}
            />

            <BranchOfficeFilterPanel
                open={isFilterPanelOpen}
                onOpenChange={setIsFilterPanelOpen}
                onApplyFilters={handleApplyFilters}
            />
        </div>
    );
}
