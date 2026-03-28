import { RefreshCw } from 'lucide-react';

interface AutoRenewPanelProps {
  autoRenew: boolean;
  isActive: boolean;
  isFree: boolean;
  updatingRenew: boolean;
  onToggle: () => void;
}

export function AutoRenewPanel({
  autoRenew,
  isActive,
  isFree,
  updatingRenew,
  onToggle
}: AutoRenewPanelProps) {
  return (
    <div className="bg-muted/20 rounded-xl p-4 flex items-center justify-between border border-border">
      <div className="flex gap-4 items-center">
        <div className="p-2 bg-card rounded-lg shadow-sm border border-border text-muted-foreground">
          <RefreshCw className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-tight">Renovación automática</h3>
          <p className="text-[10px] text-muted-foreground mt-1 max-w-[90%]">
            {!isActive
              ? 'Desactivada tras la cancelación'
              : (autoRenew
                ? (isFree ? 'Renueva automáticamente tu acceso gratuito mes a mes' : 'Tu tarjeta será cargada al final del ciclo')
                : 'Cobro automático desactivado. Deberá renovar manualmente al finalizar el periodo.'
              )
            }
          </p>
        </div>
      </div>
      {/* Custom Toggle Switch */}
      <label className={`relative inline-flex items-center ${updatingRenew || !isActive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          className="sr-only peer"
          checked={autoRenew && isActive}
          onChange={onToggle}
          disabled={updatingRenew || !isActive}
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
      </label>
    </div>
  );
}
