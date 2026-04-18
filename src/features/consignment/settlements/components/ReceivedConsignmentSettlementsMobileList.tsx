import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Landmark, Loader2, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ReceivedConsignmentSettlement } from '@/services/received-consignment-settlement.service';
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

interface ReceivedConsignmentSettlementsMobileListProps {
  settlements: ReceivedConsignmentSettlement[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  agreementLabels: Record<string, string>;
}

function formatAmount(value: number | string | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00';
}

function formatDate(value?: string) {
  return value?.split('T')[0] || value?.split(' ')[0] || '—';
}

function getMobileCardClassName(status: string) {
  if (status === 'PAID') return 'bg-emerald-50/40 dark:bg-emerald-950/10 border-l-4 border-l-emerald-500 shadow-[inset_4px_0_0_0_#10b981]';
  return 'bg-amber-50/40 dark:bg-amber-950/10 border-l-4 border-l-amber-500 shadow-[inset_4px_0_0_0_#f59e0b]';
}

export function ReceivedConsignmentSettlementsMobileList({
  settlements,
  isLoading,
  onEdit,
  onDelete,
  agreementLabels,
}: ReceivedConsignmentSettlementsMobileListProps) {
  return (
    <div className="md:hidden divide-y divide-border">
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium tracking-tight uppercase">Cargando liquidaciones...</span>
        </div>
      ) : settlements.length > 0 ? (
        settlements.map((settlement) => (
          <div key={settlement.id} className={cn('p-4 bg-card active:bg-muted/50 transition-colors relative', getMobileCardClassName(settlement.status))}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(dataTableCellCodeClassName, 'bg-muted px-1.5 py-0.5 rounded')}>
                    {settlement.receiptReference || settlement.id}
                  </span>
                  <Badge variant="outline" className="uppercase text-[8px] font-semibold px-1.5 py-0 h-4">
                    {settlement.status}
                  </Badge>
                </div>
                <h3 className={cn(dataTableCellPrimaryClassName, 'truncate')}>
                  {agreementLabels[settlement.outgoingAgreementId] || settlement.outgoingAgreementId}
                </h3>
                <p className={cn(dataTableCellSecondaryClassName, 'mt-0.5 truncate')}>
                  {settlement.settlementNotes || 'Sin notas registradas'}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Editar liquidación ${settlement.receiptReference || settlement.id}`}
                  className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName)}
                  onClick={() => onEdit(settlement.id)}
                >
                  <Pencil className={dataTableActionIconClassName} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Eliminar liquidación ${settlement.receiptReference || settlement.id}`}
                  className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName)}
                  onClick={() => onDelete(settlement.id)}
                >
                  <Trash2 className={dataTableActionIconClassName} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
              <div className="space-y-0.5">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Fecha</p>
                <p className={dataTableCellPrimaryClassName}>{formatDate(settlement.settlementDate)}</p>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Recibido</p>
                <p className={cn(dataTableCellNumericClassName, 'text-primary')}>{formatAmount(settlement.totalReceivedAmount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="space-y-0.5">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Reportado</p>
                <p className={dataTableCellNumericClassName}>{formatAmount(settlement.totalReportedSalesAmount)}</p>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Comisión</p>
                <p className={dataTableCellNumericClassName}>{formatAmount(settlement.consigneeCommissionAmount)}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <Landmark className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron liquidaciones</p>
        </div>
      )}
    </div>
  );
}
