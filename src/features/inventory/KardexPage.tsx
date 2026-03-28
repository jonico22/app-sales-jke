import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { kardexService } from '@/services/kardex.service';
import type { KardexTransaction } from '@/services/kardex.service';
import { KardexFilterPanel, type KardexFilterValues } from './components/KardexFilterPanel';
import { exportToExcel } from '@/utils/excel.utils';
import { ManualAdjustmentModal } from './components/ManualAdjustmentModal';
import { KardexHeader } from './components/KardexHeader';
import { KardexFilterBar } from './components/KardexFilterBar';
import { KardexTable } from './components/KardexTable';
import { KardexMobileList } from './components/KardexMobileList';
import { KardexPagination } from './components/KardexPagination';

export default function KardexPage() {
    const [transactions, setTransactions] = useState<KardexTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [pageSize, setPageSize] = useState(20);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [filters, setFilters] = useState<KardexFilterValues>({});

    // Sorting state
    const [sortBy, setSortBy] = useState<string>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchHistory();
    }, [currentPage, pageSize, debouncedSearch, filters, sortBy, sortOrder]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await kardexService.getHistory({
                page: currentPage,
                limit: pageSize,
                search: debouncedSearch,
                sortBy,
                sortOrder,
                ...filters
            });

            if (response.success && response.data) {
                setTransactions(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalRecords(response.data.pagination.total);
                setHasNextPage(response.data.pagination.hasNextPage);
                setHasPrevPage(response.data.pagination.hasPrevPage);
            }
        } catch (error) {
            console.error('Error fetching kardex:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        const columns = [
            { header: 'Fecha', key: (t: KardexTransaction) => format(new Date(t.date), 'dd/MM/yyyy HH:mm'), width: 20 },
            { header: 'Producto', key: (t: KardexTransaction) => t.product?.name || '-', width: 30 },
            { header: 'Sucursal', key: (t: KardexTransaction) => t.branchOffice?.name || '-', width: 20 },
            { header: 'Tipo', key: (t: KardexTransaction) => t.type, width: 15 },
            { header: 'Documento', key: (t: KardexTransaction) => t.documentNumber || '-', width: 20 },
            { header: 'Cantidad', key: (t: KardexTransaction) => t.quantity, width: 12 },
            { header: 'Stock Ant.', key: (t: KardexTransaction) => t.previousStock, width: 12 },
            { header: 'Stock Nuevo', key: (t: KardexTransaction) => t.newStock, width: 12 },
            { header: 'Costo Unit.', key: (t: KardexTransaction) => t.unitCost, width: 12 },
            { header: 'Notas', key: (t: KardexTransaction) => t.notes || '-', width: 40 },
        ];
        
        exportToExcel(
            transactions,
            columns,
            `Kardex_${format(new Date(), 'yyyy-MM-dd')}`,
            'Historial de Inventario'
        );
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
        <div className="space-y-6 max-w-[1400px] mx-auto min-h-screen bg-background">
            {/* Header */}
            <KardexHeader
                onExport={handleExport}
                onAdjustment={() => setIsAdjustmentModalOpen(true)}
                onSync={fetchHistory}
                isLoading={isLoading}
            />

            {/* Filters Bar */}
            <KardexFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                activeFiltersCount={Object.keys(filters).length}
                onOpenFilters={() => setIsFilterOpen(true)}
            />

            {/* Main Content */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                {/* Desktop View */}
                <KardexTable
                    transactions={transactions}
                    isLoading={isLoading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                />

                {/* Mobile View */}
                <KardexMobileList transactions={transactions} />

                {/* Pagination */}
                <KardexPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    hasNextPage={hasNextPage}
                    hasPrevPage={hasPrevPage}
                    isLoading={isLoading}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    displayedCount={transactions.length}
                />
            </div>

            <KardexFilterPanel
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                onApplyFilters={(v) => {
                    setFilters(v);
                    setCurrentPage(1);
                }}
                currentFilters={filters}
            />

            <ManualAdjustmentModal
                open={isAdjustmentModalOpen}
                onOpenChange={setIsAdjustmentModalOpen}
                onSuccess={() => {
                    fetchHistory();
                }}
            />
        </div>
    );
}
