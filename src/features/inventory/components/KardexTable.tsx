import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { RefreshCw, FileText, Package, ArrowRightLeft } from 'lucide-react';
import type { KardexTransaction } from '@/services/kardex.service';
import { KardexMovementBadge } from './KardexMovementBadge';
import {
    dataTableCellCodeClassName,
    dataTableCellNumericClassName,
    dataTableCellPrimaryClassName,
    dataTableCellSecondaryClassName,
    dataTableHead,
    dataTableHeaderRowClassName,
    dataTableRowClassName,
    dataTableShellClassName
} from '@/components/shared/dataTableStyles';
import { cn } from '@/lib/utils';

interface KardexTableProps {
    transactions: KardexTransaction[];
    isLoading: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
}

export function KardexTable({
    transactions,
    isLoading,
    sortBy,
    sortOrder,
    onSort,
}: KardexTableProps) {
    return (
        <div className={`hidden lg:block ${dataTableShellClassName}`}>
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead className={dataTableHeaderRowClassName}>
                    <tr>
                        <SortableTableHead 
                            field="date" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className={dataTableHead('px-5 py-4 text-left')}
                        >
                            Fecha / Hora
                        </SortableTableHead>
                        <SortableTableHead 
                            field="productName" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className={dataTableHead('px-5 py-4 text-left')}
                        >
                            Producto
                        </SortableTableHead>
                        <SortableTableHead 
                            field="branchOfficeName" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className={dataTableHead('px-5 py-4 text-left')}
                        >
                            Sucursal
                        </SortableTableHead>
                        <SortableTableHead 
                            field="type" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className={dataTableHead('px-5 py-4 text-left')}
                        >
                            Operación
                        </SortableTableHead>
                        <SortableTableHead 
                            field="quantity" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className={dataTableHead('px-5 py-4 text-left')}
                        >
                            Stock Movido
                        </SortableTableHead>
                        <SortableTableHead 
                            field="newStock" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className={dataTableHead('px-5 py-4 text-left')}
                        >
                            Balance
                        </SortableTableHead>
                        <SortableTableHead 
                            field="documentNumber" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className={dataTableHead('px-5 py-4 text-left')}
                        >
                            Documento
                        </SortableTableHead>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                    {isLoading && transactions.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-24 text-center">
                                <RefreshCw size={32} className="animate-spin text-primary/20 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Sincronizando con el servidor...</p>
                            </td>
                        </tr>
                    ) : transactions.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-24 text-center">
                                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText size={24} className="text-muted-foreground/30" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">No se encontraron movimientos registrados</p>
                            </td>
                        </tr>
                    ) : (
                        transactions.map((t) => (
                            <tr key={t.id} className={dataTableRowClassName}>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className={dataTableCellPrimaryClassName}>
                                            {format(new Date(t.date), 'dd MMM yyyy', { locale: es })}
                                        </span>
                                        <span className={dataTableCellSecondaryClassName}>
                                            {format(new Date(t.date), 'hh:mm a')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-border/60">
                                            <Package size={14} className="text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <div className="flex flex-col min-w-0 max-w-[250px]">
                                            <span className={cn(dataTableCellPrimaryClassName, 'truncate leading-tight')}>
                                                {t.product?.name || 'PRODUCTO DESCONOCIDO'}
                                            </span>
                                            <span className={cn(dataTableCellCodeClassName, 'text-[9px] tracking-[0.08em]')}>
                                                {t.product?.code || 'SIN CÓDIGO'}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <span className={dataTableCellSecondaryClassName}>
                                        {t.branchOffice?.name || '-'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <KardexMovementBadge type={t.type} />
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <span
                                        className={cn(
                                            'text-[12px] font-semibold tabular-nums',
                                            t.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                        )}
                                    >
                                        {t.quantity > 0 ? '+' : ''}{t.quantity}
                                    </span>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className={dataTableCellSecondaryClassName}>
                                            {t.previousStock}
                                        </span>
                                        <ArrowRightLeft className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                                        <span className={dataTableCellNumericClassName}>
                                            {t.newStock}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    {t.documentNumber ? (
                                        <div className="flex items-center gap-2">
                                            <FileText size={12} className="text-primary/50" />
                                            <span className={dataTableCellCodeClassName}>
                                                {t.documentNumber}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className={cn(dataTableCellSecondaryClassName, 'italic')}>-</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            </div>
        </div>
    );
}
