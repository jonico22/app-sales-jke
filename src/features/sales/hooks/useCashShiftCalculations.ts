import { useMemo } from 'react';
import { MovementType, ShiftStatus, type CashShiftDetail, type CashShiftMovement } from '@/services/cash-shift.service';

export interface CashShiftCalculations {
    isOpen: boolean;
    shortId: string;
    movements: CashShiftMovement[];
    sysCash: number;
    sysCard: number;
    sysYape: number;
    sysPlin: number;
    sysTransfer: number;
    totalIncome: number;
    totalExpense: number;
    initialAmt: number;
    sysTotalWithInit: number;
    finalBalance: number;
    categories: any[];
    totalReported: number;
    globalDiff: number;
}

export function useCashShiftCalculations(shift: CashShiftDetail | null | undefined): CashShiftCalculations | null {
    return useMemo(() => {
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
                method: 'CASH'
            },
            {
                label: 'Tarjeta',
                income: sysCard,
                expense: 0,
                rep: s.reportedCardAmount,
                method: 'CARD'
            },
            {
                label: 'Yape',
                income: sysYape,
                expense: 0,
                rep: s.reportedYapeAmount,
                method: 'YAPE'
            },
            {
                label: 'Plin',
                income: sysPlin,
                expense: 0,
                rep: s.reportedPlinAmount,
                method: 'PLIN'
            },
            {
                label: 'Transferencia',
                income: sysTransfer,
                expense: 0,
                rep: s.reportedTransferAmount,
                method: 'TRANSFER'
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

        return {
            isOpen,
            shortId,
            movements,
            sysCash,
            sysCard,
            sysYape,
            sysPlin,
            sysTransfer,
            totalIncome,
            totalExpense,
            initialAmt,
            sysTotalWithInit,
            finalBalance,
            categories,
            totalReported,
            globalDiff
        };
    }, [shift]);
}
