import { Coins, Percent, Clock, HardDrive } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UseFormRegister } from 'react-hook-form';
import { type CurrencySelectOption } from '@/services/currency.service';

interface SystemPreferencesProps {
  register: UseFormRegister<any>;
  currencies: CurrencySelectOption[];
  storageLimit?: string;
}

export function SystemPreferences({
  register,
  currencies,
  storageLimit
}: SystemPreferencesProps) {
  return (
    <Card className="p-6 border-border">
      <h2 className="text-sm font-bold text-foreground mb-6 uppercase tracking-tight">Preferencias del Sistema</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-slate-400" />
            Moneda Principal
          </Label>
          <select
            {...register('mainCurrencyId')}
            className="w-full h-10 px-3 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
          >
            <option value="">Seleccionar moneda</option>
            {currencies.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground">Moneda base para reportes e inventario.</p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-slate-400" />
            Porcentaje de Impuestos (IGV)
          </Label>
          <div className="relative">
            <Input
              type="number"
              {...register('taxValue', { valueAsNumber: true })}
              className="pr-10"
            />
            <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center bg-muted/50 border-l border-border rounded-r-lg text-muted-foreground text-sm">
              %
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-col gap-8">
          {/* Alertas de Stock Bajo */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-foreground font-bold text-[11px] uppercase">Alertas de Stock Bajo</Label>
              <p className="text-[10px] text-muted-foreground">Recibir notificaciones cuando el inventario llegue al mínimo.</p>
            </div>
            <div className="space-y-2 pl-0">
              <Label className="text-[10px] text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" /> Frecuencia de Alerta
              </Label>
              <select
                {...register('stockNotificationFrequency')}
                className="w-full h-9 px-3 py-1 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                <option value="DAILY">Diario</option>
                <option value="WEEKLY">Semanal</option>
                <option value="MONTHLY">Mensual</option>
                <option value="NEVER">Nunca</option>
              </select>
            </div>
          </div>

          {/* Alertas de Ventas Realizadas */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-foreground font-bold text-[11px] uppercase">Alertas de Ventas Realizadas</Label>
              <p className="text-[10px] text-muted-foreground">Recibir una notificación cada vez que se complete una transacción.</p>
            </div>
            <div className="space-y-2 pl-0">
              <Label className="text-[10px] text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" /> Frecuencia de Alerta
              </Label>
              <select
                {...register('salesNotificationFrequency')}
                className="w-full h-9 px-3 py-1 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                <option value="DAILY">Diario</option>
                <option value="WEEKLY">Semanal</option>
                <option value="MONTHLY">Mensual</option>
                <option value="NEVER">Nunca</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <Label className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-muted-foreground/50" />
            Capacidad de Almacenamiento
          </Label>
          <div className="p-3 bg-muted/20 rounded-lg border border-border">
            <p className="text-sm font-bold text-foreground">
              {storageLimit ?
                `${(parseInt(storageLimit) / (1024 * 1024)).toFixed(0)} MB` :
                'No definido'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Límite total de archivos permitido para tu suscripción.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
