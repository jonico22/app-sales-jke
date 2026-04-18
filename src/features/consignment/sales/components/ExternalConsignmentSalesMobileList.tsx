import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, ShoppingBag, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ExternalConsignmentSale } from '@/services/external-consignment-sale.service';
import {
  dataTableActionButtonClassName,
  dataTableActionDestructiveClassName,
  dataTableActionIconClassName,
  dataTableActionPrimaryClassName,
  dataTableCellCodeClassName,
  dataTableCellNumericClassName,
  dataTableCellPrimaryClassName,
  dataTableCellSecondaryClassName,
} from '@/components/shared/dataTableStyles';

interface ExternalConsignmentSalesMobileListProps {
  sales: ExternalConsignmentSale[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatAmount(value: number | string | null | undefined) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue.toFixed(2) : '0.00';
}

function formatDate(value?: string) {
  return value?.split('T')[0] || value?.split(' ')[0] || '—';
}

function getMobileCardClassName(sale: ExternalConsignmentSale) {
  const commission = Number(sale.totalCommissionAmount || 0);
  const total = Number(sale.reportedSalePrice || 0);
  if (total > 0 && commission / total >= 0.3) return 'bg-rose-50/40 dark:bg-rose-950/10 border-l-4 border-l-rose-500 shadow-[inset_4px_0_0_0_#f43f5e]';
  if (total >= 500) return 'bg-emerald-50/40 dark:bg-emerald-950/10 border-l-4 border-l-emerald-500 shadow-[inset_4px_0_0_0_#10b981]';
  return '';
}

export function ExternalConsignmentSalesMobileList({
  sales,
  isLoading,
  onEdit,
  onDelete,
}: ExternalConsignmentSalesMobileListProps) {
  return (
    <div className="md:hidden divide-y divide-border">
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium tracking-tight uppercase">Cargando ventas...</span>
        </div>
      ) : sales.length > 0 ? (
        sales.map((sale) => (
          <div key={sale.id} className={cn('p-4 bg-card active:bg-muted/50 transition-colors relative', getMobileCardClassName(sale))}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(dataTableCellCodeClassName, 'bg-muted px-1.5 py-0.5 rounded')}>
                    {sale.documentReference || sale.id}
                  </span>
                  <Badge variant="outline" className="uppercase text-[8px] font-semibold px-1.5 py-0 h-4">
                    Venta
                  </Badge>
                </div>
                <h3 className={cn(dataTableCellPrimaryClassName, 'truncate')}>{sale.deliveredConsignmentId}</h3>
                <p className={cn(dataTableCellSecondaryClassName, 'mt-0.5 truncate')}>{sale.remarks || 'Sin observaciones'}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Editar venta ${sale.documentReference || sale.id}`}
                  className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName)}
                  onClick={() => onEdit(sale.id)}
                >
                  <Pencil className={dataTableActionIconClassName} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Eliminar venta ${sale.documentReference || sale.id}`}
                  className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName)}
                  onClick={() => onDelete(sale.id)}
                >
                  <Trash2 className={dataTableActionIconClassName} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
              <div className="space-y-0.5">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Fecha</p>
                <p className={dataTableCellPrimaryClassName}>{formatDate(sale.reportedSaleDate)}</p>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Cantidad</p>
                <p className={dataTableCellNumericClassName}>{sale.soldQuantity}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="space-y-0.5">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Total</p>
                <p className={cn(dataTableCellNumericClassName, 'text-primary')}>{formatAmount(sale.reportedSalePrice)}</p>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Comisión</p>
                <p className={dataTableCellNumericClassName}>{formatAmount(sale.totalCommissionAmount)}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron ventas</p>
        </div>
      )}
    </div>
  );
}
