import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cashShiftService, ShiftStatus, MovementType } from '@/services/cash-shift.service';
import type { CashShiftDetail, CashShiftMovement } from '@/services/cash-shift.service';
import { AddMovementModal } from './components/AddMovementModal';
import { ShiftDetailHeader } from './components/ShiftDetailHeader';
import { ShiftDetailInfoCards } from './components/ShiftDetailInfoCards';
import { ShiftDetailFinancialSummary } from './components/ShiftDetailFinancialSummary';
import { ShiftDetailMovementsList } from './components/ShiftDetailMovementsList';
import { ShiftDetailArqueoComparison } from './components/ShiftDetailArqueoComparison';
import { Banknote, CreditCard, QrCode, Landmark } from 'lucide-react';

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
            <ShiftDetailHeader
                shift={shift}
                isOpen={isOpen}
                shortId={shortId}
            />

            {/* ── Info Cards ────────────────────────────────────────────────── */}
            <ShiftDetailInfoCards shift={shift} />

            {/* ── Financial Summary ─────────────────────────────────────────── */}
            <ShiftDetailFinancialSummary
                initialAmt={initialAmt}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                finalBalance={finalBalance}
            />

            {/* ── Bottom Two-Column ─────────────────────────────────────────── */}
            <ShiftDetailMovementsList
                sysCash={sysCash}
                sysCard={sysCard}
                sysYape={sysYape}
                sysPlin={sysPlin}
                sysTransfer={sysTransfer}
                expenseCash={s.expenseCash}
                totalExpense={totalExpense}
                movements={movements}
                isOpen={isOpen}
                onOpenMovementModal={() => setIsMovementModalOpen(true)}
            />

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
            <ShiftDetailArqueoComparison
                isOpen={isOpen}
                categories={categories}
                globalDiff={globalDiff}
                sysTotalWithInit={sysTotalWithInit}
                totalReported={totalReported}
            />

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
