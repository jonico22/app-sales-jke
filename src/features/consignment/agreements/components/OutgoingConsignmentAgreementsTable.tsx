import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BadgeAlert, CalendarRange, FileText, Loader2, Pencil, Trash2 } from 'lucide-react';
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
  dataTableHead,
  dataTableHeaderRowClassName,
  dataTableRow,
} from '@/components/shared/dataTableStyles';

interface OutgoingConsignmentAgreementsTableProps {
  agreements: OutgoingConsignmentAgreement[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  branchNames: Record<string, string>;
  partnerNames: Record<string, string>;
}

const STATUS_STYLES: Record<OutgoingConsignmentAgreementStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900',
  EXPIRED: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  TERMINATED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900',
};

const STATUS_LABELS: Record<OutgoingConsignmentAgreementStatus, string> = {
  ACTIVE: 'Activo',
  PENDING: 'Pendiente',
  EXPIRED: 'Expirado',
  TERMINATED: 'Terminado',
};

const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
const formatDate = (value?: string) => value?.split('T')[0] || value?.split(' ')[0] || '—';

function getAgreementRowClassName(status: OutgoingConsignmentAgreementStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-50/50 hover:bg-emerald-100/70 dark:bg-emerald-950/10 dark:hover:bg-emerald-900/20 border-l-2 border-l-emerald-500 shadow-[inset_2px_0_0_0_#10b981]';
    case 'PENDING':
      return 'bg-amber-50/50 hover:bg-amber-100/70 dark:bg-amber-950/10 dark:hover:bg-amber-900/20 border-l-2 border-l-amber-500 shadow-[inset_2px_0_0_0_#f59e0b]';
    case 'TERMINATED':
      return 'bg-rose-50/55 hover:bg-rose-100/70 dark:bg-rose-950/10 dark:hover:bg-rose-900/20 border-l-2 border-l-rose-500 shadow-[inset_2px_0_0_0_#f43f5e]';
    default:
      return 'bg-white hover:bg-slate-50/90 dark:bg-slate-900/20 dark:hover:bg-slate-800/60';
  }
}

export function OutgoingConsignmentAgreementsTable({
  agreements,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  branchNames,
  partnerNames,
}: OutgoingConsignmentAgreementsTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader className={dataTableHeaderRowClassName}>
          <TableRow className="hover:bg-transparent border-none">
            <SortableTableHead field="agreementCode" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[140px] h-10')}>
              Código
            </SortableTableHead>
            <SortableTableHead field="branchId" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[170px] h-10')}>
              Sucursal
            </SortableTableHead>
            <SortableTableHead field="partnerId" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[210px] h-10')}>
              Consignatario
            </SortableTableHead>
            <SortableTableHead field="startDate" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[180px] h-10')}>
              Periodo
            </SortableTableHead>
            <SortableTableHead field="commissionRate" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[110px] h-10 text-right')}>
              Comisión
            </SortableTableHead>
            <SortableTableHead field="status" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[120px] h-10 text-center')}>
              Estado
            </SortableTableHead>
            <TableHead className={dataTableHead('w-[110px] h-10 text-right')}>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Cargando acuerdos...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : agreements.length > 0 ? (
            agreements.map((agreement) => (
              <TableRow key={agreement.id} className={cn(dataTableRow('relative'), getAgreementRowClassName(agreement.status))}>
                <TableCell className={cn(dataTableCellCodeClassName, 'pl-4')}>{agreement.agreementCode || agreement.id}</TableCell>
                <TableCell>
                  <div className={cn(dataTableCellPrimaryClassName, 'line-clamp-1')}>
                    {branchNames[agreement.branchId] || agreement.branchId}
                  </div>
                  <div className={cn(dataTableCellSecondaryClassName, 'text-[9px]')}>
                    {agreement.branchId}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn(dataTableCellPrimaryClassName, 'line-clamp-1')}>
                    {partnerNames[agreement.partnerId] || agreement.partnerId}
                  </div>
                  <div className={cn(dataTableCellSecondaryClassName, 'text-[9px]')}>
                    {agreement.notes?.trim() || 'Sin notas registradas'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-2">
                    <CalendarRange className="mt-0.5 h-3.5 w-3.5 text-primary/70" />
                    <div>
                      <div className={dataTableCellPrimaryClassName}>
                        {formatDate(agreement.startDate)} - {formatDate(agreement.endDate)}
                      </div>
                      <div className={dataTableCellSecondaryClassName}>
                        Vigencia comercial
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={cn(dataTableCellNumericClassName, 'text-right')}>
                  {formatPercentage(agreement.commissionRate)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={cn('uppercase text-[9px] font-semibold tracking-[0.08em] px-2 py-0.5 rounded-md', STATUS_STYLES[agreement.status])}>
                    {STATUS_LABELS[agreement.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
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
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">
                    No se encontraron acuerdos
                  </h3>
                  <p className="text-muted-foreground max-w-sm mb-2">
                    Ajusta la búsqueda o los filtros para ubicar acuerdos de consignación.
                  </p>
                  <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    <BadgeAlert className="h-3 w-3" />
                    Sin resultados
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
