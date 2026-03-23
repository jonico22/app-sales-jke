import { LogOut, Info } from 'lucide-react';
import { Button } from '@/components/ui';

interface CashClosingBannerProps {
    branchName?: string;
    onCloseCash?: () => void;
    isLoading?: boolean;
}

export function CashClosingBanner({ branchName, onCloseCash, isLoading }: CashClosingBannerProps) {
    if (isLoading) {
        return (
            <div className="h-[62px] w-full rounded-2xl bg-muted/30 animate-pulse border border-border/50 flex items-center px-6">
                <div className="flex items-center gap-4 w-full">
                    <div className="w-9 h-9 rounded-lg bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded w-1/4" />
                        <div className="h-2 bg-muted rounded w-1/2" />
                    </div>
                    <div className="w-24 h-9 rounded-lg bg-muted" />
                </div>
            </div>
        );
    }

    return (
        <div className="relative group overflow-hidden rounded-2xl bg-rose-50 dark:bg-rose-500/10 shadow-sm border border-rose-100/50 dark:border-rose-500/20">

            <div className="relative px-6 py-3 flex flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    {/* Icon Container - Warning Red */}
                    <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
                        <Info className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
                    </div>

                    {/* Text Content - Horizontal & Inline */}
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                        <h2 className="text-[13px] font-black text-rose-900 dark:text-rose-100 uppercase tracking-tight leading-none">
                            Turno Activo en {branchName || 'Sucursal'}
                        </h2>
                        <div className="hidden md:block w-1 h-1 rounded-full bg-rose-300 dark:bg-rose-500/40" />
                        <p className="text-rose-700/70 dark:text-rose-300/60 text-[10px] font-bold uppercase tracking-wider">
                            No olvides realizar el cierre de caja al finalizar tus operaciones.
                        </p>
                    </div>
                </div>

                {/* Action Button - Extreme Red Style */}
                <Button
                    onClick={onCloseCash}
                    className="h-9 px-5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] group/btn border-none"
                >
                    <LogOut className="w-3.5 h-3.5 group-hover/btn:-translate-x-0.5 transition-transform" />
                    Cerrar Caja
                </Button>
            </div>
        </div>
    );
}
