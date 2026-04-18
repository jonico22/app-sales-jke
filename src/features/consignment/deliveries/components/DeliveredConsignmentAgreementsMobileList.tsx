import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, ScrollText, Trash2, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type DeliveredConsignmentAgreement } from '@/services/delivered-consignment-agreement.service';
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

interface DeliveredConsignmentAgreementsMobileListProps {
  deliveries: DeliveredConsignmentAgreement[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  branchNames: Record<string, string>;
  agreementLabels: Record<string, string>;
}

function getMobileCardClassName(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'active') return 'bg-emerald-50/40 dark:bg-emerald-950/10 border-l-4 border-l-emerald-500 shadow-[inset_4px_0_0_0_#10b981]';
  if (normalized === 'completed') return 'bg-sky-50/40 dark:bg-sky-950/10 border-l-4 border-l-sky-500 shadow-[inset_4px_0_0_0_#0ea5e9]';
  if (normalized === 'cancelled') return 'bg-rose-50/40 dark:bg-rose-950/10 border-l-4 border-l-rose-500 shadow-[inset_4px_0_0_0_#f43f5e]';
  return '';
}

const formatDate = (value?: string) => value?.split('T')[0] || value?.split(' ')[0] || '—';

export function DeliveredConsignmentAgreementsMobileList({
  deliveries,
  isLoading,
  onEdit,
  onDelete,
  branchNames,
  agreementLabels,
}: DeliveredConsignmentAgreementsMobileListProps) {
  return (
    <div className="md:hidden divide-y divide-border">
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium tracking-tight uppercase">Cargando entregas...</span>
        </div>
      ) : deliveries.length > 0 ? (
        deliveries.map((delivery) => (
          <div key={delivery.id} className={cn('p-4 bg-card active:bg-muted/50 transition-colors relative', getMobileCardClassName(delivery.status))}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(dataTableCellCodeClassName, 'bg-muted px-1.5 py-0.5 rounded')}>
                    {delivery.id}
                  </span>
                  <Badge variant="outline" className="uppercase text-[8px] font-semibold px-1.5 py-0 h-4">
                    {delivery.status}
                  </Badge>
                </div>
                <h3 className={cn(dataTableCellPrimaryClassName, 'truncate')}>
                  {agreementLabels[delivery.consignmentAgreementId] || delivery.consignmentAgreementId}
                </h3>
                <p className={cn(dataTableCellSecondaryClassName, 'mt-0.5 truncate')}>
                  {branchNames[delivery.branchId] || delivery.branchId}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Editar entrega ${delivery.id}`}
                  className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName)}
                  onClick={() => onEdit(delivery.id)}
                >
                  <Pencil className={dataTableActionIconClassName} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Eliminar entrega ${delivery.id}`}
                  className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName)}
                  onClick={() => onDelete(delivery.id)}
                >
                  <Trash2 className={dataTableActionIconClassName} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
              <div className="space-y-0.5">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Producto</p>
                <p className={dataTableCellPrimaryClassName}>{delivery.productId}</p>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Stock</p>
                <p className={cn(dataTableCellNumericClassName, 'text-primary')}>{delivery.remainingStock}/{delivery.deliveredStock}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
              <span>Fecha: {formatDate(delivery.deliveryDate)}</span>
              <span>{branchNames[delivery.branchId] || delivery.branchId}</span>
            </div>

            {delivery.notes ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
                <ScrollText className="mt-0.5 h-3.5 w-3.5 text-muted-foreground/70" />
                <p className={cn(dataTableCellSecondaryClassName, 'leading-relaxed')}>
                  {delivery.notes}
                </p>
              </div>
            ) : null}
          </div>
        ))
      ) : (
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <Truck className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron entregas</p>
        </div>
      )}
    </div>
  );
}
