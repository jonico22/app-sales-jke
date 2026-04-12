import { useMemo, useState } from 'react';
import { useSocietyStore } from '@/store/society.store';
import { useBranchOfficesSelect } from '@/features/inventory/hooks/useBranchOfficeQueries';
import { useDeliveredConsignmentAgreementsQuery } from '../hooks/useConsignmentQueries';
import { DeliveredConsignmentAgreementsHeader } from './components/DeliveredConsignmentAgreementsHeader';
import { ConsignmentPagination } from '../components/ConsignmentPagination';

export default function DeliveredConsignmentAgreementsPage() {
  const society = useSocietyStore((state) => state.society);
  const { data: branches = [] } = useBranchOfficesSelect();
  const [status, setStatus] = useState('all');
  const [branchId, setBranchId] = useState('all');
  const [agreementId, setAgreementId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const params = useMemo(() => ({
    societyId: society?.code || society?.id,
    consignmentAgreementId: agreementId || undefined,
    branchId: branchId === 'all' ? undefined : branchId,
    status: status === 'all' ? undefined : status,
    page: currentPage,
    limit: pageSize,
    sortBy: 'deliveryDate',
    sortOrder: 'desc' as const,
  }), [agreementId, branchId, currentPage, pageSize, society?.code, society?.id, status]);

  const { data, isLoading } = useDeliveredConsignmentAgreementsQuery(params);
  const deliveries = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };

  return (
    <div className="space-y-6">
      <DeliveredConsignmentAgreementsHeader />

      <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={agreementId}
            onChange={(e) => {
              setAgreementId(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filtrar por acuerdo"
            className="h-10 rounded-lg border border-border bg-muted/30 px-3 text-xs"
          />
          <select
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-lg border border-border bg-muted/30 px-3 text-xs"
          >
            <option value="all">Todas las sucursales</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          <input
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Estado"
            className="h-10 rounded-lg border border-border bg-muted/30 px-3 text-xs"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/20 border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Entrega</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Acuerdo</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">Cargando entregas...</td></tr>
              ) : deliveries.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No se encontraron entregas.</td></tr>
              ) : deliveries.map((delivery) => (
                <tr key={delivery.id} className="border-b border-border/60">
                  <td className="px-4 py-3 text-sm font-medium">{delivery.id}</td>
                  <td className="px-4 py-3 text-sm">{delivery.consignmentAgreementId}</td>
                  <td className="px-4 py-3 text-sm">{delivery.productId}</td>
                  <td className="px-4 py-3 text-sm">{delivery.remainingStock}/{delivery.deliveredStock}</td>
                  <td className="px-4 py-3 text-sm">{delivery.deliveryDate || '-'}</td>
                  <td className="px-4 py-3 text-sm">{delivery.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-border">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Cargando entregas...</div>
          ) : deliveries.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No se encontraron entregas.</div>
          ) : deliveries.map((delivery) => (
            <div key={delivery.id} className="p-4 space-y-1">
              <div className="text-sm font-semibold">{delivery.id}</div>
              <div className="text-xs text-muted-foreground">Acuerdo: {delivery.consignmentAgreementId}</div>
              <div className="text-xs text-muted-foreground">Producto: {delivery.productId}</div>
              <div className="text-xs text-muted-foreground">Stock: {delivery.remainingStock}/{delivery.deliveredStock}</div>
              <div className="text-xs text-muted-foreground">Estado: {delivery.status}</div>
            </div>
          ))}
        </div>

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
    </div>
  );
}
