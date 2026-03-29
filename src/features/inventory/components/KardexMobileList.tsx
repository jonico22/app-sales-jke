import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Package, ArrowRightLeft } from 'lucide-react';
import type { KardexTransaction } from '@/services/kardex.service';
import { KardexMovementBadge } from './KardexMovementBadge';

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
                                <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Producto</p>
                                <h3 className="text-[12px] font-black text-foreground uppercase tracking-tight leading-tight">
                                    {t.product?.name}
                                </h3>
                                <p className="text-[9px] font-bold text-muted-foreground/60">{t.product?.code}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Cantidad</p>
                            <span className={`text-[16px] font-black tracking-tighter ${
                                t.quantity > 0 ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                                {t.quantity > 0 ? '+' : ''}{t.quantity}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
                        <div>
                            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1.5">Operación</p>
                            <KardexMovementBadge type={t.type} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1.5">Balance</p>
                            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-2 py-1.5 w-fit">
                                <span className="text-[10px] font-bold text-muted-foreground/60">{t.previousStock}</span>
                                <ArrowRightLeft className="w-2.5 h-2.5 text-muted-foreground/30" />
                                <span className="text-[11px] font-black text-foreground">{t.newStock}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/30 bg-muted/5 -mx-4 -mb-4 px-4 py-3 rounded-b-2xl">
                        <div className="flex items-center gap-2 text-muted-foreground/70">
                            <Clock size={12} className="opacity-50" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">
                                {format(new Date(t.date), 'dd MMM, hh:mm a', { locale: es })}
                            </span>
                        </div>
                        <div className="text-[10px] font-black text-foreground uppercase tracking-widest opacity-60">
                            {t.documentNumber || '-'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
