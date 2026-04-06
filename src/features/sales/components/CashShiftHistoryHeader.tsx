import { RefreshCw } from 'lucide-react';

interface CashShiftHistoryHeaderProps {
    isLoading: boolean;
    onRefresh: () => void;
    onOpenMovement: () => void;
}

export function CashShiftHistoryHeader({ isLoading, onRefresh, onOpenMovement }: CashShiftHistoryHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">
                    Historial de Turnos de Caja
                </h1>
                <p className="text-muted-foreground text-[10px] mt-0.5 font-medium">
                    Consulte y gestione todos los turnos de apertura y cierre de caja.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-foreground hover:bg-muted shadow-sm transition-all text-[11px] font-bold uppercase tracking-wider active:scale-95 disabled:opacity-60"
                >
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
                <button
                    onClick={onOpenMovement}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl shadow-sm shadow-primary/20 transition-all text-[11px] font-bold uppercase tracking-wider hover:bg-primary/90 active:scale-95"
                >
                    <span className="text-base leading-none">+</span>
                    Registrar Movimiento
                </button>
            </div>
        </div>
    );
}
