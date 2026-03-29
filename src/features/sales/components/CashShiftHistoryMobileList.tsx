import { useNavigate } from 'react-router-dom';
import { RefreshCw, Banknote, Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShiftStatus } from '@/services/cash-shift.service';
import type { CashShift } from '@/services/cash-shift.service';
import { formatCurrency, parseDate, ShiftStatusBadge } from './SalesUtils';
import { cn } from '@/lib/utils';

interface CashShiftHistoryMobileListProps {
    shifts: CashShift[];
    isLoading: boolean;
    branches: Array<{ id: string; name: string }>;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    totalShifts: number;
}

export function CashShiftHistoryMobileList({
    shifts, isLoading, branches,
    hasPrevPage, hasNextPage, setCurrentPage, totalShifts
}: CashShiftHistoryMobileListProps) {
    const navigate = useNavigate();

    return (
        <div className="md:hidden space-y-4">
            {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 opacity-20" />
                    <span className="text-xs uppercase font-black tracking-widest">Cargando datos...</span>
                </div>
            ) : shifts.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-border rounded-2xl bg-card/50">
                    <Banknote size={32} className="text-muted-foreground/10 mx-auto mb-2" />
                    <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">No hay turnos disponibles</p>
                </div>
            ) : (
                shifts.map((shift) => {
                    const s = shift as any;
                    const isOpen = shift.status === ShiftStatus.OPEN;
                    const openedAt = parseDate(shift.openedAt);
                    const shortId = shift.id.slice(0, 8).toUpperCase();
                    const branchName = s.branch?.name ?? branches.find(b => b.id === shift.branchId)?.name ?? 'S/N';
                    
                    const totalIncome = [s.incomeCash, s.incomeCard, s.incomeYape, s.incomePlin, s.incomeTransfer]
                        .reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
                    const totalExpense = Number(s.expenseCash || 0);
                    const initialAmt = Number(s.initialAmount ?? shift.openingBalance ?? 0);
                    const finalExpected = initialAmt + totalIncome - totalExpense;
                    const balanceVal = isOpen ? finalExpected : Number(s.finalReportedAmount ?? s.finalSystemAmount ?? finalExpected);

                    return (
                        <div key={shift.id} className="bg-card rounded-2xl border border-border/80 shadow-none overflow-hidden relative flex flex-col active:scale-[0.99] transition-all">
                            {/* 1. Header: ID & Branch */}
                            <div className="p-4 border-b border-border/30 flex items-start justify-between bg-muted/5">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-black text-primary uppercase tracking-widest">Turno #{shortId}</span>
                                        <ShiftStatusBadge status={shift.status} />
                                    </div>
                                    <h3 className="text-[13px] font-black text-foreground tracking-tight uppercase">
                                        {branchName}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1">Apertura</p>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/80 justify-end">
                                        <Clock size={10} className="opacity-40" />
                                        <span>{openedAt ? format(openedAt, "dd MMM, hh:mm a", { locale: es }) : '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Financial Highlights Grid */}
                            <div className="p-4 bg-muted/5 grid grid-cols-2 gap-4 border-b border-border/10">
                                <div>
                                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1.5">Initial</p>
                                    <p className="text-[11px] font-black text-foreground/80 tabular-nums">
                                        {formatCurrency(initialAmt)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1.5">Ingresos</p>
                                    <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                        {formatCurrency(totalIncome)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1.5">Egresos</p>
                                    <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 tabular-nums">
                                        {totalExpense > 0 ? `-${formatCurrency(totalExpense)}` : formatCurrency(0)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-primary/50 uppercase tracking-[0.2em] mb-1.5">Balance Final</p>
                                    <p className={cn(
                                        "text-[13px] font-black tabular-nums",
                                        isOpen ? "text-primary" : "text-foreground"
                                    )}>
                                        {formatCurrency(balanceVal)}
                                    </p>
                                </div>
                            </div>

                            {/* 3. Actions */}
                            <div className="p-3 flex items-center gap-2 bg-muted/20">
                                <button
                                    onClick={() => navigate(`/sales/shifts/${shift.id}`)}
                                    className="flex-1 flex items-center justify-center gap-2 h-10 bg-card border border-border/80 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 active:scale-[0.97] transition-all"
                                >
                                    <Eye size={14} />
                                    Detalle
                                </button>
                                {isOpen && (
                                    <button
                                        onClick={() => navigate(`/pos/cash-closing/${shift.id}`)}
                                        className="flex-1 flex items-center justify-center gap-2 h-10 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-[0.97] transition-all"
                                    >
                                        Cerrar Caja
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })
            )}

            {/* Pagination Mobile */}
            <div className="flex items-center justify-between p-2 pt-4">
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{totalShifts} turnos total</span>
                <div className="flex gap-2">
                    <button disabled={!hasPrevPage} onClick={() => setCurrentPage(p => p - 1)} className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center disabled:opacity-30"><ChevronLeft size={16} /></button>
                    <button disabled={!hasNextPage} onClick={() => setCurrentPage(p => p + 1)} className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
            </div>
        </div>
    );
}
