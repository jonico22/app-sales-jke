import { RefreshCw, Clock, FileText, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order } from '@/services/order.service';
import { formatCurrency, getStatusBadge, getPaymentBadge } from './SalesHistoryUtils';

interface SalesHistoryMobileListProps {
  orders: Order[];
  isLoading: boolean;
  onViewDetail: (id: string) => void;
}

export function SalesHistoryMobileList({
  orders,
  isLoading,
  onViewDetail
}: SalesHistoryMobileListProps) {
  return (
    <div className="md:hidden p-4 space-y-4 bg-muted/5 min-h-screen">
      {isLoading ? (
        <div className="p-8 text-center bg-card rounded-2xl border border-border/40">
          <RefreshCw className="w-8 h-8 animate-spin text-primary/20 mx-auto mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Sincronizando ventas...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 text-center bg-card rounded-2xl border border-border/40 text-muted-foreground/40 font-black uppercase tracking-widest text-[10px]">
          No se encontraron ventas recientes
        </div>
      ) : (
        orders.map((order) => {
          const clientName = order.partner?.companyName || `${order.partner?.firstName || ''} ${order.partner?.lastName || ''}`.trim() || 'Cliente General';
          const initials = clientName.slice(0, 2).toUpperCase();
          const payment = order.OrderPayment && order.OrderPayment.length > 0 ? order.OrderPayment[0] : undefined;

          return (
            <div
              key={order.id}
              className="bg-card rounded-2xl border border-border/80 shadow-none active:bg-muted/30 transition-all relative overflow-hidden flex flex-col"
              onClick={() => onViewDetail(order.id)}
            >
              {/* 1. Header: Venta ID + Date */}
              <div className="p-4 border-b border-border/30 flex items-center justify-between bg-muted/5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Venta</span>
                  <span className="font-mono text-[11px] font-black text-foreground">#{order.orderCode}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/70">
                  <Clock size={10} className="opacity-50" />
                  <span>{order.updatedAt ? format(new Date(order.updatedAt), 'dd MMM, hh:mm a', { locale: es }) : '-'}</span>
                </div>
              </div>

              {/* 2. Client Info */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black border border-primary/10 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-0.5 leading-none">Cliente</p>
                  <h3 className="text-[13px] font-black text-foreground uppercase tracking-tight truncate leading-tight">{clientName}</h3>
                </div>
              </div>

              {/* 3. Status & Payment Row */}
              <div className="px-4 pb-3 flex items-center gap-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mb-1.5">Estado</p>
                  {getStatusBadge(order.status)}
                </div>
                <div className="w-px h-8 bg-border/40" />
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] leading-none mb-1.5">Método</p>
                  {getPaymentBadge(payment)}
                </div>
              </div>

              {/* 4. Total highlight section (Prominent & Full Width) */}
              <div className="mx-4 mb-4 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[9px] font-black text-primary/50 uppercase tracking-widest leading-none mb-1">Monto Cobrado</p>
                  <span className="text-[10px] font-bold text-muted-foreground/60 leading-none">Total Final</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-foreground tracking-tighter leading-none">
                    {formatCurrency(order.totalAmount, order.currency?.symbol || 'S/')}
                  </span>
                </div>
              </div>

              {/* 5. Actions Footer */}
              <div className="p-3 bg-muted/20 border-t border-border/30 flex items-center justify-end gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 h-10 bg-card hover:bg-muted text-foreground border border-border/40 rounded-xl transition-all active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail(order.id);
                  }}
                >
                  <FileText size={14} className="opacity-50" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ver Detalle</span>
                </button>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 rounded-xl transition-all active:scale-95 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
