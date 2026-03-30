import { Store, Hash, MapPin, Phone, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';

interface BusinessDataFormProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}

export function BusinessDataForm<T extends FieldValues>({ register, errors }: BusinessDataFormProps<T>) {
  // Helper to safely get error messages from nested or top-level fields without using 'any'
  const getErrorMessage = (fieldName: string) => {
    const keys = fieldName.split('.');
    let current: unknown = errors;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        current = undefined;
        break;
      }
    }

    if (current && typeof current === 'object' && 'message' in current) {
      const msg = (current as { message?: unknown }).message;
      return typeof msg === 'string' ? msg : null;
    }
    return null;
  };

  return (
    <Card className="p-6 border-border">
      <h2 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-tight">
        Datos del Negocio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Nombre Comercial</Label>
          <div className="relative">
            <Input
              {...register('name' as Path<T>)}
              placeholder="Ej. JKE Solutions"
              className="pl-10"
            />
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {getErrorMessage('name') && (
            <p className="text-xs text-destructive">
              {getErrorMessage('name')}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Razón Social</Label>
          <div className="relative">
            <Input
              {...register('legalEntity.businessName' as Path<T>)}
              placeholder="Ej. JKE Solutions S.A.C."
              className="pl-10"
            />
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {getErrorMessage('legalEntity.businessName') && (
            <p className="text-xs text-destructive">
              {getErrorMessage('legalEntity.businessName')}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>RUC / Tax ID</Label>
          <div className="relative">
            <Input
              {...register('legalEntity.documentNumber' as Path<T>)}
              placeholder="20601234567"
              className="pl-10"
            />
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {getErrorMessage('legalEntity.documentNumber') && (
            <p className="text-xs text-destructive">
              {getErrorMessage('legalEntity.documentNumber')}
            </p>
          )}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Dirección Fiscal</Label>
          <div className="relative">
            <Input
              {...register('legalEntity.fiscalAddress' as Path<T>)}
              placeholder="Ej. Av. Javier Prado Este 1234, Lima"
              className="pl-10"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Teléfono de Contacto</Label>
          <div className="relative">
            <Input
              {...register('legalEntity.phoneNumber' as Path<T>)}
              placeholder="+51 999 999 999"
              className="pl-10"
            />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Email del Negocio</Label>
          <div className="relative">
            <Input
              {...register('legalEntity.email' as Path<T>)}
              placeholder="admin@jkesolutions.com"
              className="pl-10"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {getErrorMessage('legalEntity.email') && (
            <p className="text-xs text-destructive">
              {getErrorMessage('legalEntity.email')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
