import { useMemo, useState } from 'react';
import { useSocietyStore } from '@/store/society.store';
import { useBranchOfficesSelect } from '@/features/inventory/hooks/useBranchOfficeQueries';
import { type OutgoingConsignmentAgreementStatus } from '@/services/outgoing-consignment-agreement.service';
import { useOutgoingConsignmentAgreementsQuery } from '../hooks/useConsignmentQueries';
import { OutgoingConsignmentAgreementsHeader } from './components/OutgoingConsignmentAgreementsHeader';
import { ConsignmentPagination } from '../components/ConsignmentPagination';

export default function OutgoingConsignmentAgreementsPage() {
  const society = useSocietyStore((state) => state.society);
  const { data: branches = [] } = useBranchOfficesSelect();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | OutgoingConsignmentAgreementStatus>('all');
  const [branchId, setBranchId] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const params = useMemo(() => ({
    societyId: society?.code || society?.id,
    search: search || undefined,
    status: status === 'all' ? undefined : status,
    branchId: branchId === 'all' ? undefined : branchId,
    page: currentPage,
    limit: pageSize,
    sortBy: 'startDate',
    sortOrder: 'desc' as const,
  }), [branchId, currentPage, pageSize, search, society?.code, society?.id, status]);

  const { data, isLoading } = useOutgoingConsignmentAgreementsQuery(params);
  const agreements = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };

  return (
    <div className="space-y-6">
      <OutgoingConsignmentAgreementsHeader />

      <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por código o notas"
            className="h-10 rounded-lg border border-border bg-muted/30 px-3 text-xs"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as 'all' | OutgoingConsignmentAgreementStatus);
              setCurrentPage(1);
            }}
            className="h-10 rounded-lg border border-border bg-muted/30 px-3 text-xs"
          >
            <option value="all">Todos los estados</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="TERMINATED">TERMINATED</option>
          </select>
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
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/20 border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Codigo</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Sucursal</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Consignatario</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Periodo</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Comision</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">Cargando acuerdos...</td></tr>
              ) : agreements.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No se encontraron acuerdos.</td></tr>
              ) : agreements.map((agreement) => (
                <tr key={agreement.id} className="border-b border-border/60">
                  <td className="px-4 py-3 text-sm font-medium">{agreement.agreementCode || agreement.id}</td>
                  <td className="px-4 py-3 text-sm">{agreement.branchId}</td>
                  <td className="px-4 py-3 text-sm">{agreement.partnerId}</td>
                  <td className="px-4 py-3 text-sm">{agreement.startDate} - {agreement.endDate}</td>
                  <td className="px-4 py-3 text-sm">{(agreement.commissionRate * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-sm">{agreement.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-border">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Cargando acuerdos...</div>
          ) : agreements.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No se encontraron acuerdos.</div>
          ) : agreements.map((agreement) => (
            <div key={agreement.id} className="p-4 space-y-1">
              <div className="text-sm font-semibold">{agreement.agreementCode || agreement.id}</div>
              <div className="text-xs text-muted-foreground">{agreement.startDate} - {agreement.endDate}</div>
              <div className="text-xs text-muted-foreground">Sucursal: {agreement.branchId}</div>
              <div className="text-xs text-muted-foreground">Consignatario: {agreement.partnerId}</div>
              <div className="text-xs text-muted-foreground">Estado: {agreement.status}</div>
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
