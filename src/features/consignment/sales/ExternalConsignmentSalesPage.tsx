import { useMemo, useState } from 'react';
import { alerts } from '@/utils/alerts';
import { useDeleteExternalConsignmentSale, useExternalConsignmentSalesQuery } from '../hooks/useConsignmentQueries';
import { ExternalConsignmentSalesHeader } from './components/ExternalConsignmentSalesHeader';
import { ConsignmentPagination } from '../components/ConsignmentPagination';
import { ExternalConsignmentSalesFilterBar } from './components/ExternalConsignmentSalesFilterBar';
import { ExternalConsignmentSalesTable } from './components/ExternalConsignmentSalesTable';
import { ExternalConsignmentSalesMobileList } from './components/ExternalConsignmentSalesMobileList';
import { ExternalConsignmentSaleEditPanel } from './components/ExternalConsignmentSaleEditPanel';

export default function ExternalConsignmentSalesPage() {
  const [deliveryId, setDeliveryId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('reportedSaleDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const resolveDates = () => {
    if (periodFilter === 'all') {
      return {
        from: dateFrom || undefined,
        to: dateTo || undefined,
      };
    }

    const end = new Date();
    const start = new Date(end);

    if (periodFilter === 'today') {
      // same day
    } else if (periodFilter === 'week') {
      start.setDate(end.getDate() - 7);
    } else if (periodFilter === 'month') {
      start.setDate(end.getDate() - 30);
    }

    return {
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    };
  };

  const resolvedDates = resolveDates();

  const params = useMemo(() => ({
    deliveredConsignmentId: deliveryId || undefined,
    reportedSaleDateFrom: resolvedDates.from,
    reportedSaleDateTo: resolvedDates.to,
    page: currentPage,
    limit: pageSize,
    sortBy,
    sortOrder,
  }), [currentPage, deliveryId, pageSize, resolvedDates.from, resolvedDates.to, sortBy, sortOrder]);

  const { data, isLoading } = useExternalConsignmentSalesQuery(params);
  const deleteMutation = useDeleteExternalConsignmentSale();
  const sales = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };

  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleEditSale = (saleId: string) => {
    setSelectedSaleId(saleId);
    setEditPanelOpen(true);
  };

  const handleDeleteSale = async (saleId: string) => {
    const isConfirmed = await alerts.confirm({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar esta venta externa? Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444',
    });

    if (isConfirmed) {
      await deleteMutation.mutateAsync(saleId);
    }
  };

  return (
    <div className="space-y-6">
      <ExternalConsignmentSalesHeader />

      <ExternalConsignmentSalesFilterBar
        searchTerm={deliveryId}
        onSearchTermChange={(value) => {
          setDeliveryId(value);
          setCurrentPage(1);
        }}
        periodFilter={periodFilter}
        onPeriodFilterChange={(value) => {
          setPeriodFilter(value);
          setCurrentPage(1);
        }}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={(value) => {
          setDateFrom(value);
          setPeriodFilter('all');
          setCurrentPage(1);
        }}
        onDateToChange={(value) => {
          setDateTo(value);
          setPeriodFilter('all');
          setCurrentPage(1);
        }}
      />

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <ExternalConsignmentSalesTable
          sales={sales}
          isLoading={isLoading || deleteMutation.isPending}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={handleEditSale}
          onDelete={handleDeleteSale}
        />

        <ExternalConsignmentSalesMobileList
          sales={sales}
          isLoading={isLoading || deleteMutation.isPending}
          onEdit={handleEditSale}
          onDelete={handleDeleteSale}
        />

        <ConsignmentPagination
          currentPage={currentPage}
          pageSize={pageSize}
          total={pagination.total}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      <ExternalConsignmentSaleEditPanel
        open={editPanelOpen}
        onOpenChange={setEditPanelOpen}
        saleId={selectedSaleId}
      />
    </div>
  );
}
