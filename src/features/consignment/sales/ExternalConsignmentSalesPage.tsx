import { useMemo, useState } from 'react';
import { useExternalConsignmentSalesQuery } from '../hooks/useConsignmentQueries';
import { ExternalConsignmentSalesHeader } from './components/ExternalConsignmentSalesHeader';
import { ConsignmentPagination } from '../components/ConsignmentPagination';

export default function ExternalConsignmentSalesPage() {
  const [deliveryId, setDeliveryId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const params = useMemo(() => ({
    deliveredConsignmentId: deliveryId || undefined,
    reportedSaleDateFrom: dateFrom || undefined,
    reportedSaleDateTo: dateTo || undefined,
    page: currentPage,
    limit: pageSize,
    sortBy: 'reportedSaleDate',
    sortOrder: 'desc' as const,
  }), [currentPage, dateFrom, dateTo, deliveryId, pageSize]);

  const { data, isLoading } = useExternalConsignmentSalesQuery(params);
  const sales = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false };

  return (
    <div className="space-y-6">
      <ExternalConsignmentSalesHeader />

      <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={deliveryId}
            onChange={(e) => {
              setDeliveryId(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filtrar por entrega"
            className="h-10 rounded-lg border border-border bg-muted/30 px-3 text-xs"
          />
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
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Venta</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Entrega</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Cantidad</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-wider">Comision</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">Cargando ventas...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No se encontraron ventas externas.</td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="border-b border-border/60">
                  <td className="px-4 py-3 text-sm font-medium">{sale.documentReference || sale.id}</td>
                  <td className="px-4 py-3 text-sm">{sale.deliveredConsignmentId}</td>
                  <td className="px-4 py-3 text-sm">{sale.soldQuantity}</td>
                  <td className="px-4 py-3 text-sm">{sale.reportedSaleDate}</td>
                  <td className="px-4 py-3 text-sm">{sale.reportedSalePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">{sale.totalCommissionAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-border">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Cargando ventas...</div>
          ) : sales.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No se encontraron ventas externas.</div>
          ) : sales.map((sale) => (
            <div key={sale.id} className="p-4 space-y-1">
              <div className="text-sm font-semibold">{sale.documentReference || sale.id}</div>
              <div className="text-xs text-muted-foreground">Entrega: {sale.deliveredConsignmentId}</div>
              <div className="text-xs text-muted-foreground">Cantidad: {sale.soldQuantity}</div>
              <div className="text-xs text-muted-foreground">Fecha: {sale.reportedSaleDate}</div>
              <div className="text-xs text-muted-foreground">Venta: {sale.reportedSalePrice.toFixed(2)}</div>
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
