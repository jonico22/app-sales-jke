import { Play, CreditCard, XCircle, FileText } from 'lucide-react';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import type { Order } from '@/services/order.service';
import { StatusBadge, formatCurrency } from './PendingOrdersUtils';

interface PendingOrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onResume: (order: Order) => void;
  onViewDetail: (order: Order) => void;
  onPay: (order: Order) => void;
  onCancel: (order: Order) => void;
}

export function PendingOrdersTable({
  orders,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onResume,
  onViewDetail,
  onPay,
  onCancel
}: PendingOrdersTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <SortableTableHead
              field="orderCode"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider"
            >
              Ticket ID
            </SortableTableHead>
            <SortableTableHead
              field="partnerName"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider"
            >
              Cliente
            </SortableTableHead>
            <th className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Ítems</th>
            <SortableTableHead
              field="createdAt"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider"
            >
              Espera
            </SortableTableHead>
            <SortableTableHead
              field="totalAmount"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider"
            >
              Total
            </SortableTableHead>
            <th className="px-6 py-3 text-right text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {isLoading ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm font-medium">
                Cargando pedidos...
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm font-medium">
                No hay pedidos pendientes
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-mono text-[11px] font-bold text-primary">#{order.orderCode}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                      {order.partner?.firstName?.charAt(0) || order.partner?.companyName?.charAt(0) || 'C'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-foreground">
                        {order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General'}
                      </span>
                      {order.notes && (
                        <span className="text-[10px] text-muted-foreground max-w-[150px] truncate" title={order.notes}>
                          {order.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg bg-muted/50 text-muted-foreground text-[10px] font-bold border border-border">
                    {order.totalProducts || 0} productos
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge date={order.createdAt} />
                </td>
                <td className="px-6 py-4">
                  <span className="font-black text-[12px] text-foreground">
                    {formatCurrency(order.totalAmount, order.currency?.symbol || 'S/.')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onResume(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Reemplazar
                    </button>
                    <button
                      onClick={() => onViewDetail(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                    >
                      <FileText className="w-3 h-3" />
                      Detalle
                    </button>
                    <button
                      onClick={() => onPay(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[10px] font-bold transition-colors shadow-sm shadow-primary/20 uppercase tracking-wider"
                    >
                      <CreditCard className="w-3 h-3" />
                      Pagar
                    </button>
                    <button
                      onClick={() => onCancel(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                    >
                      <XCircle className="w-3 h-3" />
                      Anular
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
