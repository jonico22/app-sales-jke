import { RefreshCw, FileText, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import {
  dataTableActionButtonClassName,
  dataTableActionDestructiveClassName,
  dataTableActionIconClassName,
  dataTableActionPrimaryClassName,
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
import { formatCurrency, getStatusBadge, getPaymentBadge } from './SalesHistoryUtils';
import { cn } from '@/lib/utils';

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
    <div className={`hidden md:block ${dataTableShellClassName}`}>
      <div className="overflow-x-auto">
      <table className="w-full">
        <thead className={dataTableHeaderRowClassName}>
          <tr>
            <SortableTableHead
              field="orderCode"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('px-5 py-3 text-left')}
            >
              ID Venta
            </SortableTableHead>
            <SortableTableHead
              field="updatedAt"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('px-5 py-3 text-left')}
            >
              Fecha de Modificación
            </SortableTableHead>
            <SortableTableHead
              field="partnerName"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('px-5 py-3 text-left')}
            >
              Cliente
            </SortableTableHead>
            <SortableTableHead
              field="totalAmount"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('px-5 py-3 text-left')}
            >
              Total
            </SortableTableHead>
            <th className={dataTableHead('px-5 py-3 text-left')}>Pago</th>
            <SortableTableHead
              field="status"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('px-5 py-3 text-left')}
            >
              Estado
            </SortableTableHead>
            <th className={dataTableHead('px-5 py-3 text-center')}>Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
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
                <tr key={order.id} className={dataTableRowClassName}>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={cn(dataTableCellCodeClassName, 'text-slate-800 dark:text-slate-100')}>#{order.orderCode}</span>
                  </td>
                  <td className={cn('px-5 py-3 whitespace-nowrap', dataTableCellSecondaryClassName)}>
                    {order.updatedAt ? format(new Date(order.updatedAt), 'dd MMM, hh:mm a', { locale: es }) : '-'}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20">
                        {initials}
                      </div>
                      <span className={dataTableCellPrimaryClassName}>{clientName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={dataTableCellNumericClassName}>{formatCurrency(order.totalAmount, order.currency?.symbol || 'S/')}</span>
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
                        className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName)}
                        title="Ver Detalle"
                      >
                        <FileText className={dataTableActionIconClassName} />
                      </button>
                      {onCancel && order.status === 'COMPLETED' && (
                        <button
                          onClick={() => onCancel(order)}
                          className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName)}
                          title="Anular Venta"
                        >
                          <XCircle className={dataTableActionIconClassName} />
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
    </div>
  );
}
