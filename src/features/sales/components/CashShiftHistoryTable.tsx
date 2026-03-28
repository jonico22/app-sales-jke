import { useNavigate } from 'react-router-dom';
import { RefreshCw, Banknote, CalendarDays, Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShiftStatus } from '@/services/cash-shift.service';
import type { CashShift } from '@/services/cash-shift.service';
import { formatCurrency, parseDate, ShiftStatusBadge } from './SalesUtils';

const PAGE_SIZE_OPTIONS = [10, 20, 40];

interface CashShiftHistoryTableProps {
    shifts: CashShift[];
    isLoading: boolean;
    branches: Array<{ id: string; name: string }>;
    currentPage: number;
    pageSize: number;
    totalShifts: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    setPageSize: (size: number) => void;
}

export function CashShiftHistoryTable({
    shifts, isLoading, branches,
    currentPage, pageSize, totalShifts, totalPages,
    hasPrevPage, hasNextPage, setCurrentPage, setPageSize
}: CashShiftHistoryTableProps) {
    const navigate = useNavigate();

    return (
        <div className="hidden md:block bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/30 border-b border-border">
                        <tr>
                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                ID Turno
                            </th>
                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                Sucursal
                            </th>
                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                Apertura / Cierre
                            </th>
                            <th className="px-5 py-3 text-right text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                Monto Inicial
                            </th>
                            <th className="px-5 py-3 text-right text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                Ingresos
                            </th>
                            <th className="px-5 py-3 text-right text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                Egresos
                            </th>
                            <th className="px-5 py-3 text-right text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                Balance Final
                            </th>
                            <th className="px-5 py-3 text-center text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 opacity-20" />
                                    <span className="text-sm">Cargando turnos...</span>
                                </td>
                            </tr>
                        ) : shifts.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Banknote size={32} className="text-muted-foreground/20" />
                                        <p className="text-sm text-muted-foreground">No se encontraron turnos de caja.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            shifts.map((shift) => {
                                const s = shift as any;
                                const isOpen = shift.status === ShiftStatus.OPEN;
                                const openedAt = parseDate(shift.openedAt);
                                const closedAt = parseDate(shift.closedAt);
                                const shortId = shift.id.slice(0, 8).toUpperCase();
                                const branchName = s.branch?.name
                                    ?? branches.find(b => b.id === shift.branchId)?.name
                                    ?? shift.branchId.slice(0, 8);
                                const totalIncome = [s.incomeCash, s.incomeCard, s.incomeYape, s.incomePlin, s.incomeTransfer]
                                    .reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);

                                const totalExpense = Number(s.expenseCash || 0);
                                const initialAmt = Number(s.initialAmount ?? shift.openingBalance ?? 0);
                                const finalExpected = initialAmt + totalIncome - totalExpense;

                                return (
                                    <tr key={shift.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className="text-xs font-bold text-primary tabular-nums">
                                                #{shortId}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className="text-xs font-semibold text-foreground">
                                                {branchName}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <ShiftStatusBadge status={shift.status} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="space-y-0.5">
                                                {openedAt && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-foreground font-medium">
                                                        <CalendarDays size={11} className="text-muted-foreground shrink-0" />
                                                        {format(openedAt, "dd MMM yyyy, HH:mm", { locale: es })}
                                                    </div>
                                                )}
                                                {closedAt && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                                                        <Clock size={11} className="shrink-0" />
                                                        {format(closedAt, "dd MMM yyyy, HH:mm", { locale: es })}
                                                    </div>
                                                )}
                                                {!closedAt && isOpen && (
                                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                        En curso
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-right">
                                            <span className="text-xs font-bold text-foreground tabular-nums">
                                                {formatCurrency(initialAmt)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-right">
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                {formatCurrency(totalIncome)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-right">
                                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                                                {totalExpense > 0 ? `-${formatCurrency(totalExpense)}` : formatCurrency(0)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-right">
                                            <span className={`text-xs font-black tabular-nums ${isOpen ? 'text-primary' : 'text-foreground'}`}>
                                                {formatCurrency(isOpen ? finalExpected : Number(s.finalReportedAmount ?? s.finalSystemAmount ?? finalExpected))}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center items-center gap-1.5">
                                                {isOpen && (
                                                    <button
                                                        onClick={() => navigate(`/pos/cash-closing/${shift.id}`)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 rounded-lg transition-all active:scale-95"
                                                    >
                                                        Cerrar Caja
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/sales/shifts/${shift.id}`)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary bg-primary/5 hover:bg-primary/15 border border-primary/20 rounded-lg transition-all active:scale-95"
                                                >
                                                    <Eye size={13} />
                                                    Ver Detalle
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Desktop */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-4">
                    <span className="text-[11px] text-muted-foreground font-medium">
                        Mostrando <span className="font-bold text-foreground">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalShifts)}</span> de <span className="font-bold text-foreground">{totalShifts}</span> turnos
                    </span>
                    <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-card border border-border text-foreground text-xs rounded-xl p-1.5 font-bold outline-none"
                    >
                        {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n} por página</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button disabled={!hasPrevPage} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border border-border bg-card rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft size={16} /></button>
                    <span className="text-xs font-bold px-3">Página {currentPage} de {totalPages}</span>
                    <button disabled={!hasNextPage} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border border-border bg-card rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
            </div>
        </div>
    );
}
