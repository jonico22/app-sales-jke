import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Package, ArrowRightLeft } from 'lucide-react';
import type { KardexTransaction } from '@/services/kardex.service';
import { KardexMovementBadge } from './KardexMovementBadge';
import { cn } from '@/lib/utils';
import {
    dataTableCellCodeClassName,
    dataTableCellNumericClassName,
    dataTableCellPrimaryClassName,
    dataTableCellSecondaryClassName
} from '@/components/shared/dataTableStyles';

interface KardexMobileListProps {
    transactions: KardexTransaction[];
}

export function KardexMobileList({ transactions }: KardexMobileListProps) {
    return (
        <div className="lg:hidden p-3 space-y-3">
            {transactions.map((t) => (
                <div key={t.id} className="bg-muted/10 rounded-2xl border border-border/50 p-4 space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 shadow-sm">
                                <Package size={18} className="text-primary/60" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-semibold text-muted-foreground/50 uppercase tracking-[0.08em]">Producto</p>
                                <h3 className={cn(dataTableCellPrimaryClassName, 'text-[12px] leading-tight')}>
                                    {t.product?.name}
                                </h3>
                                <p className={cn(dataTableCellCodeClassName, 'text-[9px]')}>{t.product?.code}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-semibold text-muted-foreground/50 uppercase tracking-[0.08em]">Cantidad</p>
                            <span className={cn(
                                'text-[16px] tracking-tight',
                                dataTableCellNumericClassName,
                                t.quantity > 0 ? 'text-emerald-500' : 'text-rose-500'
                            )}>
                                {t.quantity > 0 ? '+' : ''}{t.quantity}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
                        <div>
                            <p className="text-[8px] font-semibold text-muted-foreground/50 uppercase tracking-[0.08em] mb-1.5">Operación</p>
                            <KardexMovementBadge type={t.type} />
                        </div>
                        <div>
                            <p className="text-[8px] font-semibold text-muted-foreground/50 uppercase tracking-[0.08em] mb-1.5">Balance</p>
                            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-2 py-1.5 w-fit">
                                <span className={dataTableCellSecondaryClassName}>{t.previousStock}</span>
                                <ArrowRightLeft className="w-2.5 h-2.5 text-muted-foreground/30" />
                                <span className={dataTableCellNumericClassName}>{t.newStock}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/30 bg-muted/5 -mx-4 -mb-4 px-4 py-3 rounded-b-2xl">
                        <div className="flex items-center gap-2 text-muted-foreground/70">
                            <Clock size={12} className="opacity-50" />
                            <span className={dataTableCellSecondaryClassName}>
                                {format(new Date(t.date), 'dd MMM, hh:mm a', { locale: es })}
                            </span>
                        </div>
                        <div className={cn(dataTableCellCodeClassName, 'opacity-60')}>
                            {t.documentNumber || '-'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
