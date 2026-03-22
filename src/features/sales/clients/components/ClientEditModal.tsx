import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button, Input, Label, Textarea, Switch } from '@/components/ui';
import { ChevronDown, Save, User as UserIcon, Building2 } from 'lucide-react';
import { clientService, type Client } from '@/services/client.service';
import { useSocietyStore } from '@/store/society.store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Schema Definition
const clientSchema = z.object({
  typeBP: z.enum(['PERSON', 'LEGAL_ENTITY']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  documentNumber: z.string().min(1, 'El número de documento es obligatorio'),
  documentType: z.string().min(1, 'El tipo de documento es obligatorio'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  societyId: z.string().optional(),
  isActive: z.boolean(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSave: () => void;
  onSuccess?: (client: Client) => void;
}

export function ClientEditModal({
  open,
  onOpenChange,
  client,
  onSave,
  onSuccess,
}: ClientEditModalProps) {
  const society = useSocietyStore(state => state.society);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      typeBP: 'PERSON',
      firstName: '',
      lastName: '',
      companyName: '',
      documentNumber: '',
      documentType: 'DNI',
      email: '',
      phone: '',
      address: '',
      isActive: true,
      societyId: society?.id || '',
    },
  });

  const typeBP = watch('typeBP');
  const isActive = watch('isActive');

  // Populate form when client changes
  useEffect(() => {
    if (client) {
      reset({
        typeBP: (client.typeBP as any) || 'PERSON',
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        companyName: client.companyName || '',
        documentNumber: client.documentNumber || '',
        documentType: client.documentType || 'DNI',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        societyId: client.societyId || society?.id || '',
        isActive: client.isActive,
      });
    } else {
      reset({
        typeBP: 'PERSON',
        firstName: '',
        lastName: '',
        companyName: '',
        documentNumber: '',
        documentType: 'DNI',
        email: '',
        phone: '',
        address: '',
        societyId: society?.id || '',
        isActive: true,
      });
    }
  }, [client, reset, open]);

  const onSubmit = async (data: ClientFormValues) => {
    try {
      const payload = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        // Validation of conditional fields
        firstName: data.typeBP === 'PERSON' ? data.firstName : undefined,
        lastName: data.typeBP === 'PERSON' ? data.lastName : undefined,
        companyName: data.typeBP === 'LEGAL_ENTITY' ? data.companyName : undefined,
      };

      if (client) {
        const response = await clientService.update(client.id, payload);
        toast.success('Cliente actualizado exitosamente');
        onSuccess?.(response.data);
      } else {
        const response = await clientService.create(payload as any);
        toast.success('Cliente creado exitosamente');
        onSuccess?.(response.data);
      }

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el cliente');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-card border-border shadow-2xl">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground uppercase tracking-tight">
              {client ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 pt-2">
          {/* BP Type Selector */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tipo de Cliente</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setValue('typeBP', 'PERSON')}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                  typeBP === 'PERSON' ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <UserIcon className="h-3.5 w-3.5" /> Persona
              </button>
              <button
                type="button"
                onClick={() => setValue('typeBP', 'LEGAL_ENTITY')}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                  typeBP === 'LEGAL_ENTITY' ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <Building2 className="h-3.5 w-3.5" /> Empresa / RUC
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="documentType" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tipo Documento</Label>
              <div className="relative">
                <select
                  id="documentType"
                  {...register('documentType')}
                  className="w-full h-10 px-3 py-2 text-xs rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-foreground transition-all h-10"
                >
                  <option value="DNI">DNI (Persona)</option>
                  <option value="RUC">RUC (Empresa/Persona)</option>
                  <option value="PASSPORT">PASAPORTE</option>
                  <option value="CE">C.E.</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Document Number */}
            <div className="space-y-2">
              <Label htmlFor="documentNumber" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Número Documento</Label>
              <Input
                id="documentNumber"
                placeholder="Ej. 12345678"
                {...register('documentNumber')}
                className={errors.documentNumber ? "border-destructive bg-destructive/10 h-10 text-xs" : "bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"}
              />
              {errors.documentNumber && <span className="text-[10px] font-medium text-destructive">{errors.documentNumber.message}</span>}
            </div>

            {/* Conditional Name Fields */}
            {typeBP === 'PERSON' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nombres</Label>
                  <Input
                    id="firstName"
                    placeholder="Ej. Juan Carlos"
                    {...register('firstName')}
                    className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Apellidos</Label>
                  <Input
                    id="lastName"
                    placeholder="Ej. Pérez García"
                    {...register('lastName')}
                    className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                  />
                </div>
              </>
            ) : (
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="companyName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Razón Social</Label>
                <Input
                  id="companyName"
                  placeholder="Ej. Empresa de Transportes S.A.C."
                  {...register('companyName')}
                  className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                {...register('email')}
                className={errors.email ? "border-destructive bg-destructive/10 h-10 text-xs" : "bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"}
              />
              {errors.email && <span className="text-[10px] font-medium text-destructive">{errors.email.message}</span>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Teléfono / Celular</Label>
              <Input
                id="phone"
                placeholder="Ej. 987654321"
                {...register('phone')}
                className="bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dirección</Label>
              <Textarea
                id="address"
                placeholder="Dirección completa del cliente..."
                {...register('address')}
                className="bg-muted/30 border-border min-h-[60px] text-xs resize-none focus:bg-background transition-colors p-3 leading-relaxed"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <Label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Estado del Cliente</Label>
              <p className="text-[10px] text-muted-foreground font-medium">Habilitar para transacciones comerciales</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={isActive}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue('isActive', e.target.checked)}
              />
              <span className="text-xs font-semibold text-foreground uppercase tracking-tighter">
                {isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground font-bold text-[10px] uppercase tracking-wider h-10 px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-10 px-8 font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Guardando...' : (client ? 'Guardar Cambios' : 'Crear Cliente')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
