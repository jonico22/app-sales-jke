import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BadgeDollarSign, CalendarRange, Loader2, Pencil, ShoppingBag, Trash2 } from 'lucide-react';
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
  dataTableHead,
  dataTableHeaderRowClassName,
  dataTableRow,
} from '@/components/shared/dataTableStyles';

interface ExternalConsignmentSalesTableProps {
  sales: ExternalConsignmentSale[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
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

function getSaleRowClassName(sale: ExternalConsignmentSale) {
  const commission = Number(sale.totalCommissionAmount || 0);
  const total = Number(sale.reportedSalePrice || 0);

  if (total > 0 && commission / total >= 0.3) {
    return 'bg-rose-50/45 hover:bg-rose-100/65 dark:bg-rose-950/10 dark:hover:bg-rose-900/20 border-l-2 border-l-rose-500 shadow-[inset_2px_0_0_0_#f43f5e]';
  }

  if (total >= 500) {
    return 'bg-emerald-50/45 hover:bg-emerald-100/65 dark:bg-emerald-950/10 dark:hover:bg-emerald-900/20 border-l-2 border-l-emerald-500 shadow-[inset_2px_0_0_0_#10b981]';
  }

  return 'bg-white hover:bg-slate-50/90 dark:bg-slate-900/20 dark:hover:bg-slate-800/60';
}

export function ExternalConsignmentSalesTable({
  sales,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: ExternalConsignmentSalesTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader className={dataTableHeaderRowClassName}>
          <TableRow className="hover:bg-transparent border-none">
            <SortableTableHead field="documentReference" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[140px] h-10')}>
              Venta
            </SortableTableHead>
            <SortableTableHead field="deliveredConsignmentId" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[140px] h-10')}>
              Entrega
            </SortableTableHead>
            <SortableTableHead field="soldQuantity" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[100px] h-10 text-right')}>
              Cantidad
            </SortableTableHead>
            <SortableTableHead field="reportedSaleDate" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[150px] h-10')}>
              Fecha
            </SortableTableHead>
            <SortableTableHead field="reportedSalePrice" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[120px] h-10 text-right')}>
              Total
            </SortableTableHead>
            <SortableTableHead field="totalCommissionAmount" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={onSort} className={dataTableHead('w-[120px] h-10 text-right')}>
              Comisión
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
                  <span>Cargando ventas...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : sales.length > 0 ? (
            sales.map((sale) => (
              <TableRow key={sale.id} className={cn(dataTableRow('relative'), getSaleRowClassName(sale))}>
                <TableCell className={cn(dataTableCellCodeClassName, 'pl-4')}>
                  {sale.documentReference || sale.id}
                </TableCell>
                <TableCell>
                  <div className={cn(dataTableCellPrimaryClassName, 'line-clamp-1')}>{sale.deliveredConsignmentId}</div>
                  <div className={cn(dataTableCellSecondaryClassName, 'text-[9px]')}>{sale.remarks?.trim() || 'Sin observaciones'}</div>
                </TableCell>
                <TableCell className={cn(dataTableCellNumericClassName, 'text-right')}>
                  {sale.soldQuantity}
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-2">
                    <CalendarRange className="mt-0.5 h-3.5 w-3.5 text-primary/70" />
                    <div>
                      <div className={dataTableCellPrimaryClassName}>{formatDate(sale.reportedSaleDate)}</div>
                      <div className={dataTableCellSecondaryClassName}>Fecha reportada</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={cn(dataTableCellNumericClassName, 'text-right')}>
                  {formatAmount(sale.reportedSalePrice)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className={cn(dataTableCellNumericClassName, 'text-primary')}>
                      {formatAmount(sale.totalCommissionAmount)}
                    </span>
                    <span className={dataTableCellSecondaryClassName}>
                      Neto {formatAmount(sale.netTotal)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
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
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">No se encontraron ventas externas</h3>
                  <p className="text-muted-foreground max-w-sm mb-2">
                    Ajusta el rango de fechas o la búsqueda para encontrar ventas reportadas.
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
