import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Printer,
    Lock,
    Building2,
    User,
    LogIn,
    LogOut,
    Banknote,
    CreditCard,
    QrCode,
    Landmark,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Wallet,
    Plus,
    CircleDot,
} from 'lucide-react';
import { format, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cashShiftService, ShiftStatus, MovementType } from '@/services/cash-shift.service';
import type { CashShiftDetail, CashShiftMovement } from '@/services/cash-shift.service';
import { AddMovementModal } from './components/AddMovementModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number | string | null | undefined) => {
    const val = Number(n ?? 0);
    return `S/ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function parseDate(raw: string | null | undefined): Date | null {
    if (!raw) return null;
    const iso = new Date(raw);
    if (isValid(iso) && raw.includes('-')) return iso;
    try {
        const d = parse(raw, 'dd/MM/yyyy HH:mm:ss', new Date());
        return isValid(d) ? d : null;
    } catch {
        return null;
    }
}

function fmtDate(raw: string | null | undefined, pattern = "dd/MM/yyyy, hh:mm a"): string {
    const d = parseDate(raw);
    return d ? format(d, pattern, { locale: es }) : '—';
}

// ─── Info Card ────────────────────────────────────────────────────────────────

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2.5 sm:gap-3 bg-card border border-border rounded-2xl px-3 sm:px-4 py-3 shadow-sm">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-tight sm:tracking-wider leading-none mb-1">{label}</p>
                <p className="text-[13px] sm:text-sm font-bold text-foreground leading-tight break-words">{value}</p>
            </div>
        </div>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    variant?: 'default' | 'income' | 'expense' | 'primary';
}

function StatCard({ label, value, icon, variant = 'default' }: StatCardProps) {
    const styles = {
        default: 'bg-card border-border text-foreground',
        income: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        expense: 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400',
        primary: 'bg-primary border-primary text-primary-foreground',
    };
    const labelStyle = {
        default: 'text-muted-foreground',
        income: 'text-emerald-600/70 dark:text-emerald-400/70',
        expense: 'text-rose-600/70 dark:text-rose-400/70',
        primary: 'text-primary-foreground/70',
    };

    return (
        <div className={`rounded-2xl border p-4 sm:p-5 shadow-sm ${styles[variant]}`}>
            <div className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-tight sm:tracking-wider ${labelStyle[variant]}`}>
                {icon}
                {label}
            </div>
            <p className={`text-lg sm:text-xl font-black tabular-nums leading-tight ${variant === 'primary' ? 'text-primary-foreground' : ''}`}>
                {value}
            </p>
        </div>
    );
}

