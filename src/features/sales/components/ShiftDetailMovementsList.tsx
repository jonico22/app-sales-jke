import { Banknote, CreditCard, QrCode, Landmark, CircleDot, RefreshCw, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { MovementType, type CashShiftMovement } from '@/services/cash-shift.service';
import { formatCurrency, parseDate } from './SalesUtils';

function IncomeRow({ icon, label, amount }: { icon: React.ReactNode; label: string; amount: string }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    {icon}
                </div>
                <span className="text-sm font-semibold text-foreground">{label}</span>
            </div>
            <span className="text-sm font-bold text-foreground tabular-nums">{amount}</span>
        </div>
    );
}

function MovementRow({ movement }: { movement: CashShiftMovement }) {
    const isIncome = movement.type === MovementType.INCOME;
    const date = parseDate(movement.createdAt);
    const timeStr = date ? format(date, 'HH:mm') : '—';
    return (
        <div className="flex flex-col sm:grid sm:grid-cols-[1.5fr_2fr_1.2fr_1fr] sm:items-center gap-2 sm:gap-4 py-3 sm:py-4 border-b border-border last:border-0 group transition-colors hover:bg-muted/5">
            {/* Mobile Header: Time + Type Badge */}
            <div className="flex items-center justify-between sm:contents">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight sm:text-[11px] sm:font-medium sm:normal-case sm:tracking-normal">
                    {date ? format(date, 'dd/MM, ') : ''}{timeStr}
                </span>

                <div className="sm:hidden">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${isIncome
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                        {isIncome ? 'Ingreso' : 'Egreso'}
                    </span>
                </div>
            </div>

            {/* Concept / Payment Method */}
            <div className="flex items-center gap-2 min-w-0">
                <CircleDot
                    size={10}
                    className={`shrink-0 ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}
                />
                <span className="text-[13px] sm:text-xs font-bold sm:font-semibold text-foreground truncate">
                    {movement.description || movement.paymentMethod}
                </span>
            </div>

            {/* Desktop-only Type Badge */}
            <div className="hidden sm:block">
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${isIncome
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}>
                    {isIncome ? 'Ingreso' : 'Egreso'}
                </span>
            </div>

            {/* Amount (Styled differently on mobile) */}
            <div className="flex items-baseline justify-end sm:contents">
                <span className={`text-[15px] sm:text-xs font-black tabular-nums text-right ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                    {isIncome ? '+' : '-'}{formatCurrency(movement.amount)}
                </span>
            </div>
        </div>
    );
}

interface ShiftDetailMovementsListProps {
    sysCash: number;
    sysCard: number;
    sysYape: number;
    sysPlin: number;
    sysTransfer: number;
    expenseCash: number;
    totalExpense: number;
    movements: CashShiftMovement[];
    isOpen: boolean;
    onOpenMovementModal: () => void;
}

export function ShiftDetailMovementsList({
    sysCash,
    sysCard,
    sysYape,
    sysPlin,
    sysTransfer,
    expenseCash,
    totalExpense,
    movements,
    isOpen,
    onOpenMovementModal
}: ShiftDetailMovementsListProps) {
    return (
        <div className="grid md:grid-cols-2 gap-4">
            {/* Desglose de Ingresos */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-[11px] font-black text-foreground uppercase tracking-wider">
                        Desglose de Ingresos
                    </h3>
                </div>
                <div className="px-5 py-1">
                    <IncomeRow icon={<Banknote size={15} />} label="Efectivo" amount={formatCurrency(sysCash)} />
                    <IncomeRow icon={<CreditCard size={15} />} label="Tarjeta" amount={formatCurrency(sysCard)} />
                    <IncomeRow icon={<QrCode size={15} />} label="Yape" amount={formatCurrency(sysYape)} />
                    <IncomeRow icon={<QrCode size={15} />} label="Plin" amount={formatCurrency(sysPlin)} />
                    <IncomeRow icon={<Landmark size={15} />} label="Transferencia" amount={formatCurrency(sysTransfer)} />
                </div>
                {/* Egresos */}
                {totalExpense > 0 && (
                    <>
                        <div className="px-5 py-2 border-t border-border bg-muted/20">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Egresos</p>
                        </div>
                        <div className="px-5 py-1 pb-3">
                            <IncomeRow icon={<Banknote size={15} />} label="Efectivo (Egreso)" amount={`-${formatCurrency(expenseCash)}`} />
                        </div>
                    </>
                )}
            </div>

            {/* Historial de Movimientos */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-foreground uppercase tracking-wider">
                        Historial de Movimientos
                    </h3>
                    <span className="text-[10px] font-bold text-muted-foreground">
                        {movements.length} {movements.length === 1 ? 'movimiento' : 'movimientos'}
                    </span>
                </div>

                {movements.length > 0 ? (
                    <>
                        {/* Column headers - Visible only on Desktop */}
                        <div className="hidden sm:grid grid-cols-[1.5fr_2fr_1.2fr_1fr] gap-4 px-5 py-2 bg-muted/20">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Fecha / Hora</span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Concepto</span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Tipo</span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right">Monto</span>
                        </div>
                        <div className="px-5 flex-1 overflow-y-auto max-h-[360px]">
                            {movements.map((m) => (
                                <MovementRow key={m.id} movement={m} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground/40">
                        <RefreshCw size={28} className="opacity-30" />
                        <p className="text-xs font-semibold">Sin movimientos registrados</p>
                    </div>
                )}

                {isOpen && (
                    <div className="px-5 py-3 border-t border-border">
                        <button
                            onClick={onOpenMovementModal}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-primary/40 text-primary hover:bg-primary/5 text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
                        >
                            <Plus size={14} />
                            Registrar Movimiento Manual
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
