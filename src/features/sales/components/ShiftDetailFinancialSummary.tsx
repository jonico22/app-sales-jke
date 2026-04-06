import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from './SalesUtils';

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

interface ShiftDetailFinancialSummaryProps {
    initialAmt: number;
    totalIncome: number;
    totalExpense: number;
    finalBalance: number;
}

export function ShiftDetailFinancialSummary({
    initialAmt,
    totalIncome,
    totalExpense,
    finalBalance
}: ShiftDetailFinancialSummaryProps) {
    return (
        <div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-tight mb-2 md:mb-3">
                Resumen Financiero
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                <StatCard
                    label="Monto Inicial"
                    value={formatCurrency(initialAmt)}
                    icon={<Wallet size={12} />}
                    variant="default"
                />
                <StatCard
                    label="Ingresos Totales"
                    value={formatCurrency(totalIncome)}
                    icon={<TrendingUp size={12} />}
                    variant="income"
                />
                <StatCard
                    label="Egresos Totales"
                    value={`-${formatCurrency(totalExpense)}`}
                    icon={<TrendingDown size={12} />}
                    variant="expense"
                />
                <StatCard
                    label="Balance Final"
                    value={formatCurrency(finalBalance)}
                    icon={<Wallet size={12} />}
                    variant="primary"
                />
            </div>
        </div>
    );
}
