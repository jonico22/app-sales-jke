import { RotateCcw, AlertTriangle, Clock, XCircle, Rocket, CalendarDays } from 'lucide-react';

interface SubscriptionActionButtonsProps {
  status: string;
  isActive: boolean;
  autoRenew: boolean;
  hasPendingPayment: boolean;
  isReactivating: boolean;
  mostrarBotonRenovacion: boolean;
  endDate: string;
  onReactivate: () => void;
  onRenew: () => void;
  onCancel: () => void;
}

export function SubscriptionActionButtons({
  status,
  isActive,
  autoRenew,
  hasPendingPayment,
  isReactivating,
  mostrarBotonRenovacion,
  endDate,
  onReactivate,
  onRenew,
  onCancel
}: SubscriptionActionButtonsProps) {
  if (status === 'INACTIVE' || !isActive) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-5 border-t border-border">
        <button
          className={`flex items-center gap-2 px-6 py-2.5 border border-sky-200 text-sky-600 hover:bg-sky-50 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center whitespace-nowrap ${isReactivating ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={onReactivate}
          disabled={isReactivating}
        >
          {isReactivating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          {isReactivating ? 'Reactivando...' : 'Reactivar suscripción'}
        </button>
        <div className="text-xs text-muted-foreground italic text-center sm:text-left leading-relaxed">
          Tu suscripción ha sido cancelada o ha estado inactiva por más de 7 días. Reactívala para mantener tu información.
        </div>
      </div>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-5 border-t border-border">
        {hasPendingPayment ? (
          <button
            disabled
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center whitespace-nowrap cursor-not-allowed"
          >
            <Clock className="h-4 w-4" />
            Renovación en progreso
          </button>
        ) : (
          <button
            onClick={onRenew}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center whitespace-nowrap shadow-md animate-pulse"
          >
            <AlertTriangle className="h-4 w-4" />
            Renovar Ahora
          </button>
        )}
        <div className="text-xs text-red-500 font-medium text-center sm:text-left leading-relaxed">
          {hasPendingPayment
            ? 'Su comprobante de pago está siendo validado. Su cuenta permanecerá bloqueada hasta su aprobación.'
            : 'Su suscripción ha expirado. Por favor, realice su pago y suba el comprobante para desbloquear su cuenta.'
          }
        </div>
      </div>
    );
  }

  if (autoRenew) {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center"
        >
          <XCircle className="h-4 w-4" />
          Cancelar suscripción
        </button>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
          <span className="text-xs text-muted-foreground italic hidden sm:inline-block">Nuevos planes llegarán pronto</span>
          <button className="flex items-center gap-2 px-6 py-2 border border-border text-muted-foreground hover:bg-muted rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center" disabled>
            <Rocket className="h-4 w-4" />
            Próximamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 pt-5 border-t border-border">
      {hasPendingPayment && (
        <button
          disabled
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center whitespace-nowrap cursor-not-allowed"
        >
          <Clock className="h-4 w-4" />
          Renovación en progreso
        </button>
      )}
      {mostrarBotonRenovacion && (
        <button
          onClick={onRenew}
          className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto justify-center whitespace-nowrap"
        >
          <CalendarDays className="h-4 w-4" />
          Renovar suscripción
        </button>
      )}
      <div className="text-xs text-muted-foreground italic text-center sm:text-left leading-relaxed">
        {hasPendingPayment
          ? 'Su comprobante de pago está siendo validado por los administradores.'
          : `Su acceso continuará hasta el ${new Date(endDate).toLocaleDateString()}. Puede renovar su plan en cualquier momento para evitar interrupciones.`
        }
      </div>
    </div>
  );
}