// ─── Income Row ───────────────────────────────────────────────────────────────

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
                    {isIncome ? '+' : '-'}{fmt(movement.amount)}
                </span>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CashShiftDetailPage() {
    const { shiftId } = useParams<{ shiftId: string }>();
    const navigate = useNavigate();

    const [shift, setShift] = useState<CashShiftDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

    const load = useCallback(async () => {
        if (!shiftId) return;
        setIsLoading(true);
        try {
            const res = await cashShiftService.getById(shiftId);
            if (res.success && res.data) {
                setShift(res.data);
            } else {
                toast.error('No se pudo cargar el turno');
                navigate('/sales/shifts');
            }
        } catch {
            toast.error('Error al obtener el turno');
            navigate('/sales/shifts');
        } finally {
            setIsLoading(false);
        }
    }, [shiftId, navigate]);

    useEffect(() => { load(); }, [load]);

    if (isLoading) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 w-1/3 bg-muted rounded-xl" />
                <div className="grid grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="h-64 bg-muted rounded-2xl" />
                    <div className="h-64 bg-muted rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!shift) return null;

    const s = shift as any;
    const isOpen = shift.status === ShiftStatus.OPEN;
    const shortId = shift.id.slice(0, 8).toUpperCase();

    const movements: CashShiftMovement[] = shift.movements ?? [];

    // Robust Category Totals: Prefer shift fields, fallback to summing movements
    const getCat = (fieldVal: any, method: string) => {
        if (fieldVal != null && Number(fieldVal) !== 0) return Number(fieldVal);
        // Fallback: sum movements of this method
        return movements
            .filter(m => m.type === MovementType.INCOME && m.paymentMethod === method)
            .reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
    };

    const sysCash = getCat(s.incomeCash, 'CASH');
    const sysCard = getCat(s.incomeCard, 'CARD');
    const sysYape = getCat(s.incomeYape, 'YAPE');
    const sysPlin = getCat(s.incomePlin, 'PLIN');
    const sysTransfer = getCat(s.incomeTransfer, 'TRANSFER');

    const totalIncome = sysCash + sysCard + sysYape + sysPlin + sysTransfer;
    const totalExpense = Number(s.expenseCash || movements
        .filter(m => m.type === MovementType.EXPENSE)
        .reduce((acc, m) => acc + (Number(m.amount) || 0), 0));

    const initialAmt = Number(s.initialAmount || shift.openingBalance || 0);

    // Difference and system balance logic
    // Usually finalSystemAmount is just Initial + Cash from many APIs
    const sysTotalWithInit = initialAmt + totalIncome - totalExpense;

    const finalBalance = s.finalReportedAmount != null
        ? Number(s.finalReportedAmount)
        : s.finalSystemAmount != null
            ? Number(s.finalSystemAmount)
            : sysTotalWithInit;

    // Helper for category comparison
    const categories = [
        {
            label: 'Efectivo',
            income: initialAmt + sysCash,
            expense: totalExpense, // Assuming expenses are mostly cash
            rep: s.reportedCashAmount,
            icon: <Banknote size={14} />
        },
        {
            label: 'Tarjeta',
            income: sysCard,
            expense: 0,
            rep: s.reportedCardAmount,
            icon: <CreditCard size={14} />
        },
        {
            label: 'Yape',
            income: sysYape,
            expense: 0,
            rep: s.reportedYapeAmount,
            icon: <QrCode size={14} />
        },
        {
            label: 'Plin',
            income: sysPlin,
            expense: 0,
            rep: s.reportedPlinAmount,
            icon: <QrCode size={14} />
        },
        {
            label: 'Transferencia',
            income: sysTransfer,
            expense: 0,
            rep: s.reportedTransferAmount,
            icon: <Landmark size={14} />
        },
    ].map(c => {
        const sysNet = c.income - c.expense;
        return {
            ...c,
            sysNet,
            diff: Number(c.rep ?? 0) - sysNet
        };
    });

    const totalReported = categories.reduce((acc, c) => acc + Number(c.rep ?? 0), 0);
    const globalDiff = totalReported - sysTotalWithInit;

    return (
        <div className="md:px-6  md:py-6 max-w-5xl mx-auto space-y-4 md:space-y-6 bg-background pb-5">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate('/sales/shifts')}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-bold mb-2 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Volver al listado
                    </button>
                    <h1 className="text-xl font-black text-foreground tracking-tight">
                        Detalle de Turno{' '}
                        <span className="text-primary">#{shortId}</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        {isOpen ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                ABIERTO
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-black">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                                CERRADO
                            </span>
                        )}
                        <span className="text-[11px] text-muted-foreground font-medium">
                            Iniciado el {fmtDate(shift.openedAt, "d 'de' MMMM, yyyy")}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 border border-border bg-card text-foreground hover:bg-muted text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 w-full sm:w-auto"
                    >
                        <Printer size={14} />
                        Imprimir Reporte
                    </button>
                    {isOpen && (
                        <button
                            onClick={() => navigate(`/pos/cash-closing/${shift.id}`)}
                            className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2 bg-primary text-primary-foreground rounded-xl shadow-sm shadow-primary/20 text-[11px] font-black uppercase tracking-wider hover:bg-primary/90 transition-all active:scale-95 w-full sm:w-auto"
                        >
                            <Lock size={14} />
                            Cerrar Turno
                        </button>
                    )}
                </div>
            </div>

            {/* ── Info Cards ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                <InfoCard
                    icon={<Building2 size={16} />}
                    label="Sucursal"
                    value={shift.branch?.name ?? '—'}
                />
                <InfoCard
                    icon={<User size={16} />}
                    label="Cajero"
                    value={s.userName ?? s.userId?.slice(0, 8) ?? '—'}
                />
                <InfoCard
                    icon={<LogIn size={16} />}
                    label="Apertura"
                    value={fmtDate(shift.openedAt, 'dd/MM/yyyy hh:mm a')}
                />
                <InfoCard
                    icon={<LogOut size={16} />}
                    label="Cierre"
                    value={shift.closedAt ? fmtDate(shift.closedAt, 'dd/MM/yyyy hh:mm a') : 'En curso...'}
                />
            </div>

            {/* ── Financial Summary ─────────────────────────────────────────── */}
            <div>
                <h2 className="text-sm font-black text-foreground uppercase tracking-tight mb-2 md:mb-3">
                    Resumen Financiero
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                    <StatCard
                        label="Monto Inicial"
                        value={fmt(initialAmt)}
                        icon={<Wallet size={12} />}
                        variant="default"
                    />
                    <StatCard
                        label="Ingresos Totales"
                        value={fmt(totalIncome)}
                        icon={<TrendingUp size={12} />}
                        variant="income"
                    />
                    <StatCard
                        label="Egresos Totales"
                        value={`-${fmt(totalExpense)}`}
                        icon={<TrendingDown size={12} />}
                        variant="expense"
                    />
                    <StatCard
                        label="Balance Final"
                        value={fmt(finalBalance)}
                        icon={<Wallet size={12} />}
                        variant="primary"
                    />
                </div>
            </div>

            {/* ── Bottom Two-Column ─────────────────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-4">

                {/* Desglose de Ingresos */}
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                        <h3 className="text-[11px] font-black text-foreground uppercase tracking-wider">
                            Desglose de Ingresos
                        </h3>
                    </div>
                    <div className="px-5 py-1">
                        <IncomeRow icon={<Banknote size={15} />} label="Efectivo" amount={fmt(sysCash)} />
                        <IncomeRow icon={<CreditCard size={15} />} label="Tarjeta" amount={fmt(sysCard)} />
                        <IncomeRow icon={<QrCode size={15} />} label="Yape" amount={fmt(sysYape)} />
                        <IncomeRow icon={<QrCode size={15} />} label="Plin" amount={fmt(sysPlin)} />
                        <IncomeRow icon={<Landmark size={15} />} label="Transferencia" amount={fmt(sysTransfer)} />
                    </div>
                    {/* Egresos */}
                    {totalExpense > 0 && (
                        <>
                            <div className="px-5 py-2 border-t border-border bg-muted/20">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Egresos</p>
                            </div>
                            <div className="px-5 py-1 pb-3">
                                <IncomeRow icon={<Banknote size={15} />} label="Efectivo (Egreso)" amount={`-${fmt(s.expenseCash)}`} />
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
                                onClick={() => setIsMovementModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-primary/40 text-primary hover:bg-primary/5 text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
                            >
                                <Plus size={14} />
                                Registrar Movimiento Manual
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Observations ─────────────────────────────────────────────── */}
            {shift.observations && (
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <h3 className="text-[11px] font-black text-foreground uppercase tracking-wider mb-2">
                        Observaciones del Cierre
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{shift.observations}</p>
                </div>
            )}

            {/* ── Comparison Table (Arqueo) ─────────────────────────── */}
            {!isOpen && (
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-[11px] font-black text-foreground uppercase tracking-wider">
                            Arqueo de Caja vs Sistema
                        </h3>
                    </div>

                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30">
                                    <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Medio de Pago</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Ingresos Sist.</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Egresos Sist.</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Declarado</th>
                                    <th className="px-5 py-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Diferencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {categories.map((cat) => (
                                    <tr key={cat.label} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                                    {cat.icon}
                                                </div>
                                                <span className="text-xs font-bold text-foreground">{cat.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                            {fmt(cat.income)}
                                        </td>
                                        <td className="px-5 py-4 text-right text-[11px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                                            {cat.expense > 0 ? `-${fmt(cat.expense)}` : fmt(0)}
                                        </td>
                                        <td className="px-5 py-4 text-right text-xs font-bold text-foreground tabular-nums">
                                            {fmt(cat.rep)}
                                        </td>
                                        <td className={`px-5 py-4 text-right text-xs font-black tabular-nums ${cat.diff >= -0.005 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                            }`}>
                                            {cat.diff > 0.005 ? '+' : cat.diff < -0.005 ? '' : ''}{fmt(cat.diff)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Arqueo View */}
                    <div className="sm:hidden divide-y divide-border">
                        {categories.map((cat) => (
                            <div key={cat.label} className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            {cat.icon}
                                        </div>
                                        <span className="text-[13px] font-black text-foreground uppercase tracking-tight">{cat.label}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg border text-[11px] font-black tabular-nums ${cat.diff >= -0.005 ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10' : 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-500/10'
                                        }`}>
                                        {cat.diff > 0.005 ? '+' : ''}{fmt(cat.diff)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col bg-muted/30 p-2 rounded-xl border border-border/40">
                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">Sist. Ing.</span>
                                        <span className="text-[11px] font-bold text-emerald-600 tabular-nums">{fmt(cat.income)}</span>
                                    </div>
                                    <div className="flex flex-col bg-muted/30 p-2 rounded-xl border border-border/40">
                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">Sist. Egr.</span>
                                        <span className="text-[11px] font-bold text-rose-600 tabular-nums">{cat.expense > 0 ? `-${fmt(cat.expense)}` : '0.00'}</span>
                                    </div>
                                    <div className="flex flex-col bg-muted/30 p-2 rounded-xl border border-border/40">
                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">Declarado</span>
                                        <span className="text-[11px] font-black text-foreground tabular-nums">{fmt(cat.rep)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={`px-5 py-5 border-t border-border flex items-center justify-between ${globalDiff >= -0.005 ? 'bg-emerald-500/5' : 'bg-rose-500/5'
                        }`}>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-foreground uppercase tracking-widest">Diferencia Total</span>
                            <span className="text-[9px] text-muted-foreground/60 font-medium">Reportado - (Sistema + Inicial)</span>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[9px] font-black text-muted-foreground uppercase">Sistema + Inicial</span>
                                <span className="text-xs font-bold text-foreground">{fmt(sysTotalWithInit)}</span>
                            </div>
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[9px] font-black text-muted-foreground uppercase">Declarado Total</span>
                                <span className="text-xs font-bold text-foreground">{fmt(totalReported)}</span>
                            </div>
                            <span className={`text-base font-black tabular-nums px-4 py-2 rounded-xl border ${globalDiff >= -0.005
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
                                }`}>
                                {globalDiff > 0.005 ? '+' : ''}{fmt(globalDiff)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Movement Modal ────────────────────────────────────────── */}
            <AddMovementModal
                isOpen={isMovementModalOpen}
                onClose={() => setIsMovementModalOpen(false)}
                onSuccess={() => load()}
                shiftId={shift.id}
                shiftName={shift.branch?.name}
            />
        </div>
    );
}
