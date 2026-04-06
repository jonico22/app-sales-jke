import { RefreshCw } from 'lucide-react';
import { type SubscriptionMovement } from '@/services/subscription.service';

interface SubscriptionHistoryListProps {
  history: SubscriptionMovement[];
  loading: boolean;
}

const MovementTypeBadge = ({ type }: { type: string }) => {
  switch (type) {
    case 'SUBSCRIBED':
      return <span className="px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">Suscrito</span>;
    case 'RENEWAL':
      return <span className="px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">Renovación</span>;
    case 'REACTIVATED':
      return <span className="px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100">Reactivado</span>;
    case 'CANCELED':
      return <span className="px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">Cancelado</span>;
    case 'UPGRADE':
      return <span className="px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">Upgrade</span>;
    case 'DOWNGRADE':
      return <span className="px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-100">Downgrade</span>;
    default:
      return <span className="px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground border border-border">{type}</span>;
  }
};

export function SubscriptionHistoryList({
  history,
  loading
}: SubscriptionHistoryListProps) {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest mt-2">Cargando historial...</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center p-6 uppercase text-[10px] font-black text-muted-foreground">
        No hay movimientos registrados.
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden divide-y divide-border/40">
        {history.map((movement) => (
          <div key={movement.id} className="p-4 bg-card active:bg-muted/5 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-black text-[13px] text-foreground tracking-tight uppercase leading-tight">
                  {movement.newPlan?.name || 'Desconocido'} {movement.newPlan?.code === 'PRO' && '(Public Preview)'}
                </h4>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 lowercase first-letter:uppercase">
                  {new Date(movement.movementDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  {movement.newEndDate && ` - ${new Date(movement.newEndDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`}
                </p>
              </div>
              <div className="shrink-0 flex items-center justify-end">
                <MovementTypeBadge type={movement.movementType} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-muted-foreground uppercase bg-muted/30">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider">Plan</th>
              <th className="px-6 py-4 font-bold tracking-wider">Fecha de Inicio</th>
              <th className="px-6 py-4 font-bold tracking-wider">Fecha de Fin</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {history.map((movement) => (
              <tr key={movement.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-black text-foreground text-xs uppercase tracking-tight">
                  {movement.newPlan?.name || 'Desconocido'} {movement.newPlan?.code === 'PRO' && '(Public Preview)'}
                </td>
                <td className="px-6 py-4 text-muted-foreground text-xs font-bold capitalize">
                  {new Date(movement.movementDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-muted-foreground text-xs font-bold">
                  {movement.newEndDate ? new Date(movement.newEndDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <MovementTypeBadge type={movement.movementType} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
