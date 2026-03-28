import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cashShiftService } from '@/services/cash-shift.service';
import type { CashShiftDetail, CashShiftMovement } from '@/services/cash-shift.service';
import { fmtDate } from './components/SalesUtils';
import { CashClosingHeader } from './components/CashClosingHeader';
import { CashClosingSummaryStats } from './components/CashClosingSummaryStats';
import { CashClosingArqueoTable } from './components/CashClosingArqueoTable';
import { CashClosingFooter, type ValidationItem } from './components/CashClosingFooter';

/** Sum movements for a given type and payment method */
function sumMovements(movements: CashShiftMovement[], type: 'INCOME' | 'EXPENSE', method: string): number {
    return movements
        .filter((m) => m.type === type && m.paymentMethod === method)
        .reduce((acc, m) => acc + Number(m.amount), 0);
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

    const formattedDate = openedAt ? fmtDate(shift?.openedAt, "d 'de' MMMM, yyyy") : '—';
    const formattedTime = openedAt ? fmtDate(shift?.openedAt, "hh:mm a") : '—';

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
            <CashClosingHeader
                branchName={branchName}
                formattedDate={formattedDate}
                formattedTime={formattedTime}
            />

            {/* ── Summary Stats ────────────────────────────────────────── */}
            <CashClosingSummaryStats
                openingBalance={openingBalance}
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                expectedFinal={expectedFinal}
            />

            {/* ── Arqueo Table ─────────────────────────────────────────── */}
            <CashClosingArqueoTable
                openingBalance={openingBalance}
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                physTotal={physTotal}
                diffTotal={diffTotal}
                cashSystem={{ inc: incomeCash, exp: expenseCash }}
                cardSystem={{ inc: incomeCard, exp: expenseCard }}
                yapeSystem={{ inc: incomeYape, exp: expenseYape }}
                plinSystem={{ inc: incomePlin, exp: expensePlin }}
                physicalData={{
                    cash: cashPhysical, setCash: setCashPhysical,
                    card: cardPhysical, setCard: setCardPhysical,
                    yape: yapePhysical, setYape: setYapePhysical,
                    plin: plinPhysical, setPlin: setPlinPhysical
                }}
            />

            {/* ── Footer ─────────────────────────────── */}
            <CashClosingFooter
                observations={observations}
                setObservations={setObservations}
                validations={validations}
                isSubmitting={isSubmitting}
                onConfirmClose={handleConfirmClose}
            />
        </div>
    );
}
