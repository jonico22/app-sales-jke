import { Wallet, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from './SalesUtils';

interface CashClosingSummaryStatsProps {
    openingBalance: number;
    totalIncome: number;
    totalExpenses: number;
    expectedFinal: number;
}

export function CashClosingSummaryStats({
    openingBalance,
    totalIncome,
    totalExpenses,
    expectedFinal
}: CashClosingSummaryStatsProps) {
    return (
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
    );
}
