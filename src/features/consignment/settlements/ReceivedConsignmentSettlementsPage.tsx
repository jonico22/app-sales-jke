import { useMemo, useState } from 'react';
import { useSocietyStore } from '@/store/society.store';
import { type ReceivedConsignmentSettlementStatus } from '@/services/received-consignment-settlement.service';
import { useReceivedConsignmentSettlementsQuery } from '../hooks/useConsignmentQueries';
import { ReceivedConsignmentSettlementsHeader } from './components/ReceivedConsignmentSettlementsHeader';
import { ConsignmentPagination } from '../components/ConsignmentPagination';

export default function ReceivedConsignmentSettlementsPage() {
  const society = useSocietyStore((state) => state.society);
  const [agreementId, setAgreementId] = useState('');
  const [status, setStatus] = useState<'all' | ReceivedConsignmentSettlementStatus>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const params = useMemo(() => ({
    societyId: society?.code || society?.id,
    outgoingAgreementId: agreementId || undefined,
    status: status === 'all' ? undefined : status,
    settlementDateFrom: dateFrom || undefined,
    settlementDateTo: dateTo || undefined,
    page: currentPage,
    limit: pageSize,
    sortBy: 'settlementDate',
    sortOrder: 'desc' as const,
  }), [agreementId, currentPage, dateFrom, dateTo, pageSize, society?.code, society?.id, status]);

  const { data, isLoading } = useReceivedConsignmentSettlementsQuery(params);
  const settlements = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };

  return (
    <div className="space-y-6">
      <ReceivedConsignmentSettlementsHeader />

      <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as 'all' | ReceivedConsignmentSettlementStatus);
              setCurrentPage(1);
            }}
            className="h-10 rounded-lg border border-border bg-muted/30 px-3 text-xs"
          >
            <option value="all">Todos los estados</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-lg border border-border bg-muted/30 px-3 text-xs"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-lg border border-border bg-muted/30 px-3 text-xs"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/20 border-b border-border">
              <tr className="text-left">
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Liquidacion</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Acuerdo</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Reportado</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Recibido</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">Cargando liquidaciones...</td></tr>
              ) : settlements.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No se encontraron liquidaciones.</td></tr>
              ) : settlements.map((settlement) => (
                <tr key={settlement.id} className="border-b border-border/60">
                  <td className="px-4 py-3 text-sm font-medium">{settlement.receiptReference || settlement.id}</td>
                  <td className="px-4 py-3 text-sm">{settlement.outgoingAgreementId}</td>
                  <td className="px-4 py-3 text-sm">{settlement.settlementDate}</td>
                  <td className="px-4 py-3 text-sm">{settlement.totalReportedSalesAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">{settlement.totalReceivedAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">{settlement.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-border">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Cargando liquidaciones...</div>
          ) : settlements.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No se encontraron liquidaciones.</div>
          ) : settlements.map((settlement) => (
            <div key={settlement.id} className="p-4 space-y-1">
              <div className="text-sm font-semibold">{settlement.receiptReference || settlement.id}</div>
              <div className="text-xs text-muted-foreground">Acuerdo: {settlement.outgoingAgreementId}</div>
              <div className="text-xs text-muted-foreground">Fecha: {settlement.settlementDate}</div>
              <div className="text-xs text-muted-foreground">Recibido: {settlement.totalReceivedAmount.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Estado: {settlement.status}</div>
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
