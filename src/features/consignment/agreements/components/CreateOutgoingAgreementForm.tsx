import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, Coins, Building2, Percent, Save, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { clientService, type ClientSelectOption } from '@/services/client.service';
import { branchOfficeService, type BranchOfficeSelectOption } from '@/services/branch-office.service';
import { currencyService, type CurrencySelectOption } from '@/services/currency.service';
import {
  outgoingConsignmentAgreementService,
  type OutgoingConsignmentAgreement,
} from '@/services/outgoing-consignment-agreement.service';
import { useSocietyStore } from '@/store/society.store';
import { useBranchStore } from '@/store/branch.store';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { generateSku } from '@/lib/utils';
import { OutgoingConsignmentAgreementStatus } from '@/services/outgoing-consignment-agreement.service';
import { useUpdateOutgoingConsignmentAgreement } from '../../hooks/useConsignmentQueries';

const agreementSchema = z.object({
  branchId: z.string().min(1, { message: 'La sucursal es obligatoria' }),
  partnerId: z.string().min(1, { message: 'El consignatario es obligatorio' }),
  startDate: z.string().min(1, { message: 'La fecha de inicio es obligatoria' }),
  endDate: z.string().min(1, { message: 'La fecha de fin es obligatoria' }),
  commissionRate: z.coerce
    .number()
    .min(0, { message: 'La comisión debe ser mayor o igual a 0' })
    .max(1, { message: 'La comisión debe ser menor o igual a 1' }),
  currencyId: z.string().min(1, { message: 'La moneda es obligatoria' }),
  notes: z.string().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'La fecha de fin no puede ser menor que la fecha de inicio',
  path: ['endDate'],
});

type AgreementFormValues = z.output<typeof agreementSchema>;

const inputClassName = 'bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors';
const selectClassName = 'w-full h-10 px-3 py-2 text-xs rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors';
const labelClassName = 'text-[10px] font-bold text-muted-foreground uppercase tracking-wider';
const LEGACY_PLACEHOLDER_ID = '1';

function resolveSelectValue<T extends { id: string; code?: string }>(
  options: T[],
  ...preferredIds: Array<string | undefined | null>
) {
  const validOptionIds = new Set(options.map((option) => option.id));
  const preferredId = preferredIds.find((candidate) => {
    return Boolean(candidate && candidate !== LEGACY_PLACEHOLDER_ID && validOptionIds.has(candidate));
  });

  if (preferredId) {
    return preferredId;
  }

  const penCurrency = options.find((option) => option.code === 'PEN');
  return penCurrency?.id || options[0]?.id || '';
}

interface CreateOutgoingAgreementFormProps {
  mode?: 'create' | 'edit';
  agreement?: OutgoingConsignmentAgreement;
  onCancel: () => void;
  onSuccess: () => void;
}

