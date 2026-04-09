import { RefreshCw, Clock, Play, FileText, CreditCard, XCircle } from 'lucide-react';
import type { Order } from '@/services/order.service';
import { StatusBadge, formatCurrency } from './PendingOrdersUtils';
import { cn } from '@/lib/utils';
import {
  dataTableActionIconClassName,
  dataTableCellCodeClassName,
  dataTableCellNumericClassName,
  dataTableCellPrimaryClassName
} from '@/components/shared/dataTableStyles';

interface PendingOrdersMobileListProps {
  orders: Order[];
  isLoading: boolean;
  onResume: (order: Order) => void;
  onViewDetail: (order: Order) => void;
  onPay: (order: Order) => void;
  onCancel: (order: Order) => void;
}

export function PendingOrdersMobileList({
  orders,
  isLoading,
  onResume,
  onViewDetail,
  onPay,
  onCancel
}: PendingOrdersMobileListProps) {
  return (
    <div className="md:hidden p-4 space-y-4 bg-muted/5 min-h-screen">
      {isLoading ? (
        <div className="p-8 text-center bg-card rounded-2xl border border-border/40">
          <RefreshCw className="w-8 h-8 animate-spin text-primary/20 mx-auto mb-3" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/50">Consultando órdenes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 text-center bg-card rounded-2xl border border-border/40">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
            <Clock className="w-8 h-8 text-muted-foreground/20" />
          </div>
          <p className="text-sm font-semibold text-foreground uppercase tracking-[0.08em]">Sin Pendientes</p>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium tracking-wide">Todas las órdenes han sido procesadas o anuladas.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-card rounded-2xl border border-border/80 shadow-none active:bg-muted/30 transition-all relative overflow-hidden flex flex-col"
          >
            {/* 1. Header: Ticket ID + Wait Time Status */}
            <div className="p-4 border-b border-border/30 flex items-center justify-between bg-muted/5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-semibold text-primary/60 uppercase tracking-[0.08em]">Ticket</span>
                <div className="px-2 py-0.5 bg-primary/5 border border-primary/20 rounded-md">
                  <span className={cn(dataTableCellCodeClassName, 'text-slate-800 dark:text-slate-100')}>
                    #{order.orderCode.includes('-') ? order.orderCode.split('-').pop() : order.orderCode}
                  </span>
                </div>
              </div>
              <StatusBadge date={order.createdAt} />
            </div>

            {/* 2. Client Info */}
            <div className="p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center font-semibold text-sm text-primary-foreground shrink-0 capitalize">
                {(order.partner?.firstName?.charAt(0) || order.partner?.companyName?.charAt(0) || 'C').toLowerCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.08em] mb-0.5 leading-none">Cliente</p>
                <h3 className={cn(dataTableCellPrimaryClassName, 'text-[13px] truncate leading-tight')}>
                  {order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/30 border border-border/50">
                    <span className="text-[9px] font-semibold text-foreground/70 uppercase tracking-[0.08em]">
                      {order.totalProducts || 0} ítems
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Amount Highlight Section */}
            <div className="mx-4 mb-3 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em] leading-none mb-1">Monto Pendiente</p>
                <span className="text-[10px] font-bold text-primary/60 leading-none">Total Pedido</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={cn(dataTableCellNumericClassName, 'text-2xl leading-none')}>
                  {formatCurrency(order.totalAmount, order.currency?.symbol || 'S/.')}
                </span>
              </div>
            </div>

            {/* Primary Action Button (Full Width for better accessibility) */}
            <div className="px-4 pb-4">
              <button
                onClick={() => onPay(order)}
                className="w-full flex items-center justify-center gap-2.5 h-12 bg-primary text-primary-foreground rounded-2xl text-[11px] font-semibold uppercase tracking-[0.08em] active:scale-[0.98] transition-all ring-offset-2 hover:ring-2 hover:ring-primary/20 shadow-lg shadow-primary/20"
              >
                <CreditCard className={dataTableActionIconClassName} /> Pagar Ticket
              </button>
            </div>

            {/* 4. Secondary Actions Footer */}
            <div className="p-2 bg-muted/20 border-t border-border/30 flex items-center justify-between gap-1">
              <div className="flex gap-1 flex-1">
                <button
                  onClick={() => onResume(order)}
                  className="flex-1 flex items-center justify-center gap-2 h-10 bg-card hover:bg-muted text-foreground border border-border/40 rounded-xl text-[9px] font-semibold uppercase tracking-[0.08em] active:scale-[0.97] transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current opacity-70" /> Continuar
                </button>
                <button
                  onClick={() => onViewDetail(order)}
                  className="flex-1 flex items-center justify-center gap-2 h-10 bg-card hover:bg-muted text-foreground border border-border/40 rounded-xl text-[9px] font-semibold uppercase tracking-[0.08em] active:scale-[0.97] transition-all"
                >
                  <FileText className="w-3.5 h-3.5 opacity-70" /> Detalle
                </button>
              </div>
              <button
                onClick={() => onCancel(order)}
                className="w-10 h-10 flex items-center justify-center text-destructive/40 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                title="Anular Pedido"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
