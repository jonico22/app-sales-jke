import { RefreshCw, FileText, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import type { Order } from '@/services/order.service';
import { formatCurrency, getStatusBadge, getPaymentBadge } from './SalesHistoryUtils';

interface SalesHistoryTableProps {
  orders: Order[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onViewDetail: (id: string) => void;
  onCancel?: (order: Order) => void;
}

export function SalesHistoryTable({
  orders,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onViewDetail,
  onCancel
}: SalesHistoryTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/30 border-b border-border">
          <tr>
            <SortableTableHead
              field="orderCode"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
            >
              ID Venta
            </SortableTableHead>
            <SortableTableHead
              field="updatedAt"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
            >
              Fecha de Modificación
            </SortableTableHead>
            <SortableTableHead
              field="partnerName"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
            >
              Cliente
            </SortableTableHead>
            <SortableTableHead
              field="totalAmount"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
            >
              Total
            </SortableTableHead>
            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Pago</th>
            <SortableTableHead
              field="status"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider"
            >
              Estado
            </SortableTableHead>
            <th className="px-5 py-3 text-center text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 opacity-20" />
                <span className="text-sm">Cargando transacciones...</span>
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                No se encontraron ventas recientes.
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const clientName = order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General';
              const initials = clientName.slice(0, 2).toUpperCase();
              const payment = order.OrderPayment && order.OrderPayment.length > 0 ? order.OrderPayment[0] : undefined;

              return (
                <tr key={order.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-5 py-3 whitespace-nowrap text-xs font-semibold text-foreground">
                    #{order.orderCode}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-[11px] text-muted-foreground/80 font-medium">
                    {order.updatedAt ? format(new Date(order.updatedAt), 'dd MMM, hh:mm a', { locale: es }) : '-'}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20">
                        {initials}
                      </div>
                      <span className="text-xs text-foreground font-semibold">{clientName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-xs font-bold text-foreground">
                    {formatCurrency(order.totalAmount, order.currency?.symbol || 'S/')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentBadge(payment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-1.5 transition-opacity">
                      <button
                        onClick={() => onViewDetail(order.id)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-95"
                        title="Ver Detalle"
                      >
                        <FileText size={18} />
                      </button>
                      {onCancel && order.status === 'COMPLETED' && (
                        <button
                          onClick={() => onCancel(order)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all active:scale-95"
                          title="Anular Venta"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
