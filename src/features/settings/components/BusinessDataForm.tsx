import { Store, Hash, MapPin, Phone, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';

interface BusinessDataFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<{
    name: string;
    legalEntity: {
      businessName: string;
      documentNumber: string;
      fiscalAddress: string;
      phoneNumber: string;
      email: string;
    };
  }>;
}

export function BusinessDataForm({ register, errors }: BusinessDataFormProps) {
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
              {...register('name')}
              placeholder="Ej. JKE Solutions"
              className="pl-10"
            />
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Razón Social</Label>
          <div className="relative">
            <Input
              {...register('legalEntity.businessName')}
              placeholder="Ej. JKE Solutions S.A.C."
              className="pl-10"
            />
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {errors.legalEntity?.businessName && <p className="text-xs text-destructive">{errors.legalEntity.businessName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>RUC / Tax ID</Label>
          <div className="relative">
            <Input
              {...register('legalEntity.documentNumber')}
              placeholder="20601234567"
              className="pl-10"
            />
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {errors.legalEntity?.documentNumber && <p className="text-xs text-destructive">{errors.legalEntity.documentNumber.message}</p>}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Dirección Fiscal</Label>
          <div className="relative">
            <Input
              {...register('legalEntity.fiscalAddress')}
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
              {...register('legalEntity.phoneNumber')}
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
              {...register('legalEntity.email')}
              placeholder="admin@jkesolutions.com"
              className="pl-10"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {errors.legalEntity?.email && <p className="text-xs text-destructive">{errors.legalEntity.email.message}</p>}
        </div>
      </div>
    </Card>
  );
}
