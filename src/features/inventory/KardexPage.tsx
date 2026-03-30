import { useState } from 'react';
import { format } from 'date-fns';
import type { KardexTransaction } from '@/services/kardex.service';
import { KardexFilterPanel } from './components/KardexFilterPanel';
import { exportToExcel } from '@/utils/excel.utils';
import { ManualAdjustmentModal } from './components/ManualAdjustmentModal';
import { KardexHeader } from './components/KardexHeader';
import { KardexFilterBar } from './components/KardexFilterBar';
import { KardexTable } from './components/KardexTable';
import { KardexMobileList } from './components/KardexMobileList';
import { KardexPagination } from './components/KardexPagination';

import { useKardexFilters } from './hooks/useKardexFilters';
import { useKardexQuery } from './hooks/useKardexQueries';

export default function KardexPage() {
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    isFilterOpen,
    setIsFilterOpen,
    filters,
    setFilters,
    sortBy,
    sortOrder,
    handleSort,
    queryParams
  } = useKardexFilters();

  const { data, isLoading, refetch } = useKardexQuery(queryParams);
  const transactions = data?.data || [];
  const pagination = data?.pagination || { totalPages: 1, total: 0, hasNextPage: false, hasPrevPage: false };

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

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

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto min-h-screen bg-background">
      {/* Header */}
      <KardexHeader
        onExport={handleExport}
        onAdjustment={() => setIsAdjustmentModalOpen(true)}
        onSync={() => refetch()}
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
          totalPages={pagination.totalPages}
          totalRecords={pagination.total}
          pageSize={pageSize}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          displayedCount={transactions.length}
        />
      </div>

      <KardexFilterPanel
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onApplyFilters={setFilters}
        currentFilters={filters}
      />

      <ManualAdjustmentModal
        open={isAdjustmentModalOpen}
        onOpenChange={setIsAdjustmentModalOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
