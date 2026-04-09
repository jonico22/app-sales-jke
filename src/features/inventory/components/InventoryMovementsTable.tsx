import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, History, ArrowRightLeft, Edit2, Trash2 } from 'lucide-react';
import { type BranchMovement, type MovementStatus } from '@/services/branch-movement.service';
import type { ReactNode } from 'react';
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
    dataTableRow
} from '@/components/shared/dataTableStyles';
import { cn } from '@/lib/utils';

interface InventoryMovementsTableProps {
    movements: BranchMovement[];
    isLoading: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
    onEdit: (movement: BranchMovement) => void;
    onDelete: (id: string, reference: string) => void;
}

export function InventoryMovementsTable({
    movements,
    isLoading,
    sortBy,
    sortOrder,
    onSort,
    onEdit,
    onDelete
}: InventoryMovementsTableProps) {
    const formatDateSafe = (dateString: string | undefined | null, formatStr: string) => {
        if (!dateString) return '-';
        try {
            let date = new Date(dateString);
            if (isNaN(date.getTime()) && dateString.includes('/')) {
                date = parse(dateString, 'dd/MM/yyyy HH:mm:ss', new Date());
            }
            if (isNaN(date.getTime())) return '-';
            return format(date, formatStr, { locale: es });
        } catch {
            return '-';
        }
    };

    const getStatusBadge = (status: MovementStatus): ReactNode => {
        switch (status) {
            case 'PENDING':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">En Tránsito</Badge>;
            case 'COMPLETED':
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Recibido</Badge>;
            case 'CANCELLED':
                return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20">Cancelado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="hidden md:block">
            <Table>
                <TableHeader className={dataTableHeaderRowClassName}>
                    <TableRow className="hover:bg-transparent border-none">
                        <SortableTableHead
                            field="referenceCode"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('py-4 px-6')}
                        >
                            Referencia
                        </SortableTableHead>
                        <SortableTableHead
                            field="createdAt"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('py-4 text-center')}
                        >
                            Fecha
                        </SortableTableHead>
                        <SortableTableHead
                            field="productName"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('py-4')}
                        >
                            Producto
                        </SortableTableHead>
                        <SortableTableHead
                            field="originBranchName"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('py-4')}
                        >
                            Ruta (Origen → Destino)
                        </SortableTableHead>
                        <SortableTableHead
                            field="quantityMoved"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('py-4 text-center')}
                        >
                            Cant.
                        </SortableTableHead>
                        <SortableTableHead
                            field="notes"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('py-4')}
                        >
                            Observación / Motivo
                        </SortableTableHead>
                        <SortableTableHead
                            field="status"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('py-4 text-center')}
                        >
                            Estado
                        </SortableTableHead>
                        <TableHead className={dataTableHead('py-4 px-6 text-right')}>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow className="border-none">
                            <TableCell colSpan={8} className="h-64 text-center border-none">
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Sincronizando movimientos...</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : movements.length === 0 ? (
                        <TableRow className="border-none">
                            <TableCell colSpan={8} className="h-64 text-center border-none">
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <div className="p-5 bg-muted/30 rounded-full">
                                        <History className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-foreground font-black text-xs uppercase tracking-wider">No se encontraron movimientos</p>
                                        <p className="text-muted-foreground text-[10px] font-medium max-w-[250px] mx-auto opacity-70">Ajusta los filtros para visualizar el historial de traslados internos.</p>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        movements.map((movement) => (
                            <TableRow key={movement.id} className={dataTableRow('last:border-none')}>
                                <TableCell className="px-6">
                                    <div className="inline-flex items-center gap-1.5 py-1 px-2.5 bg-primary/5 rounded-lg border border-primary/10">
                                        <span className={cn(dataTableCellCodeClassName, 'text-primary')}>
                                            {movement.referenceCode || `TR-${movement.id.slice(0, 5).toUpperCase()}`}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={cn(dataTableCellPrimaryClassName, 'mb-0.5')}>{formatDateSafe(movement.createdAt, 'dd/MM/yyyy')}</span>
                                        <span className={cn(dataTableCellSecondaryClassName, 'text-[9px] tracking-[0.08em]')}>{formatDateSafe(movement.createdAt, 'HH:mm:ss')}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className={cn(dataTableCellPrimaryClassName, 'line-clamp-1')}>{movement.product?.name || 'Producto'}</span>
                                        <span className={cn(dataTableCellSecondaryClassName, 'text-[9px]')}>SKU-{movement.product?.code || '---'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(dataTableCellSecondaryClassName, 'truncate max-w-[100px]')}>
                                            {movement.originBranch?.name || 'Origen'}
                                        </span>
                                        <ArrowRightLeft className="w-2.5 h-2.5 text-muted-foreground/30" />
                                        <span className={cn(dataTableCellSecondaryClassName, 'truncate max-w-[100px]')}>
                                            {movement.destinationBranch?.name || 'Destino'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className={cn(dataTableCellNumericClassName, 'inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/30 bg-muted/40')}>
                                        {movement.quantityMoved}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col max-w-[200px]">
                                        {movement.status === 'CANCELLED' ? (
                                            <span className="text-[10px] font-semibold leading-tight italic text-rose-500">
                                                {movement.cancellationReason || 'Sin motivo de cancelación'}
                                            </span>
                                        ) : (
                                            <span className={cn(dataTableCellSecondaryClassName, 'truncate italic')}>
                                                {movement.notes || '---'}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {getStatusBadge(movement.status)}
                                </TableCell>
                                <TableCell className="text-right px-6">
                                    <div className="flex items-center justify-end gap-1.5 transition-all duration-200">
                                        {movement.status === 'PENDING' && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName, 'border-border')}
                                                onClick={() => onEdit(movement)}
                                            >
                                                <Edit2 className={dataTableActionIconClassName} />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName, 'border-border')}
                                            onClick={() => onDelete(movement.id, movement.referenceCode || movement.id)}
                                        >
                                            <Trash2 className={dataTableActionIconClassName} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
