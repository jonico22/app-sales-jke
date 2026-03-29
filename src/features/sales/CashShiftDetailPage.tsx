import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AddMovementModal } from './components/AddMovementModal';
import { ShiftDetailHeader } from './components/ShiftDetailHeader';
import { ShiftDetailInfoCards } from './components/ShiftDetailInfoCards';
import { ShiftDetailFinancialSummary } from './components/ShiftDetailFinancialSummary';
import { ShiftDetailMovementsList } from './components/ShiftDetailMovementsList';
import { ShiftDetailArqueoComparison } from './components/ShiftDetailArqueoComparison';
import { useCashShiftDetailQuery } from './hooks/useCashShiftQueries';
import { useCashShiftCalculations } from './hooks/useCashShiftCalculations';
import { Banknote, CreditCard, QrCode, Landmark } from 'lucide-react';

export default function CashShiftDetailPage() {
    const { shiftId } = useParams<{ shiftId: string }>();
    const navigate = useNavigate();

    // ── Logic Hooks ────────────────────────────────────────────────────────
    const { data: detailRes, isLoading, refetch } = useCashShiftDetailQuery(shiftId || null);
    const shift = detailRes?.data;
    const stats = useCashShiftCalculations(shift);

    // ── Local UI State ─────────────────────────────────────────────────────
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

    // ── Handlers ────────────────────────────────────────────────────────────
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

    if (!shift || !stats) return null;

    // Map categories with icons for the comparison table
    const categoriesWithIcons = stats.categories.map(c => ({
        ...c,
        icon: c.method === 'CASH' ? <Banknote size={14} /> :
              c.method === 'CARD' ? <CreditCard size={14} /> :
              c.method === 'TRANSFER' ? <Landmark size={14} /> : <QrCode size={14} />
    }));

    return (
        <div className="md:px-6 md:py-6 max-w-5xl mx-auto space-y-4 md:space-y-6 bg-background pb-5">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <ShiftDetailHeader
                shift={shift}
                isOpen={stats.isOpen}
                shortId={stats.shortId}
            />

            {/* ── Info Cards ────────────────────────────────────────────────── */}
            <ShiftDetailInfoCards shift={shift} />

            {/* ── Financial Summary ─────────────────────────────────────────── */}
            <ShiftDetailFinancialSummary
                initialAmt={stats.initialAmt}
                totalIncome={stats.totalIncome}
                totalExpense={stats.totalExpense}
                finalBalance={stats.finalBalance}
            />

            {/* ── Bottom Two-Column ─────────────────────────────────────────── */}
            <ShiftDetailMovementsList
                sysCash={stats.sysCash}
                sysCard={stats.sysCard}
                sysYape={stats.sysYape}
                sysPlin={stats.sysPlin}
                sysTransfer={stats.sysTransfer}
                expenseCash={stats.totalExpense} // Simplified: assuming expenses are mostly cash
                totalExpense={stats.totalExpense}
                movements={stats.movements}
                isOpen={stats.isOpen}
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
                isOpen={stats.isOpen}
                categories={categoriesWithIcons}
                globalDiff={stats.globalDiff}
                sysTotalWithInit={stats.sysTotalWithInit}
                totalReported={stats.totalReported}
            />

            {/* ── Add Movement Modal ────────────────────────────────────────── */}
            <AddMovementModal
                isOpen={isMovementModalOpen}
                onClose={() => setIsMovementModalOpen(false)}
                onSuccess={() => refetch()}
                shiftId={shift.id}
                shiftName={shift.branch?.name}
            />
        </div>
    );
}
