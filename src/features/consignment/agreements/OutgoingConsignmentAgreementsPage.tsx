import { useMemo, useState } from 'react';
import { alerts } from '@/utils/alerts';
import { useSocietyStore } from '@/store/society.store';
import { useClients } from '@/hooks/useClients';
import { useBranchOfficesSelect } from '@/features/inventory/hooks/useBranchOfficeQueries';
import { type OutgoingConsignmentAgreementStatus } from '@/services/outgoing-consignment-agreement.service';
import { useDeleteOutgoingConsignmentAgreement, useOutgoingConsignmentAgreementsQuery } from '../hooks/useConsignmentQueries';
import { OutgoingConsignmentAgreementsHeader } from './components/OutgoingConsignmentAgreementsHeader';
import { ConsignmentPagination } from '../components/ConsignmentPagination';
import { OutgoingConsignmentAgreementsFilterBar } from './components/OutgoingConsignmentAgreementsFilterBar';
import { OutgoingConsignmentAgreementsTable } from './components/OutgoingConsignmentAgreementsTable';
import { OutgoingConsignmentAgreementsMobileList } from './components/OutgoingConsignmentAgreementsMobileList';
import { OutgoingConsignmentAgreementEditPanel } from './components/OutgoingConsignmentAgreementEditPanel';

export default function OutgoingConsignmentAgreementsPage() {
  const society = useSocietyStore((state) => state.society);
  const { data: branches = [] } = useBranchOfficesSelect();
  const { data: clients = [] } = useClients();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | OutgoingConsignmentAgreementStatus>('all');
  const [branchId, setBranchId] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);

  const params = useMemo(() => ({
    societyId: society?.code || society?.id,
    search: search || undefined,
    status: status === 'all' ? undefined : status,
    branchId: branchId === 'all' ? undefined : branchId,
    page: currentPage,
    limit: pageSize,
    sortBy,
    sortOrder,
  }), [branchId, currentPage, pageSize, search, society?.code, society?.id, sortBy, sortOrder, status]);

  const { data, isLoading } = useOutgoingConsignmentAgreementsQuery(params);
  const deleteMutation = useDeleteOutgoingConsignmentAgreement();
  const agreements = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };

  const branchNames = useMemo(
    () => Object.fromEntries(branches.map((branch) => [branch.id, branch.name])),
    [branches],
  );
  const partnerNames = useMemo(
    () => Object.fromEntries(clients.map((client) => [client.id, client.name])),
    [clients],
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

  const handleEditAgreement = (agreementId: string) => {
    setSelectedAgreementId(agreementId);
    setEditPanelOpen(true);
  };

  const handleDeleteAgreement = async (agreementId: string) => {
    const isConfirmed = await alerts.confirm({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar este acuerdo de consignación? Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444',
    });

    if (isConfirmed) {
      await deleteMutation.mutateAsync(agreementId);
    }
  };

  return (
    <div className="space-y-6">
      <OutgoingConsignmentAgreementsHeader />

      <OutgoingConsignmentAgreementsFilterBar
        searchTerm={search}
        onSearchTermChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        statusFilter={status}
        onStatusFilterChange={(value) => {
          setStatus(value);
          setCurrentPage(1);
        }}
        branchFilter={branchId}
        onBranchFilterChange={(value) => {
          setBranchId(value);
          setCurrentPage(1);
        }}
        branches={branches}
      />

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <OutgoingConsignmentAgreementsTable
          agreements={agreements}
          isLoading={isLoading || deleteMutation.isPending}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={handleEditAgreement}
          onDelete={handleDeleteAgreement}
          branchNames={branchNames}
          partnerNames={partnerNames}
        />

        <OutgoingConsignmentAgreementsMobileList
          agreements={agreements}
          isLoading={isLoading || deleteMutation.isPending}
          onEdit={handleEditAgreement}
          onDelete={handleDeleteAgreement}
          branchNames={branchNames}
          partnerNames={partnerNames}
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

      <OutgoingConsignmentAgreementEditPanel
        open={editPanelOpen}
        onOpenChange={setEditPanelOpen}
        agreementId={selectedAgreementId}
      />
    </div>
  );
}
