import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, ScrollText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type OutgoingConsignmentAgreement, type OutgoingConsignmentAgreementStatus } from '@/services/outgoing-consignment-agreement.service';
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

interface OutgoingConsignmentAgreementsMobileListProps {
  agreements: OutgoingConsignmentAgreement[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  branchNames: Record<string, string>;
  partnerNames: Record<string, string>;
}

const STATUS_LABELS: Record<OutgoingConsignmentAgreementStatus, string> = {
  ACTIVE: 'Activo',
  PENDING: 'Pendiente',
  EXPIRED: 'Expirado',
  TERMINATED: 'Terminado',
};

function getMobileCardClassName(status: OutgoingConsignmentAgreementStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-50/40 dark:bg-emerald-950/10 border-l-4 border-l-emerald-500 shadow-[inset_4px_0_0_0_#10b981]';
    case 'PENDING':
      return 'bg-amber-50/40 dark:bg-amber-950/10 border-l-4 border-l-amber-500 shadow-[inset_4px_0_0_0_#f59e0b]';
    case 'TERMINATED':
      return 'bg-rose-50/40 dark:bg-rose-950/10 border-l-4 border-l-rose-500 shadow-[inset_4px_0_0_0_#f43f5e]';
    default:
      return '';
  }
}

const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
const formatDate = (value?: string) => value?.split('T')[0] || value?.split(' ')[0] || '—';

export function OutgoingConsignmentAgreementsMobileList({
  agreements,
  isLoading,
  onEdit,
  onDelete,
  branchNames,
  partnerNames,
}: OutgoingConsignmentAgreementsMobileListProps) {
  return (
    <div className="md:hidden divide-y divide-border">
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium tracking-tight uppercase">Cargando acuerdos...</span>
        </div>
      ) : agreements.length > 0 ? (
        agreements.map((agreement) => (
          <div
            key={agreement.id}
            className={cn('p-4 bg-card active:bg-muted/50 transition-colors relative', getMobileCardClassName(agreement.status))}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(dataTableCellCodeClassName, 'bg-muted px-1.5 py-0.5 rounded')}>
                    {agreement.agreementCode || 'S/C'}
                  </span>
                  <Badge variant="outline" className="uppercase text-[8px] font-semibold px-1.5 py-0 h-4">
                    {STATUS_LABELS[agreement.status]}
                  </Badge>
                </div>
                <h3 className={cn(dataTableCellPrimaryClassName, 'truncate')}>
                  {partnerNames[agreement.partnerId] || agreement.partnerId}
                </h3>
                <p className={cn(dataTableCellSecondaryClassName, 'mt-0.5 truncate')}>
                  {branchNames[agreement.branchId] || agreement.branchId}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Editar acuerdo ${agreement.agreementCode || agreement.id}`}
                  className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName)}
                  onClick={() => onEdit(agreement.id)}
                >
                  <Pencil className={dataTableActionIconClassName} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Eliminar acuerdo ${agreement.agreementCode || agreement.id}`}
                  className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName)}
                  onClick={() => onDelete(agreement.id)}
                >
                  <Trash2 className={dataTableActionIconClassName} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
              <div className="space-y-0.5">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Periodo</p>
                <p className={dataTableCellPrimaryClassName}>
                  {formatDate(agreement.startDate)} - {formatDate(agreement.endDate)}
                </p>
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Comisión</p>
                <p className={cn(dataTableCellNumericClassName, 'text-primary')}>
                  {formatPercentage(agreement.commissionRate)}
                </p>
              </div>
            </div>

            {agreement.notes ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
                <ScrollText className="mt-0.5 h-3.5 w-3.5 text-muted-foreground/70" />
                <p className={cn(dataTableCellSecondaryClassName, 'leading-relaxed')}>
                  {agreement.notes}
                </p>
              </div>
            ) : null}
          </div>
        ))
      ) : (
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <ScrollText className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron acuerdos</p>
        </div>
      )}
    </div>
  );
}