export function CreateOutgoingAgreementForm({
  mode = 'create',
  agreement,
  onCancel,
  onSuccess,
}: CreateOutgoingAgreementFormProps) {
  const society = useSocietyStore((state) => state.society);
  const { branches: storedBranches, selectedBranch, setBranches } = useBranchStore();
  const cartBranchId = useCartStore((state) => state.branchId);
  const cartCurrencyId = useCartStore((state) => state.currencyId);
  const selectedClient = useCartStore((state) => state.selectedClient);
  const user = useAuthStore((state) => state.user);

  const [branches, setLocalBranches] = useState<BranchOfficeSelectOption[]>(storedBranches);
  const [partners, setPartners] = useState<ClientSelectOption[]>([]);
  const [currencies, setCurrencies] = useState<CurrencySelectOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateMutation = useUpdateOutgoingConsignmentAgreement();

  const defaultBranchId = resolveSelectValue(branches, selectedBranch?.id, cartBranchId);
  const defaultCurrencyId = resolveSelectValue(currencies, cartCurrencyId, society?.mainCurrency?.id);
  const defaultPartnerId = selectedClient?.id && selectedClient.id !== 'public' ? selectedClient.id : '';

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AgreementFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(agreementSchema) as any,
    defaultValues: {
      branchId: defaultBranchId,
      partnerId: defaultPartnerId,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      commissionRate: 0.15,
      currencyId: defaultCurrencyId,
      notes: '',
    },
  });

  useEffect(() => {
    reset((currentValues) => ({
      ...currentValues,
      branchId: resolveSelectValue(branches, currentValues.branchId, defaultBranchId),
      partnerId: currentValues.partnerId || defaultPartnerId,
      currencyId: resolveSelectValue(currencies, currentValues.currencyId, defaultCurrencyId),
    }));
  }, [branches, currencies, defaultBranchId, defaultCurrencyId, defaultPartnerId, reset]);

  useEffect(() => {
    if (!agreement) return;

    reset({
      branchId: agreement.branchId || '',
      partnerId: agreement.partnerId || '',
      startDate: agreement.startDate?.slice(0, 10) || '',
      endDate: agreement.endDate?.slice(0, 10) || '',
      commissionRate: Number(agreement.commissionRate ?? 0),
      currencyId: agreement.currencyId || '',
      notes: agreement.notes || '',
    });
  }, [agreement, reset]);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        setIsOptionsLoading(true);
        const [branchResponse, partnerResponse, currencyResponse] = await Promise.all([
          storedBranches.length
            ? Promise.resolve({ success: true, data: storedBranches })
            : branchOfficeService.getForSelect(),
          clientService.getForSelect(),
          currencyService.getForSelect(),
        ]);

        if (!isMounted) return;

        const resolvedBranches = 'pagination' in branchResponse.data
          ? []
          : branchResponse.data;

        setLocalBranches(resolvedBranches);
        if (!storedBranches.length) {
          setBranches(resolvedBranches);
        }
        setPartners(partnerResponse.data);
        setCurrencies(currencyResponse.data);
      } catch (error) {
        console.error('Error loading agreement form options:', error);
        toast.error('No se pudieron cargar las opciones del formulario');
      } finally {
        if (isMounted) {
          setIsOptionsLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, [setBranches, storedBranches]);

  const currencySymbol = useMemo(() => {
    return currencies.find((currency) => currency.id === defaultCurrencyId)?.symbol
      || society?.mainCurrency?.symbol
      || 'S/';
  }, [currencies, defaultCurrencyId, society?.mainCurrency?.symbol]);

  const onSubmit = async (data: AgreementFormValues) => {
    if (!society?.id && !society?.code) {
      toast.error('No se pudo identificar la sociedad actual');
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === 'edit' && agreement?.id) {
        await updateMutation.mutateAsync({
          id: agreement.id,
          data: {
            societyId: society.code || society.id,
            branchId: data.branchId,
            partnerId: data.partnerId,
            startDate: data.startDate,
            endDate: data.endDate,
            commissionRate: data.commissionRate,
            currencyId: data.currencyId,
            notes: data.notes || undefined,
            status: agreement.status,
            agreementCode: agreement.agreementCode,
          },
        });
      } else {
        await outgoingConsignmentAgreementService.create({
          societyId: society.code || society.id,
          branchId: data.branchId,
          partnerId: data.partnerId,
          startDate: data.startDate,
          endDate: data.endDate,
          commissionRate: data.commissionRate,
          currencyId: data.currencyId,
          agreementCode: generateSku('CONS'),
          status: OutgoingConsignmentAgreementStatus.ACTIVE,
          notes: data.notes || undefined,
          createdBy: user?.email,
        });

        toast.success('Acuerdo de consignación creado correctamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating outgoing consignment agreement:', error);
      if (mode === 'create') {
        toast.error('No se pudo crear el acuerdo de consignación');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={mode === 'edit' ? 'space-y-6' : 'bg-card rounded-2xl border border-border shadow-sm p-6 lg:p-8'}>
      <div className={mode === 'edit' ? 'flex items-center gap-3' : 'flex items-center gap-3 mb-6'}>
        <div className="bg-primary/10 p-2.5 rounded-lg">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">
            {mode === 'edit' ? 'Actualizar acuerdo' : 'Paso 1. Crear acuerdo'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {mode === 'edit'
              ? 'Ajusta sucursal, consignatario, vigencia y comisión sin salir del listado.'
              : 'Registra el acuerdo base con consignatario, sucursal, fechas y comisión.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="branchId" className={labelClassName}>Sucursal</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <select
                    id="branchId"
                    {...field}
                    disabled={isOptionsLoading}
                    className={`${selectClassName} pl-10`}
                  >
                    <option value="">{isOptionsLoading ? 'Cargando...' : 'Seleccionar sucursal'}</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            {errors.branchId ? <span className="text-[10px] font-medium text-destructive">{errors.branchId.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="partnerId" className={labelClassName}>Consignatario</Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Controller
                name="partnerId"
                control={control}
                render={({ field }) => (
                  <select
                    id="partnerId"
                    {...field}
                    disabled={isOptionsLoading}
                    className={`${selectClassName} pl-10`}
                  >
                    <option value="">{isOptionsLoading ? 'Cargando...' : 'Seleccionar consignatario'}</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name} - {partner.documentNumber}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            {errors.partnerId ? <span className="text-[10px] font-medium text-destructive">{errors.partnerId.message}</span> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className={labelClassName}>Fecha de Inicio</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                id="startDate"
                type="date"
                className={`pl-10 ${inputClassName}`}
                {...register('startDate')}
              />
            </div>
            {errors.startDate ? <span className="text-[10px] font-medium text-destructive">{errors.startDate.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className={labelClassName}>Fecha de Fin</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                id="endDate"
                type="date"
                className={`pl-10 ${inputClassName}`}
                {...register('endDate')}
              />
            </div>
            {errors.endDate ? <span className="text-[10px] font-medium text-destructive">{errors.endDate.message}</span> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="commissionRate" className={labelClassName}>Comisión</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                id="commissionRate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                className={`pl-10 ${inputClassName}`}
                {...register('commissionRate')}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Usa formato decimal. Ejemplo: `0.15` representa 15%.
            </p>
            {errors.commissionRate ? <span className="text-[10px] font-medium text-destructive">{errors.commissionRate.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currencyId" className={labelClassName}>Moneda</Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Controller
                name="currencyId"
                control={control}
                render={({ field }) => (
                  <select
                    id="currencyId"
                    {...field}
                    disabled={isOptionsLoading}
                    className={`${selectClassName} pl-10`}
                  >
                    <option value="">{isOptionsLoading ? 'Cargando...' : 'Seleccionar moneda'}</option>
                    {currencies.map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Moneda base actual: {currencySymbol}
            </p>
            {errors.currencyId ? <span className="text-[10px] font-medium text-destructive">{errors.currencyId.message}</span> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className={labelClassName}>Notas</Label>
          <Textarea
            id="notes"
            placeholder="Notas internas del acuerdo, condiciones especiales o contexto comercial."
            className="bg-muted/30 border-border min-h-[100px] text-xs resize-none focus:bg-background transition-colors p-3 leading-relaxed"
            {...register('notes')}
          />
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">Datos automáticos</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">Sociedad:</span>{' '}
              {society?.code || society?.id || 'No disponible'}
            </div>
            <div>
              <span className="font-semibold text-foreground">Creado por:</span>{' '}
              {user?.email || 'No disponible'}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto h-11 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isOptionsLoading || updateMutation.isPending}
            className="w-full sm:flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.99] uppercase tracking-wider"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting || updateMutation.isPending
              ? 'Guardando...'
              : mode === 'edit'
                ? 'Guardar Cambios'
                : 'Crear Acuerdo'}
          </Button>
        </div>
      </form>
    </div>
  );
}
