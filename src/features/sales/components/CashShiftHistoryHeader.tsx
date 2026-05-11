import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

interface CashShiftHistoryHeaderProps {
    isLoading: boolean;
    onRefresh: () => void;
    onOpenMovement: () => void;
}

export function CashShiftHistoryHeader({ isLoading, onRefresh, onOpenMovement }: CashShiftHistoryHeaderProps) {
  return (
    <PageHeader
      title="Historial de Turnos de Caja"
      subtitle="Consulte y gestione todos los turnos de apertura y cierre de caja."
      actionsClassName="flex items-center gap-2"
      actions={(
        <>
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
        </>
      )}
    />
  );
}
