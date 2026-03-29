import { RefreshCw, CreditCard } from 'lucide-react';
import { type SubscriptionBilling } from '@/services/subscription.service';

interface BillingHistoryListProps {
  billingHistory: SubscriptionBilling[];
  loading: boolean;
}

const BillingStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'COMPLETED':
      return <span className="px-1.5 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">Pagado</span>;
    case 'PENDING':
      return <span className="px-1.5 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">Pendiente</span>;
    case 'FAILED':
      return <span className="px-1.5 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">Fallido</span>;
    default:
      return <span className="px-1.5 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground border border-border">{status}</span>;
  }
};

export function BillingHistoryList({
  billingHistory,
  loading
}: BillingHistoryListProps) {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest mt-2">Cargando facturación...</span>
      </div>
    );
  }

  if (billingHistory.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center p-6 uppercase text-[10px] font-black text-muted-foreground">
        No hay cobros registrados.
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden divide-y divide-border/40">
        {billingHistory.map((billing) => (
          <div key={billing.id} className="p-4 bg-card active:bg-muted/5 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-black text-[12px] text-foreground tracking-tight uppercase leading-tight">
                  {billing.description}
                </h4>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 capitalize">
                  {new Date(billing.paymentDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-[13px] text-foreground tracking-tighter">
                  ${billing.amount.toFixed(2)}
                </p>
                <div className="mt-1">
                  <BillingStatusBadge status={billing.status} />
                </div>
              </div>
            </div>
            {billing.subscriptionMovement && (
              <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-1">
                  {billing.subscriptionMovement.newPlan?.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase">
                  <CreditCard className="h-3 w-3" />
                  {billing.paymentMethod}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-muted-foreground uppercase bg-muted/30">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider">Descripción</th>
              <th className="px-6 py-4 font-bold tracking-wider">Fecha</th>
              <th className="px-6 py-4 font-bold tracking-wider">Método</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Monto</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {billingHistory.map((billing) => (
              <tr key={billing.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-black text-foreground text-xs uppercase tracking-tight">
                  {billing.description}
                  {billing.subscriptionMovement && (
                    <span className="ml-2 text-[10px] text-muted-foreground font-bold italic">
                      ({billing.subscriptionMovement.newPlan?.name})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground text-xs font-bold capitalize">
                  {new Date(billing.paymentDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-muted/50 text-foreground border border-border">
                    <CreditCard className="h-3 w-3" />
                    {billing.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-black text-foreground text-[13px] tracking-tight">
                  ${billing.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  <BillingStatusBadge status={billing.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
