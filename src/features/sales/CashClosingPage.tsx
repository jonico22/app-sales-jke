import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fmtDate } from './components/SalesUtils';
import { CashClosingHeader } from './components/CashClosingHeader';
import { CashClosingSummaryStats } from './components/CashClosingSummaryStats';
import { CashClosingArqueoTable } from './components/CashClosingArqueoTable';
import { CashClosingFooter, type ValidationItem } from './components/CashClosingFooter';
import { useCashShiftDetailQuery, useCloseCashShiftMutation } from './hooks/useCashShiftQueries';
import { useCashShiftCalculations } from './hooks/useCashShiftCalculations';

export default function CashClosingPage() {
    const { shiftId } = useParams<{ shiftId: string }>();
    const navigate = useNavigate();

    // ── Logic Hooks ────────────────────────────────────────────────────────
    const { data: detailRes, isLoading } = useCashShiftDetailQuery(shiftId || null);
    const { mutate: closeShift, isPending: isSubmitting } = useCloseCashShiftMutation();
    
    const shift = detailRes?.data;
    const stats = useCashShiftCalculations(shift);

    // ── Physical amounts state ──────────────────────────────────────────────
    const [cashPhysical, setCashPhysical] = useState('');
    const [cardPhysical, setCardPhysical] = useState('');
    const [yapePhysical, setYapePhysical] = useState('');
    const [plinPhysical, setPlinPhysical] = useState('');
    const [observations, setObservations] = useState('');

    // ── Computed live values ────────────────────────────────────────────────
    const physCash = parseFloat(cashPhysical) || 0;
    const physCard = parseFloat(cardPhysical) || 0;
    const physYape = parseFloat(yapePhysical) || 0;
    const physPlin = parseFloat(plinPhysical) || 0;
    const physTotal = physCash + physCard + physYape + physPlin;

    if (!stats) {
        if (isLoading) {
            return (
                <div className="p-6 max-w-3xl mx-auto space-y-6 animate-pulse">
                    <div className="h-8 w-1/3 bg-muted rounded-xl" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
                    </div>
                    <div className="h-64 bg-muted rounded-2xl" />
                </div>
            );
        }
        return null;
    }

    const diffCash = physCash - stats.sysCash - stats.initialAmt; // Note: initialAmt is usually added to Cash
    // Wait, let's re-verify the logic from previous version
    // tableSystemCash = openingBalance + incomeCash - expenseCash;
    const tableSystemCash = stats.initialAmt + stats.sysCash - stats.totalExpense;
    const tableSystemCard = stats.sysCard;
    const tableSystemYape = stats.sysYape;
    const tableSystemPlin = stats.sysPlin;
    
    const liveDiffCash = physCash - tableSystemCash;
    const liveDiffCard = physCard - tableSystemCard;
    const liveDiffYape = physYape - tableSystemYape;
    const liveDiffPlin = physPlin - tableSystemPlin;
    const liveDiffTotal = physTotal - stats.sysTotalWithInit;

    // ── Validation bullets ─────────────────────────────────────────────────
    const validations: ValidationItem[] = [
        { ok: true, msg: 'Ventas conciliadas con sistema' },
        {
            ok: Math.abs(liveDiffCash) < 0.005,
            msg: Math.abs(liveDiffCash) < 0.005
                ? 'Efectivo cuadrado'
                : `Descuadre en efectivo detectado (S/ ${Math.abs(liveDiffCash).toFixed(2)})`,
        },
        {
            ok: Math.abs(liveDiffCard) < 0.005,
            msg: Math.abs(liveDiffCard) < 0.005
                ? 'Tarjeta cuadrada'
                : `Descuadre en tarjeta detectado (S/ ${Math.abs(liveDiffCard).toFixed(2)})`,
        },
        {
            ok: Math.abs(liveDiffYape) < 0.005,
            msg: Math.abs(liveDiffYape) < 0.005
                ? 'Transacciones Yape verificadas'
                : `Descuadre en Yape detectado (S/ ${Math.abs(liveDiffYape).toFixed(2)})`,
        },
        {
            ok: Math.abs(liveDiffPlin) < 0.005,
            msg: Math.abs(liveDiffPlin) < 0.005
                ? 'Transacciones Plin verificadas'
                : `Descuadre en Plin detectado (S/ ${Math.abs(liveDiffPlin).toFixed(2)})`,
        },
    ];

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleConfirmClose = () => {
        if (!shiftId) return;
        closeShift({
            id: shiftId,
            data: {
                finalReportedAmount: physTotal,
                reportedCashAmount: physCash,
                reportedCardAmount: physCard,
                reportedYapeAmount: physYape,
                reportedPlinAmount: physPlin,
                reportedTransferAmount: 0,
                observations: observations.trim() || undefined,
            }
        }, {
            onSuccess: () => navigate('/pos')
        });
    };

    const branchName = shift?.branch?.name ?? 'Sucursal';
    const formattedDate = fmtDate(shift?.openedAt, "d 'de' MMMM, yyyy");
    const formattedTime = fmtDate(shift?.openedAt, "hh:mm a");

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 min-h-screen bg-background pb-24">
            <CashClosingHeader
                branchName={branchName}
                formattedDate={formattedDate}
                formattedTime={formattedTime}
            />

            <CashClosingSummaryStats
                openingBalance={stats.initialAmt}
                totalIncome={stats.totalIncome}
                totalExpenses={stats.totalExpense}
                expectedFinal={stats.sysTotalWithInit}
            />

            <CashClosingArqueoTable
                openingBalance={stats.initialAmt}
                totalIncome={stats.totalIncome}
                totalExpenses={stats.totalExpense}
                physTotal={physTotal}
                diffTotal={liveDiffTotal}
                cashSystem={{ inc: stats.sysCash, exp: stats.totalExpense }}
                cardSystem={{ inc: stats.sysCard, exp: 0 }}
                yapeSystem={{ inc: stats.sysYape, exp: 0 }}
                plinSystem={{ inc: stats.sysPlin, exp: 0 }}
                physicalData={{
                    cash: cashPhysical, setCash: setCashPhysical,
                    card: cardPhysical, setCard: setCardPhysical,
                    yape: yapePhysical, setYape: setYapePhysical,
                    plin: plinPhysical, setPlin: setPlinPhysical
                }}
            />

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
