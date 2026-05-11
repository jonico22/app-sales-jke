import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Landmark, Loader2, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ReceivedConsignmentSettlement, type ReceivedConsignmentSettlementStatus } from '@/services/received-consignment-settlement.service';
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

interface ReceivedConsignmentSettlementsTableProps {
  settlements: ReceivedConsignmentSettlement[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  agreementLabels: Record<string, string>;
}

const STATUS_LABELS: Record<ReceivedConsignmentSettlementStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
};

const STATUS_STYLES: Record<ReceivedConsignmentSettlementStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900',
};

function formatAmount(value: number | string | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00';
}

function formatDate(value?: string) {
  return value?.split('T')[0] || value?.split(' ')[0] || '—';
}

function getSettlementRowClassName(status: ReceivedConsignmentSettlementStatus) {
  if (status === 'PAID') {
    return 'bg-emerald-50/45 hover:bg-emerald-100/65 dark:bg-emerald-950/10 dark:hover:bg-emerald-900/20 border-l-2 border-l-emerald-500 shadow-[inset_2px_0_0_0_#10b981]';
  }
  return 'bg-amber-50/45 hover:bg-amber-100/65 dark:bg-amber-950/10 dark:hover:bg-amber-900/20 border-l-2 border-l-amber-500 shadow-[inset_2px_0_0_0_#f59e0b]';
}

export function ReceivedConsignmentSettlementsTable({
  settlements,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  agreementLabels,
}: ReceivedConsignmentSettlementsTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader className={dataTableHeaderRowClassName}>
          <TableRow className="hover:bg-transparent border-none">
            <SortableTableHead field="receiptReference" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[160px] h-10')}>
              Liquidación
            </SortableTableHead>
            <SortableTableHead field="outgoingAgreementId" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[180px] h-10')}>
              Acuerdo
            </SortableTableHead>
            <SortableTableHead field="settlementDate" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[150px] h-10')}>
              Fecha
            </SortableTableHead>
            <SortableTableHead field="totalReportedSalesAmount" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[130px] h-10 text-right')}>
              Reportado
            </SortableTableHead>
            <SortableTableHead field="totalReceivedAmount" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[130px] h-10 text-right')}>
              Recibido
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
                  <span>Cargando liquidaciones...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : settlements.length > 0 ? (
            settlements.map((settlement) => (
              <TableRow key={settlement.id} className={cn(dataTableRow('relative'), getSettlementRowClassName(settlement.status))}>
                <TableCell className={cn(dataTableCellCodeClassName, 'pl-4')}>
                  {settlement.receiptReference || settlement.id}
                </TableCell>
                <TableCell>
                  <div className={cn(dataTableCellPrimaryClassName, 'line-clamp-1')}>
                    {agreementLabels[settlement.outgoingAgreementId] || settlement.outgoingAgreementId}
                  </div>
                  <div className={cn(dataTableCellSecondaryClassName, 'text-[9px]')}>
                    {settlement.settlementNotes?.trim() || 'Sin notas registradas'}
                  </div>
                </TableCell>
                <TableCell className={dataTableCellPrimaryClassName}>
                  {formatDate(settlement.settlementDate)}
                </TableCell>
                <TableCell className={cn(dataTableCellNumericClassName, 'text-right')}>
                  {formatAmount(settlement.totalReportedSalesAmount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className={cn(dataTableCellNumericClassName, 'text-primary')}>
                      {formatAmount(settlement.totalReceivedAmount)}
                    </span>
                    <span className={dataTableCellSecondaryClassName}>
                      Comisión {formatAmount(settlement.consigneeCommissionAmount)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={cn('uppercase text-[9px] font-semibold tracking-[0.08em] px-2 py-0.5 rounded-md', STATUS_STYLES[settlement.status])}>
                    {STATUS_LABELS[settlement.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
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
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border">
                    <Landmark className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">No se encontraron liquidaciones</h3>
                  <p className="text-muted-foreground max-w-sm mb-2">
                    Ajusta la búsqueda o el rango de fechas para encontrar liquidaciones registradas.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
