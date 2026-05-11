import { useMemo, useState } from 'react';
import { alerts } from '@/utils/alerts';
import { useSocietyStore } from '@/store/society.store';
import { type ReceivedConsignmentSettlementStatus } from '@/services/received-consignment-settlement.service';
import { useDeleteReceivedConsignmentSettlement, useOutgoingConsignmentAgreementsQuery, useReceivedConsignmentSettlementsQuery } from '../hooks/useConsignmentQueries';
import { ReceivedConsignmentSettlementsHeader } from './components/ReceivedConsignmentSettlementsHeader';
import { ConsignmentPagination } from '../components/ConsignmentPagination';
import { ReceivedConsignmentSettlementsFilterBar } from './components/ReceivedConsignmentSettlementsFilterBar';
import { ReceivedConsignmentSettlementsTable } from './components/ReceivedConsignmentSettlementsTable';
import { ReceivedConsignmentSettlementsMobileList } from './components/ReceivedConsignmentSettlementsMobileList';
import { ReceivedConsignmentSettlementEditPanel } from './components/ReceivedConsignmentSettlementEditPanel';

export default function ReceivedConsignmentSettlementsPage() {
  const society = useSocietyStore((state) => state.society);
  const [agreementId, setAgreementId] = useState('');
  const [status, setStatus] = useState<'all' | ReceivedConsignmentSettlementStatus>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('settlementDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);

  const params = useMemo(() => ({
    societyId: society?.code || society?.id,
    outgoingAgreementId: agreementId || undefined,
    status: status === 'all' ? undefined : status,
    settlementDateFrom: dateFrom || undefined,
    settlementDateTo: dateTo || undefined,
    page: currentPage,
    limit: pageSize,
    sortBy,
    sortOrder,
  }), [agreementId, currentPage, dateFrom, dateTo, pageSize, society?.code, society?.id, sortBy, sortOrder, status]);

  const { data, isLoading } = useReceivedConsignmentSettlementsQuery(params);
  const { data: agreementsData } = useOutgoingConsignmentAgreementsQuery({
    societyId: society?.code || society?.id,
    page: 1,
    limit: 100,
    sortBy: 'startDate',
    sortOrder: 'desc',
  });
  const deleteMutation = useDeleteReceivedConsignmentSettlement();
  const settlements = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const agreements = agreementsData?.data || [];

  const agreementLabels = useMemo(
    () => Object.fromEntries(agreements.map((agreement) => [agreement.id, agreement.agreementCode || agreement.id])),
    [agreements],
  );

  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleEditSettlement = (settlementId: string) => {
    setSelectedSettlementId(settlementId);
    setEditPanelOpen(true);
  };

  const handleDeleteSettlement = async (settlementId: string) => {
    const isConfirmed = await alerts.confirm({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar esta liquidación? Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444',
    });

    if (isConfirmed) {
      await deleteMutation.mutateAsync(settlementId);
    }
  };

  return (
    <div className="space-y-6">
      <ReceivedConsignmentSettlementsHeader />

      <ReceivedConsignmentSettlementsFilterBar
        searchTerm={agreementId}
        onSearchTermChange={(value) => {
          setAgreementId(value);
          setCurrentPage(1);
        }}
        statusFilter={status}
        onStatusFilterChange={(value) => {
          setStatus(value);
          setCurrentPage(1);
        }}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={(value) => {
          setDateFrom(value);
          setCurrentPage(1);
        }}
        onDateToChange={(value) => {
          setDateTo(value);
          setCurrentPage(1);
        }}
      />

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <ReceivedConsignmentSettlementsTable
          settlements={settlements}
          isLoading={isLoading || deleteMutation.isPending}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={handleEditSettlement}
          onDelete={handleDeleteSettlement}
          agreementLabels={agreementLabels}
        />

        <ReceivedConsignmentSettlementsMobileList
          settlements={settlements}
          isLoading={isLoading || deleteMutation.isPending}
          onEdit={handleEditSettlement}
          onDelete={handleDeleteSettlement}
          agreementLabels={agreementLabels}
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

      <ReceivedConsignmentSettlementEditPanel
        open={editPanelOpen}
        onOpenChange={setEditPanelOpen}
        settlementId={selectedSettlementId}
      />
    </div>
  );
}
