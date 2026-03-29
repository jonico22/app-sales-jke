import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { RefreshCw, FileText, Package, ArrowRightLeft } from 'lucide-react';
import type { KardexTransaction } from '@/services/kardex.service';
import { KardexMovementBadge } from './KardexMovementBadge';

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
        <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                    <tr>
                        <SortableTableHead 
                            field="date" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                        >
                            Fecha / Hora
                        </SortableTableHead>
                        <SortableTableHead 
                            field="productName" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                        >
                            Producto
                        </SortableTableHead>
                        <SortableTableHead 
                            field="branchOfficeName" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                        >
                            Sucursal
                        </SortableTableHead>
                        <SortableTableHead 
                            field="type" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                        >
                            Operación
                        </SortableTableHead>
                        <SortableTableHead 
                            field="quantity" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                        >
                            Stock Movido
                        </SortableTableHead>
                        <SortableTableHead 
                            field="newStock" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                        >
                            Balance
                        </SortableTableHead>
                        <SortableTableHead 
                            field="documentNumber" 
                            currentSortBy={sortBy} 
                            currentSortOrder={sortOrder} 
                            onSort={onSort}
                            className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                        >
                            Documento
                        </SortableTableHead>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
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
                            <tr key={t.id} className="hover:bg-muted/5 transition-colors group">
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
                                            {format(new Date(t.date), 'dd MMM yyyy', { locale: es })}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground/60">
                                            {format(new Date(t.date), 'hh:mm a')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 border border-border/50">
                                            <Package size={14} className="text-muted-foreground/60" />
                                        </div>
                                        <div className="flex flex-col min-w-0 max-w-[250px]">
                                            <span className="text-[11px] font-black text-foreground uppercase tracking-tight truncate leading-tight">
                                                {t.product?.name || 'PRODUCTO DESCONOCIDO'}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                                {t.product?.code || 'SIN CÓDIGO'}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                                        {t.branchOffice?.name || '-'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <KardexMovementBadge type={t.type} />
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <span className={`text-[13px] font-black tracking-tighter ${
                                        t.quantity > 0 ? 'text-emerald-500' : 'text-rose-500'
                                    }`}>
                                        {t.quantity > 0 ? '+' : ''}{t.quantity}
                                    </span>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                                            {t.previousStock}
                                        </span>
                                        <ArrowRightLeft className="w-2.5 h-2.5 text-muted-foreground/30" />
                                        <span className="text-[12px] font-black text-foreground uppercase tracking-tight">
                                            {t.newStock}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    {t.documentNumber ? (
                                        <div className="flex items-center gap-2">
                                            <FileText size={12} className="text-primary/50" />
                                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                                                {t.documentNumber}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground/30 italic uppercase tracking-widest">-</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
