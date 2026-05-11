import { useMemo, useState } from 'react';
import { alerts } from '@/utils/alerts';
import { useSocietyStore } from '@/store/society.store';
import { useBranchOfficesSelect } from '@/features/inventory/hooks/useBranchOfficeQueries';
import { useOutgoingConsignmentAgreementsQuery } from '../hooks/useConsignmentQueries';
import { useDeleteDeliveredConsignmentAgreement, useDeliveredConsignmentAgreementsQuery } from '../hooks/useConsignmentQueries';
import { DeliveredConsignmentAgreementsHeader } from './components/DeliveredConsignmentAgreementsHeader';
import { ConsignmentPagination } from '../components/ConsignmentPagination';
import { DeliveredConsignmentAgreementsFilterBar } from './components/DeliveredConsignmentAgreementsFilterBar';
import { DeliveredConsignmentAgreementsTable } from './components/DeliveredConsignmentAgreementsTable';
import { DeliveredConsignmentAgreementsMobileList } from './components/DeliveredConsignmentAgreementsMobileList';
import { DeliveredConsignmentAgreementEditPanel } from './components/DeliveredConsignmentAgreementEditPanel';

export default function DeliveredConsignmentAgreementsPage() {
  const society = useSocietyStore((state) => state.society);
  const { data: branches = [] } = useBranchOfficesSelect();
  const [status, setStatus] = useState('all');
  const [branchId, setBranchId] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('deliveryDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);

  const params = useMemo(() => ({
    societyId: society?.code || society?.id,
    consignmentAgreementId: search || undefined,
    branchId: branchId === 'all' ? undefined : branchId,
    status: status === 'all' ? undefined : status,
    page: currentPage,
    limit: pageSize,
    sortBy,
    sortOrder,
  }), [branchId, currentPage, pageSize, search, society?.code, society?.id, sortBy, sortOrder, status]);

  const { data, isLoading } = useDeliveredConsignmentAgreementsQuery(params);
  const { data: agreementLookupData } = useOutgoingConsignmentAgreementsQuery({
    societyId: society?.code || society?.id,
    page: 1,
    limit: 100,
    sortBy: 'startDate',
    sortOrder: 'desc',
  });
  const deleteMutation = useDeleteDeliveredConsignmentAgreement();
  const deliveries = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };
  const agreements = agreementLookupData?.data || [];

  const branchNames = useMemo(
    () => Object.fromEntries(branches.map((branch) => [branch.id, branch.name])),
    [branches],
  );
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

  const handleEditDelivery = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setEditPanelOpen(true);
  };

  const handleDeleteDelivery = async (deliveryId: string) => {
    const isConfirmed = await alerts.confirm({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar esta entrega de consignación? Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444',
    });

    if (isConfirmed) {
      await deleteMutation.mutateAsync(deliveryId);
    }
  };

  return (
    <div className="space-y-6">
      <DeliveredConsignmentAgreementsHeader />

      <DeliveredConsignmentAgreementsFilterBar
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
        <DeliveredConsignmentAgreementsTable
          deliveries={deliveries}
          isLoading={isLoading || deleteMutation.isPending}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={handleEditDelivery}
          onDelete={handleDeleteDelivery}
          branchNames={branchNames}
          agreementLabels={agreementLabels}
        />

        <DeliveredConsignmentAgreementsMobileList
          deliveries={deliveries}
          isLoading={isLoading || deleteMutation.isPending}
          onEdit={handleEditDelivery}
          onDelete={handleDeleteDelivery}
          branchNames={branchNames}
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

      <DeliveredConsignmentAgreementEditPanel
        open={editPanelOpen}
        onOpenChange={setEditPanelOpen}
        deliveryId={selectedDeliveryId}
      />
    </div>
  );
}
