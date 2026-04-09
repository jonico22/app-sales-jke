import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, History, ArrowRightLeft, Edit2, Trash2 } from 'lucide-react';
import { type BranchMovement, type MovementStatus } from '@/services/branch-movement.service';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
    dataTableActionButtonClassName,
    dataTableActionDestructiveClassName,
    dataTableActionIconClassName,
    dataTableActionPrimaryClassName,
    dataTableCellCodeClassName,
    dataTableCellNumericClassName,
    dataTableCellPrimaryClassName,
    dataTableCellSecondaryClassName
} from '@/components/shared/dataTableStyles';

interface InventoryMovementsMobileListProps {
    movements: BranchMovement[];
    isLoading: boolean;
    onEdit: (movement: BranchMovement) => void;
    onDelete: (id: string, reference: string) => void;
}

export function InventoryMovementsMobileList({
    movements,
    isLoading,
    onEdit,
    onDelete
}: InventoryMovementsMobileListProps) {
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
        <div className="md:hidden divide-y divide-border">
            {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Sincronizando...</p>
                </div>
            ) : movements.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
                    <History className="h-10 w-10 text-muted-foreground/20" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron movimientos</p>
                </div>
            ) : (
                movements.map((movement) => (
                    <div key={movement.id} className="p-4 bg-card active:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={cn(dataTableCellCodeClassName, 'text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/10')}>
                                        {movement.referenceCode || `TR-${movement.id.slice(0, 5).toUpperCase()}`}
                                    </span>
                                    {getStatusBadge(movement.status)}
                                </div>
                                <h3 className={dataTableCellPrimaryClassName}>{movement.product?.name || 'Producto'}</h3>
                                <div className={cn('flex items-center gap-1.5 mt-1', dataTableCellSecondaryClassName)}>
                                    <span>SKU-{movement.product?.code || '---'}</span>
                                    <span className="opacity-30">•</span>
                                    <span>{formatDateSafe(movement.createdAt, 'dd/MM/yyyy')}</span>
                                </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                {movement.status === 'PENDING' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName, 'border-border')}
                                        onClick={() => onEdit(movement)}
                                    >
                                        <Edit2 className={dataTableActionIconClassName} />
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName, 'border-border')}
                                    onClick={() => onDelete(movement.id, movement.referenceCode || movement.id)}
                                >
                                    <Trash2 className={dataTableActionIconClassName} />
                                </Button>
                            </div>
                        </div>

                        <div className="bg-muted/30 rounded-xl p-2.5 border border-border/50 mb-2">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-0.5">Origen</p>
                                    <p className={cn(dataTableCellPrimaryClassName, 'truncate')}>{movement.originBranch?.name || 'Origen'}</p>
                                </div>
                                <div className="flex flex-col items-center px-2">
                                    <div className={cn(dataTableCellNumericClassName, 'h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm mb-1')}>
                                        {movement.quantityMoved}
                                    </div>
                                    <ArrowRightLeft className="w-3 h-3 text-muted-foreground/30" />
                                </div>
                                <div className="flex-1 min-w-0 text-right">
                                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-0.5">Destino</p>
                                    <p className={cn(dataTableCellPrimaryClassName, 'truncate')}>{movement.destinationBranch?.name || 'Destino'}</p>
                                </div>
                            </div>
                        </div>

                        {(movement.notes || movement.cancellationReason) && (
                            <div className="text-[10px] italic">
                                {movement.status === 'CANCELLED' ? (
                                    <p className="text-rose-500 font-semibold uppercase tracking-[0.08em]">Motivo: {movement.cancellationReason}</p>
                                ) : (
                                    <p className={cn(dataTableCellSecondaryClassName, 'line-clamp-2')}>Nota: {movement.notes}</p>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
