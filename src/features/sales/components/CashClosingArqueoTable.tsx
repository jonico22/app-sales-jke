import React from 'react';
import { Banknote, CreditCard, QrCode } from 'lucide-react';
import { formatCurrency } from './SalesUtils';

interface PaymentRowProps {
    icon: React.ReactNode;
    label: string;
    incomeAmount: number;
    expenseAmount: number;
    physicalAmount: string;
    onPhysicalChange: (val: string) => void;
    onBlur: () => void;
}

const PaymentRow = React.memo(({
    icon,
    label,
    incomeAmount,
    expenseAmount,
    physicalAmount,
    onPhysicalChange,
    onBlur,
}: PaymentRowProps) => {
    const systemAmount = incomeAmount - expenseAmount;
    const physical = parseFloat(physicalAmount) || 0;
    const diff = physical - systemAmount;
    const isOk = Math.abs(diff) < 0.005;

    return (
        <div className="grid grid-cols-[1.8fr_1fr_1fr_1.2fr_1.2fr] items-center gap-3 py-4 border-b border-border last:border-0">
            {/* Method */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 text-foreground/70">
                    {icon}
                </div>
                <span className="text-sm font-semibold text-foreground">{label}</span>
            </div>

            {/* Income */}
            <span className="text-right text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(incomeAmount)}
            </span>

            {/* Expense */}
            <span className="text-right text-[11px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {formatCurrency(expenseAmount)}
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
                    className="w-24 h-9 px-3 text-right text-xs font-bold bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                    placeholder="0.00"
                />
            </div>

            {/* Difference badge */}
            <div className="flex justify-end">
                {isOk ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tabular-nums">
                        S/ 0.00
                    </span>
                ) : (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black tabular-nums ${diff > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                        {diff > 0 ? '+' : '-'} S/ {Math.abs(diff).toFixed(2)}
                    </span>
                )}
            </div>
        </div>
    );
});
PaymentRow.displayName = 'PaymentRow';

// Main component props
interface CashClosingArqueoTableProps {
    openingBalance: number;
    totalIncome: number;
    totalExpenses: number;
    physTotal: number;
    diffTotal: number;
    cashSystem: { inc: number; exp: number };
    cardSystem: { inc: number; exp: number };
    yapeSystem: { inc: number; exp: number };
    plinSystem: { inc: number; exp: number };
    physicalData: {
        cash: string; setCash: (v: string) => void;
        card: string; setCard: (v: string) => void;
        yape: string; setYape: (v: string) => void;
        plin: string; setPlin: (v: string) => void;
    };
}

export function CashClosingArqueoTable({
    openingBalance,
    totalIncome,
    totalExpenses,
    physTotal,
    diffTotal,
    cashSystem,
    cardSystem,
    yapeSystem,
    plinSystem,
    physicalData
}: CashClosingArqueoTableProps) {
    const { cash, setCash, card, setCard, yape, setYape, plin, setPlin } = physicalData;

    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-black text-foreground uppercase tracking-tight">
                    Arqueo por Medio de Pago
                </h2>
            </div>

            <div className="px-5">
                {/* Column headers */}
                <div className="grid grid-cols-[1.8fr_1fr_1fr_1.2fr_1.2fr] gap-3 py-3 border-b border-border bg-muted/10 px-5 -mx-5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Medio de Pago</span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Ingresos Sist.</span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Egresos Sist.</span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Declarado</span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-right">Diferencia</span>
                </div>

                {/* Rows */}
                <PaymentRow
                    icon={<Banknote className="w-4 h-4" />}
                    label="Efectivo"
                    incomeAmount={openingBalance + cashSystem.inc}
                    expenseAmount={cashSystem.exp}
                    physicalAmount={cash}
                    onPhysicalChange={setCash}
                    onBlur={() => {
                        const n = parseFloat(cash);
                        if (!isNaN(n)) setCash(n.toFixed(2));
                    }}
                />

                <PaymentRow
                    icon={<CreditCard className="w-4 h-4" />}
                    label="Tarjeta"
                    incomeAmount={cardSystem.inc}
                    expenseAmount={cardSystem.exp}
                    physicalAmount={card}
                    onPhysicalChange={setCard}
                    onBlur={() => {
                        const n = parseFloat(card);
                        if (!isNaN(n)) setCard(n.toFixed(2));
                    }}
                />

                <PaymentRow
                    icon={<QrCode className="w-4 h-4" />}
                    label="Yape"
                    incomeAmount={yapeSystem.inc}
                    expenseAmount={yapeSystem.exp}
                    physicalAmount={yape}
                    onPhysicalChange={setYape}
                    onBlur={() => {
                        const n = parseFloat(yape);
                        if (!isNaN(n)) setYape(n.toFixed(2));
                    }}
                />

                <PaymentRow
                    icon={<QrCode className="w-4 h-4" />}
                    label="Plin"
                    incomeAmount={plinSystem.inc}
                    expenseAmount={plinSystem.exp}
                    physicalAmount={plin}
                    onPhysicalChange={setPlin}
                    onBlur={() => {
                        const n = parseFloat(plin);
                        if (!isNaN(n)) setPlin(n.toFixed(2));
                    }}
                />
            </div>

            {/* Totals row */}
            <div className="px-5 py-5 border-t border-border bg-muted/30">
                <div className="grid grid-cols-[1.8fr_1fr_1fr_1.2fr_1.2fr] gap-3 items-center">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-foreground uppercase tracking-tight">Diferencia Total</span>
                        <span className="text-[9px] text-muted-foreground font-medium">Reportado - (Sistema + Inicial)</span>
                    </div>
                    <span className="text-xs font-black text-emerald-600 text-right tabular-nums">
                        {formatCurrency(openingBalance + totalIncome)}
                    </span>
                    <span className="text-xs font-black text-rose-600 text-right tabular-nums">
                        {formatCurrency(totalExpenses)}
                    </span>
                    <span className="text-sm font-black text-foreground text-right tabular-nums">
                        {formatCurrency(physTotal)}
                    </span>
                    <div className="flex justify-end">
                        {Math.abs(diffTotal) < 0.005 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black tabular-nums border border-emerald-500/20">
                                S/ 0.00
                            </span>
                        ) : (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black tabular-nums border ${diffTotal > 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                                {diffTotal > 0 ? '+' : '-'} S/ {Math.abs(diffTotal).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
