import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Printer,
    Wallet,
    TrendingUp,
    TrendingDown,
    CalendarDays,
    Clock,
    Banknote,
    CreditCard,
    QrCode,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { cashShiftService } from '@/services/cash-shift.service';
import type { CashShiftDetail, CashShiftMovement } from '@/services/cash-shift.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
    `S/ ${amount.toFixed(2)}`;

/** Sum movements for a given type and payment method */
function sumMovements(movements: CashShiftMovement[], type: 'INCOME' | 'EXPENSE', method: string): number {
    return movements
        .filter((m) => m.type === type && m.paymentMethod === method)
        .reduce((acc, m) => acc + Number(m.amount), 0);
}

// ─── Payment Row ──────────────────────────────────────────────────────────────

interface PaymentRowProps {
    icon: React.ReactNode;
    label: string;
    systemAmount: number;
    physicalAmount: string;
    onPhysicalChange: (val: string) => void;
    onBlur: () => void;
}

function PaymentRow({
    icon,
    label,
    systemAmount,
    physicalAmount,
    onPhysicalChange,
    onBlur,
}: PaymentRowProps) {
    const physical = parseFloat(physicalAmount) || 0;
    const diff = physical - systemAmount;
    const isOk = Math.abs(diff) < 0.005;

    return (
        <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1.2fr] items-center gap-3 py-4 border-b border-border last:border-0">
            {/* Method */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-foreground/70">
                    {icon}
                </div>
                <span className="text-sm font-semibold text-foreground">{label}</span>
            </div>

            {/* System amount */}
            <span className="text-sm font-bold text-foreground text-right tabular-nums">
                {formatCurrency(systemAmount)}
            </span>

            {/* Physical input */}
            <div className="flex justify-end">
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={physicalAmount}
                    onChange={(e) => onPhysicalChange(e.target.value)}
                    onBlur={onBlur}
                    className="w-28 h-9 px-3 text-right text-sm font-bold bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                    placeholder="0.00"
                />
            </div>

            {/* Difference badge */}
            <div className="flex justify-end">
                {isOk ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black tabular-nums">
                        S/ 0.00 (OK)
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black tabular-nums">
                        {diff >= 0 ? '+' : '-'} S/ {Math.abs(diff).toFixed(2)}
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CashClosingPage() {
    const { shiftId } = useParams<{ shiftId: string }>();
    const navigate = useNavigate();

    const [shift, setShift] = useState<CashShiftDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Physical amounts entered by the user
    const [cashPhysical, setCashPhysical] = useState('');
    const [cardPhysical, setCardPhysical] = useState('');
    const [yapePhysical, setYapePhysical] = useState('');
    const [plinPhysical, setPlinPhysical] = useState('');

    const [observations, setObservations] = useState('');

    // ── Load shift detail ───────────────────────────────────────────────────

    const loadShift = useCallback(async () => {
        if (!shiftId) return;
        setIsLoading(true);
        try {
            const res = await cashShiftService.getById(shiftId);
            if (res.success && res.data) {
                setShift(res.data);
            } else {
                toast.error('No se pudo cargar el turno de caja');
                navigate('/pos');
            }
        } catch {
            toast.error('Error al obtener el detalle del turno');
            navigate('/pos');
        } finally {
            setIsLoading(false);
        }
    }, [shiftId, navigate]);

    useEffect(() => {
        loadShift();
    }, [loadShift]);

    // ── Computed values ─────────────────────────────────────────────────────

    const movements = shift?.movements ?? [];
    const openingBalance = Number(shift?.initialAmount ?? 0);

    // Income sums for stats cards
    const incomeCash = sumMovements(movements, 'INCOME', 'CASH');
    const incomeCard = sumMovements(movements, 'INCOME', 'CARD');
    const incomeYape = sumMovements(movements, 'INCOME', 'YAPE');
    const incomePlin = sumMovements(movements, 'INCOME', 'PLIN');
    const totalIncome = incomeCash + incomeCard + incomeYape + incomePlin;

    // Expense sums
    const expenseCash = sumMovements(movements, 'EXPENSE', 'CASH');
    const expenseCard = sumMovements(movements, 'EXPENSE', 'CARD');
    const expenseYape = sumMovements(movements, 'EXPENSE', 'YAPE');
    const expensePlin = sumMovements(movements, 'EXPENSE', 'PLIN');
    const totalExpenses = expenseCash + expenseCard + expenseYape + expensePlin;

    // Final Expected value (Total in all methods + initial)
    const expectedFinal = openingBalance + totalIncome - totalExpenses;

    // System amounts for the table (calculated per method)
    const tableSystemCash = openingBalance + incomeCash - expenseCash;
    const tableSystemCard = incomeCard - expenseCard;
    const tableSystemYape = incomeYape - expenseYape;
    const tableSystemPlin = incomePlin - expensePlin;
    const tableSystemTotal = tableSystemCash + tableSystemCard + tableSystemYape + tableSystemPlin;

    const physCash = parseFloat(cashPhysical) || 0;
    const physCard = parseFloat(cardPhysical) || 0;
    const physYape = parseFloat(yapePhysical) || 0;
    const physPlin = parseFloat(plinPhysical) || 0;
    const physTotal = physCash + physCard + physYape + physPlin;

    const diffCash = physCash - tableSystemCash;
    const diffCard = physCard - tableSystemCard;
    const diffYape = physYape - tableSystemYape;
    const diffPlin = physPlin - tableSystemPlin;
    const diffTotal = physTotal - tableSystemTotal;

    // ── Validation bullets ─────────────────────────────────────────────────

    interface ValidationItem { ok: boolean; msg: string }
    const validations: ValidationItem[] = [
        { ok: true, msg: 'Ventas conciliadas con sistema' },
        {
            ok: Math.abs(diffCash) < 0.005,
            msg: Math.abs(diffCash) < 0.005
                ? 'Efectivo cuadrado'
                : `Descuadre en efectivo detectado (S/ ${Math.abs(diffCash).toFixed(2)})`,
        },
        {
            ok: Math.abs(diffCard) < 0.005,
            msg: Math.abs(diffCard) < 0.005
                ? 'Tarjeta cuadrada'
                : `Descuadre en tarjeta detectado (S/ ${Math.abs(diffCard).toFixed(2)})`,
        },
        {
            ok: Math.abs(diffYape) < 0.005,
            msg: Math.abs(diffYape) < 0.005
                ? 'Transacciones Yape verificadas'
                : `Descuadre en Yape detectado (S/ ${Math.abs(diffYape).toFixed(2)})`,
        },
        {
            ok: Math.abs(diffPlin) < 0.005,
            msg: Math.abs(diffPlin) < 0.005
                ? 'Transacciones Plin verificadas'
                : `Descuadre en Plin detectado (S/ ${Math.abs(diffPlin).toFixed(2)})`,
        },
    ];

    // ── Submit ──────────────────────────────────────────────────────────────

    const handleConfirmClose = async () => {
        if (!shiftId) return;
        setIsSubmitting(true);
        try {
            const res = await cashShiftService.close(shiftId, {
                finalReportedAmount: physTotal,
                reportedCashAmount: physCash,
                reportedCardAmount: physCard,
                reportedYapeAmount: physYape,
                reportedPlinAmount: physPlin,
                reportedTransferAmount: 0,
                observations: observations.trim() || undefined,
            });

            if (res.success) {
                toast.success('¡Caja cerrada exitosamente!');
                navigate('/pos');
            } else {
                toast.error(res.message || 'No se pudo cerrar la caja');
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Error al cerrar la caja';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Skip to format only after loading ──────────────────────────────────

    const openedAt = shift?.openedAt ? new Date(shift.openedAt) : null;
    const branchName = shift?.branch?.name ?? 'Sucursal';

    const formattedDate = openedAt
        ? format(openedAt, "d 'de' MMMM, yyyy", { locale: es })
        : '—';
    const formattedTime = openedAt
        ? format(openedAt, 'hh:mm a')
        : '—';

    // ── Loading skeleton ───────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="p-6 max-w-3xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 w-1/3 bg-muted rounded-xl" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-muted rounded-2xl" />
                    ))}
                </div>
                <div className="h-64 bg-muted rounded-2xl" />
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 min-h-screen bg-background pb-24">

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest">
                        <Lock className="w-3 h-3" />
                        Proceso de Cierre
                    </div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">
                        Cierre de Caja – {branchName}
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5 text-muted-foreground text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {formattedDate}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formattedTime}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => navigate('/pos')}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Volver
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Imprimir Reporte
                    </button>
                </div>
            </div>

            {/* ── Summary Stats ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Saldo Inicial */}
                <div className="bg-card border border-border rounded-2xl p-4 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Wallet className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Saldo Inicial</span>
                    </div>
                    <p className="text-lg font-black text-foreground tabular-nums">
                        {formatCurrency(openingBalance)}
                    </p>
                </div>

                {/* Ventas Totales */}
                <div className="bg-card border border-border rounded-2xl p-4 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Ventas Totales</span>
                    </div>
                    <p className="text-lg font-black text-foreground tabular-nums">
                        {formatCurrency(totalIncome)}
                    </p>
                </div>

                {/* Gastos Totales */}
                <div className="bg-card border border-border rounded-2xl p-4 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Gastos Totales</span>
                    </div>
                    <p className="text-lg font-black text-foreground tabular-nums">
                        {formatCurrency(totalExpenses)}
                    </p>
                </div>

                {/* Final Esperado */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Final Esperado</span>
                    </div>
                    <p className="text-lg font-black text-orange-600 dark:text-orange-400 tabular-nums">
                        {formatCurrency(expectedFinal)}
                    </p>
                </div>
            </div>

            {/* ── Arqueo Table ─────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h2 className="text-sm font-black text-foreground uppercase tracking-tight">
                        Arqueo por Medio de Pago
                    </h2>
                </div>

                <div className="px-5">
                    {/* Column headers */}
                    <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1.2fr] gap-3 py-2.5 border-b border-border">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Método de Pago</span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right">Monto Sistema</span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right">Monto Físico</span>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider text-right">Diferencia</span>
                    </div>

                    {/* Rows */}
                    <PaymentRow
                        icon={<Banknote className="w-4 h-4" />}
                        label="Efectivo"
                        systemAmount={tableSystemCash}
                        physicalAmount={cashPhysical}
                        onPhysicalChange={setCashPhysical}
                        onBlur={() => {
                            const n = parseFloat(cashPhysical);
                            if (!isNaN(n)) setCashPhysical(n.toFixed(2));
                        }}
                    />

                    <PaymentRow
                        icon={<CreditCard className="w-4 h-4" />}
                        label="Tarjeta"
                        systemAmount={tableSystemCard}
                        physicalAmount={cardPhysical}
                        onPhysicalChange={setCardPhysical}
                        onBlur={() => {
                            const n = parseFloat(cardPhysical);
                            if (!isNaN(n)) setCardPhysical(n.toFixed(2));
                        }}
                    />

                    <PaymentRow
                        icon={<QrCode className="w-4 h-4" />}
                        label="Yape"
                        systemAmount={tableSystemYape}
                        physicalAmount={yapePhysical}
                        onPhysicalChange={setYapePhysical}
                        onBlur={() => {
                            const n = parseFloat(yapePhysical);
                            if (!isNaN(n)) setYapePhysical(n.toFixed(2));
                        }}
                    />

                    <PaymentRow
                        icon={<QrCode className="w-4 h-4" />}
                        label="Plin"
                        systemAmount={tableSystemPlin}
                        physicalAmount={plinPhysical}
                        onPhysicalChange={setPlinPhysical}
                        onBlur={() => {
                            const n = parseFloat(plinPhysical);
                            if (!isNaN(n)) setPlinPhysical(n.toFixed(2));
                        }}
                    />
                </div>

                {/* Totals row */}
                <div className="px-5 py-4 border-t border-border bg-muted/30">
                    <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1.2fr] gap-3 items-center">
                        <span className="text-xs font-black text-foreground uppercase tracking-tight">Total Final</span>
                        <span className="text-sm font-black text-foreground text-right tabular-nums">
                            {formatCurrency(tableSystemTotal)}
                        </span>
                        <span className="text-sm font-black text-foreground text-right tabular-nums">
                            {formatCurrency(physTotal)}
                        </span>
                        <div className="flex justify-end">
                            {Math.abs(diffTotal) < 0.005 ? (
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                    {formatCurrency(0)} (OK)
                                </span>
                            ) : (
                                <span className="text-xs font-black text-rose-600 dark:text-rose-400 tabular-nums">
                                    {diffTotal >= 0 ? '+' : '-'} S/ {Math.abs(diffTotal).toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom Two-Column Section ─────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Observations */}
                <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
                    <h3 className="text-[11px] font-black text-foreground uppercase tracking-wider">
                        Observaciones del Cierre
                    </h3>
                    <textarea
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        rows={5}
                        placeholder="Ingrese cualquier discrepancia, nota sobre billetes falsos, o gastos extraordinarios..."
                        className="w-full resize-none bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                {/* Validation Summary */}
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-5 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <h3 className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                            Resumen de Validación
                        </h3>
                    </div>
                    <ul className="space-y-2.5">
                        {validations.map((v, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                                {v.ok ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-px" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-px" />
                                )}
                                <span className={`text-xs font-semibold ${v.ok ? 'text-foreground' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {v.msg}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* ── Footer Actions ────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                    onClick={() => navigate('/pos')}
                    className="flex-1 sm:flex-none sm:w-44 h-12 rounded-xl border border-border bg-card text-foreground text-[11px] font-black uppercase tracking-wider hover:bg-muted transition-all active:scale-95"
                >
                    Cancelar y Revisar
                </button>
                <button
                    onClick={handleConfirmClose}
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <Lock className="w-4 h-4" />
                            Confirmar Arqueo y Cerrar Caja
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
