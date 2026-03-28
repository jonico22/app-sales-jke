import { Card } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export function PaymentMethodCard() {
  return (
    <Card className="border-border shadow-sm flex flex-col overflow-hidden h-fit">
      <div className="p-6 pb-3 border-b border-border">
        <h3 className="text-sm font-bold text-foreground tracking-tight uppercase">Método de Pago</h3>
      </div>
      <div className="p-6">
        <div className="w-full border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground">
            <CreditCard className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-foreground text-[11px] uppercase tracking-wider">Sin pagos requeridos</h3>
            <p className="text-[11px] text-muted-foreground max-w-[180px] leading-relaxed italic">
              Disfruta de la plataforma sin cargos durante la fase beta pública.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
