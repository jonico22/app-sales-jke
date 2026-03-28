import { Card } from '@/components/ui/card';
import { type SubscriptionDetails } from '@/services/subscription.service';

interface PlanDetailsCardProps {
  subscription: SubscriptionDetails;
  isBeta: boolean;
  isFree: boolean;
  children: React.ReactNode;
}

export function PlanDetailsCard({
  subscription,
  isBeta,
  isFree,
  children
}: PlanDetailsCardProps) {
  return (
    <Card className="border-border shadow-sm h-full overflow-hidden">
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-start">
          <h2 className="text-sm font-bold text-foreground tracking-tight uppercase">Plan Actual</h2>
          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
            {subscription.plan.name} {isBeta && '(PUBLIC PREVIEW)'}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Costo Mensual</span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-foreground">
                {isFree ? 'Gratis' : `$${subscription.plan.price} `}
              </span>
              {isBeta && (
                <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs font-semibold">
                  Precio Beta
                </span>
              )}
            </div>
            {isBeta && (
              <p className="text-xs text-slate-500 mt-2">
                Costo por definir tras el lanzamiento comercial.
              </p>
            )}
          </div>

          <div className="space-y-1 md:text-right">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Estado</span>
            {!subscription.isActive || subscription.status === 'INACTIVE' ? (
              <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100 font-medium text-sm">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                Acceso disponible hasta el {new Date(subscription.endDate).toLocaleDateString()}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 font-medium text-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {isBeta ? 'Fase Beta Activa' : 'Activa'}
              </div>
            )}
          </div>
        </div>
        
        {children}
      </div>
    </Card>
  );
}
