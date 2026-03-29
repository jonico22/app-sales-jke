import { formatCurrency } from './SalesUtils';

export interface CategoryData {
    label: string;
    income: number;
    expense: number;
    rep: number;
    icon: React.ReactNode;
    sysNet: number;
    diff: number;
}

interface ShiftDetailArqueoComparisonProps {
    isOpen: boolean;
    categories: CategoryData[];
    globalDiff: number;
    sysTotalWithInit: number;
    totalReported: number;
}

export function ShiftDetailArqueoComparison({
    isOpen,
    categories,
    globalDiff,
    sysTotalWithInit,
    totalReported
}: ShiftDetailArqueoComparisonProps) {
    if (isOpen) return null;

    return (
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
                                    {formatCurrency(cat.income)}
                                </td>
                                <td className="px-5 py-4 text-right text-[11px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                                    {cat.expense > 0 ? `-${formatCurrency(cat.expense)}` : formatCurrency(0)}
                                </td>
                                <td className="px-5 py-4 text-right text-xs font-bold text-foreground tabular-nums">
                                    {formatCurrency(cat.rep)}
                                </td>
                                <td className={`px-5 py-4 text-right text-xs font-black tabular-nums ${cat.diff >= -0.005 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                    }`}>
                                    {cat.diff > 0.005 ? '+' : cat.diff < -0.005 ? '' : ''}{formatCurrency(cat.diff)}
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
                                {cat.diff > 0.005 ? '+' : ''}{formatCurrency(cat.diff)}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col bg-muted/30 p-2 rounded-xl border border-border/40">
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">Sist. Ing.</span>
                                <span className="text-[11px] font-bold text-emerald-600 tabular-nums">{formatCurrency(cat.income)}</span>
                            </div>
                            <div className="flex flex-col bg-muted/30 p-2 rounded-xl border border-border/40">
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">Sist. Egr.</span>
                                <span className="text-[11px] font-bold text-rose-600 tabular-nums">{cat.expense > 0 ? `-${formatCurrency(cat.expense)}` : 'S/ 0.00'}</span>
                            </div>
                            <div className="flex flex-col bg-muted/30 p-2 rounded-xl border border-border/40">
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">Declarado</span>
                                <span className="text-[11px] font-black text-foreground tabular-nums">{formatCurrency(cat.rep)}</span>
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
                        <span className="text-xs font-bold text-foreground">{formatCurrency(sysTotalWithInit)}</span>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[9px] font-black text-muted-foreground uppercase">Declarado Total</span>
                        <span className="text-xs font-bold text-foreground">{formatCurrency(totalReported)}</span>
                    </div>
                    <span className={`text-base font-black tabular-nums px-4 py-2 rounded-xl border ${globalDiff >= -0.005
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}>
                        {globalDiff > 0.005 ? '+' : ''}{formatCurrency(globalDiff)}
                    </span>
                </div>
            </div>
        </div>
    );
}
