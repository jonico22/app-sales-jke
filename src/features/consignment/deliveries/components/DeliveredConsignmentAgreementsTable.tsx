import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarRange, Loader2, Pencil, Trash2, Truck } from 'lucide-react';
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
  dataTableHead,
  dataTableHeaderRowClassName,
  dataTableRow,
} from '@/components/shared/dataTableStyles';

interface DeliveredConsignmentAgreementsTableProps {
  deliveries: DeliveredConsignmentAgreement[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  branchNames: Record<string, string>;
  agreementLabels: Record<string, string>;
}

const formatDate = (value?: string) => value?.split('T')[0] || value?.split(' ')[0] || '—';

function getDeliveryStatusStyle(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900';
  if (normalized === 'completed') return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900';
  if (normalized === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900';
  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
}

function getDeliveryRowClassName(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'active') return 'bg-emerald-50/45 hover:bg-emerald-100/65 dark:bg-emerald-950/10 dark:hover:bg-emerald-900/20 border-l-2 border-l-emerald-500 shadow-[inset_2px_0_0_0_#10b981]';
  if (normalized === 'completed') return 'bg-sky-50/40 hover:bg-sky-100/60 dark:bg-sky-950/10 dark:hover:bg-sky-900/20 border-l-2 border-l-sky-500 shadow-[inset_2px_0_0_0_#0ea5e9]';
  if (normalized === 'cancelled') return 'bg-rose-50/45 hover:bg-rose-100/65 dark:bg-rose-950/10 dark:hover:bg-rose-900/20 border-l-2 border-l-rose-500 shadow-[inset_2px_0_0_0_#f43f5e]';
  return 'bg-white hover:bg-slate-50/90 dark:bg-slate-900/20 dark:hover:bg-slate-800/60';
}

export function DeliveredConsignmentAgreementsTable({
  deliveries,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  branchNames,
  agreementLabels,
}: DeliveredConsignmentAgreementsTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader className={dataTableHeaderRowClassName}>
          <TableRow className="hover:bg-transparent border-none">
            <SortableTableHead field="id" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[140px] h-10')}>
              Entrega
            </SortableTableHead>
            <SortableTableHead field="consignmentAgreementId" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[180px] h-10')}>
              Acuerdo
            </SortableTableHead>
            <SortableTableHead field="productId" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[180px] h-10')}>
              Producto
            </SortableTableHead>
            <SortableTableHead field="deliveredStock" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[130px] h-10 text-right')}>
              Stock
            </SortableTableHead>
            <SortableTableHead field="deliveryDate" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[150px] h-10')}>
              Fecha
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
                  <span>Cargando entregas...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <TableRow key={delivery.id} className={cn(dataTableRow('relative'), getDeliveryRowClassName(delivery.status))}>
                <TableCell className={cn(dataTableCellCodeClassName, 'pl-4')}>{delivery.id}</TableCell>
                <TableCell>
                  <div className={cn(dataTableCellPrimaryClassName, 'line-clamp-1')}>
                    {agreementLabels[delivery.consignmentAgreementId] || delivery.consignmentAgreementId}
                  </div>
                  <div className={cn(dataTableCellSecondaryClassName, 'text-[9px]')}>
                    {branchNames[delivery.branchId] || delivery.branchId}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn(dataTableCellPrimaryClassName, 'line-clamp-1')}>{delivery.productId}</div>
                  <div className={cn(dataTableCellSecondaryClassName, 'text-[9px]')}>{delivery.notes?.trim() || 'Sin notas registradas'}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className={cn(dataTableCellNumericClassName, 'text-primary')}>{delivery.remainingStock}/{delivery.deliveredStock}</span>
                    <span className={dataTableCellSecondaryClassName}>Disponible / entregado</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-2">
                    <CalendarRange className="mt-0.5 h-3.5 w-3.5 text-primary/70" />
                    <div>
                      <div className={dataTableCellPrimaryClassName}>{formatDate(delivery.deliveryDate)}</div>
                      <div className={dataTableCellSecondaryClassName}>Fecha de registro</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={cn('uppercase text-[9px] font-semibold tracking-[0.08em] px-2 py-0.5 rounded-md', getDeliveryStatusStyle(delivery.status))}>
                    {delivery.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
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
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border">
                    <Truck className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">No se encontraron entregas</h3>
                  <p className="text-muted-foreground max-w-sm mb-2">
                    Ajusta la búsqueda o los filtros para ubicar entregas registradas.
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
