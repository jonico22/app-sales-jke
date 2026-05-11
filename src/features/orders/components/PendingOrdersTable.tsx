import { Play, CreditCard, XCircle, FileText } from 'lucide-react';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import {
  dataTableActionIconClassName,
  dataTableCellCodeClassName,
  dataTableCellNumericClassName,
  dataTableCellPrimaryClassName,
  dataTableCellSecondaryClassName,
  dataTableHead,
  dataTableHeaderRowClassName,
  dataTableRowClassName,
  dataTableShellClassName
} from '@/components/shared/dataTableStyles';
import type { Order } from '@/services/order.service';
import { StatusBadge, formatCurrency } from './PendingOrdersUtils';
import { cn } from '@/lib/utils';

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
    <div className={`hidden md:block ${dataTableShellClassName}`}>
      <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={dataTableHeaderRowClassName}>
            <SortableTableHead
              field="orderCode"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('px-6 py-3 text-left')}
            >
              Ticket ID
            </SortableTableHead>
            <SortableTableHead
              field="partnerName"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('px-6 py-3 text-left')}
            >
              Cliente
            </SortableTableHead>
            <th className={dataTableHead('px-6 py-3 text-left')}>Ítems</th>
            <SortableTableHead
              field="createdAt"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('px-6 py-3 text-left')}
            >
              Espera
            </SortableTableHead>
            <SortableTableHead
              field="totalAmount"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('px-6 py-3 text-left')}
            >
              Total
            </SortableTableHead>
            <th className={dataTableHead('px-6 py-3 text-right')}>Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
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
              <tr key={order.id} className={dataTableRowClassName}>
                <td className="px-6 py-4">
                  <span className={cn(dataTableCellCodeClassName, 'text-primary')}>#{order.orderCode}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                      {order.partner?.firstName?.charAt(0) || order.partner?.companyName?.charAt(0) || 'C'}
                    </div>
                    <div className="flex flex-col">
                      <span className={dataTableCellPrimaryClassName}>
                        {order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General'}
                      </span>
                      {order.notes && (
                        <span className={cn(dataTableCellSecondaryClassName, 'max-w-[150px] truncate')} title={order.notes}>
                          {order.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold uppercase tracking-[0.08em] border border-border/80">
                    {order.totalProducts || 0} productos
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge date={order.createdAt} />
                </td>
                <td className="px-6 py-4">
                  <span className={dataTableCellNumericClassName}>
                    {formatCurrency(order.totalAmount, order.currency?.symbol || 'S/.')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onResume(order)}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary transition-colors hover:bg-primary/20"
                    >
                      <Play className={cn(dataTableActionIconClassName, 'fill-current')} />
                      Reemplazar
                    </button>
                    <button
                      onClick={() => onViewDetail(order)}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-slate-100 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 transition-colors hover:bg-slate-200 hover:text-foreground dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <FileText className={dataTableActionIconClassName} />
                      Detalle
                    </button>
                    <button
                      onClick={() => onPay(order)}
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm shadow-primary/20"
                    >
                      <CreditCard className={dataTableActionIconClassName} />
                      Pagar
                    </button>
                    <button
                      onClick={() => onCancel(order)}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-destructive transition-colors hover:bg-destructive/20"
                    >
                      <XCircle className={dataTableActionIconClassName} />
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
    </div>
  );
}
