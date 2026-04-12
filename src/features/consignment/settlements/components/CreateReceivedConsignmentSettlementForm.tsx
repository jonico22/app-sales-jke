import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { BadgeDollarSign, CalendarDays, FileText, Landmark, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { outgoingConsignmentAgreementService, type OutgoingConsignmentAgreement } from '@/services/outgoing-consignment-agreement.service';
import {
  receivedConsignmentSettlementService,
  ReceivedConsignmentSettlementStatus,
} from '@/services/received-consignment-settlement.service';
import { currencyService, type CurrencySelectOption } from '@/services/currency.service';
import { useSocietyStore } from '@/store/society.store';
import { useCartStore } from '@/store/cart.store';

const settlementSchema = z.object({
  outgoingAgreementId: z.string().min(1, { message: 'El acuerdo es obligatorio' }),
  settlementDate: z.string().min(1, { message: 'La fecha es obligatoria' }),
  totalReportedSalesAmount: z.coerce.number().min(0, { message: 'El total reportado debe ser mayor o igual a 0' }),
  consigneeCommissionAmount: z.coerce.number().min(0, { message: 'La comisión debe ser mayor o igual a 0' }),
  totalReceivedAmount: z.coerce.number().min(0, { message: 'El total recibido debe ser mayor o igual a 0' }),
  status: z.nativeEnum(ReceivedConsignmentSettlementStatus),
  currencyId: z.string().min(1, { message: 'La moneda es obligatoria' }),
  receiptReference: z.string().optional(),
  settlementNotes: z.string().optional(),
}).refine(
  (data) => Number(data.totalReceivedAmount) === Number(data.totalReportedSalesAmount) - Number(data.consigneeCommissionAmount),
  {
    message: 'El total recibido debe ser igual a total reportado menos comisión',
    path: ['totalReceivedAmount'],
  }
);

type SettlementFormValues = z.output<typeof settlementSchema>;

const inputClassName = 'bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors';
const selectClassName = 'w-full h-10 px-3 py-2 text-xs rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors';
const labelClassName = 'text-[10px] font-bold text-muted-foreground uppercase tracking-wider';

interface CreateReceivedConsignmentSettlementFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function CreateReceivedConsignmentSettlementForm({ onCancel, onSuccess }: CreateReceivedConsignmentSettlementFormProps) {
  const society = useSocietyStore((state) => state.society);
  const cartCurrencyId = useCartStore((state) => state.currencyId);

  const [agreements, setAgreements] = useState<OutgoingConsignmentAgreement[]>([]);
  const [currencies, setCurrencies] = useState<CurrencySelectOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCurrencyId = cartCurrencyId || society?.mainCurrency?.id || '';

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<SettlementFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(settlementSchema) as any,
    defaultValues: {
      outgoingAgreementId: '',
      settlementDate: new Date().toISOString().slice(0, 10),
      totalReportedSalesAmount: 0,
      consigneeCommissionAmount: 0,
      totalReceivedAmount: 0,
      status: ReceivedConsignmentSettlementStatus.PENDING,
      currencyId: defaultCurrencyId,
      receiptReference: '',
      settlementNotes: '',
    },
  });

  useEffect(() => {
    reset((currentValues) => ({
      ...currentValues,
      currencyId: currentValues.currencyId || defaultCurrencyId,
    }));
  }, [defaultCurrencyId, reset]);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        setIsOptionsLoading(true);
        const [agreementResponse, currencyResponse] = await Promise.all([
          outgoingConsignmentAgreementService.getAll({
            societyId: society?.code || society?.id,
            limit: 100,
            sortBy: 'startDate',
            sortOrder: 'desc',
          }),
          currencyService.getForSelect(),
        ]);

        if (!isMounted) return;
        setAgreements(agreementResponse.data.data);
        setCurrencies(currencyResponse.data);
      } catch (error) {
        console.error('Error loading settlement form options:', error);
        toast.error('No se pudieron cargar los acuerdos o monedas');
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
  }, [society?.code, society?.id]);

  const estimatedBalance = useMemo(() => {
    return (
      Number(watch('totalReportedSalesAmount') || 0) -
      Number(watch('consigneeCommissionAmount') || 0)
    ).toFixed(2);
  }, [watch]);

  const onSubmit = async (data: SettlementFormValues) => {
    try {
      setIsSubmitting(true);
      await receivedConsignmentSettlementService.create({
        outgoingAgreementId: data.outgoingAgreementId,
        settlementDate: data.settlementDate,
        totalReportedSalesAmount: data.totalReportedSalesAmount,
        consigneeCommissionAmount: data.consigneeCommissionAmount,
        totalReceivedAmount: data.totalReceivedAmount,
        status: data.status,
        currencyId: data.currencyId,
        receiptReference: data.receiptReference || undefined,
        settlementNotes: data.settlementNotes || undefined,
      });

      toast.success('Liquidación registrada correctamente');
      onSuccess();
    } catch (error) {
      console.error('Error creating received consignment settlement:', error);
      toast.error('No se pudo registrar la liquidación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2.5 rounded-lg">
          <Landmark className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">Paso 4. Registrar liquidación</h3>
          <p className="text-sm text-muted-foreground">
            Registra la liquidación recibida sobre un acuerdo de consignación.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="outgoingAgreementId" className={labelClassName}>Acuerdo</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Controller
              name="outgoingAgreementId"
              control={control}
              render={({ field }) => (
                <select
                  id="outgoingAgreementId"
                  {...field}
                  disabled={isOptionsLoading}
                  className={`${selectClassName} pl-10`}
                >
                  <option value="">{isOptionsLoading ? 'Cargando...' : 'Seleccionar acuerdo'}</option>
                  {agreements.map((agreement) => (
                    <option key={agreement.id} value={agreement.id}>
                      {agreement.agreementCode || agreement.id}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          {errors.outgoingAgreementId ? <span className="text-[10px] font-medium text-destructive">{errors.outgoingAgreementId.message}</span> : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="settlementDate" className={labelClassName}>Fecha de Liquidación</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="settlementDate" type="date" className={`pl-10 ${inputClassName}`} {...register('settlementDate')} />
            </div>
            {errors.settlementDate ? <span className="text-[10px] font-medium text-destructive">{errors.settlementDate.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currencyId" className={labelClassName}>Moneda</Label>
            <Controller
              name="currencyId"
              control={control}
              render={({ field }) => (
                <select
                  id="currencyId"
                  {...field}
                  disabled={isOptionsLoading}
                  className={selectClassName}
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
            {errors.currencyId ? <span className="text-[10px] font-medium text-destructive">{errors.currencyId.message}</span> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalReportedSalesAmount" className={labelClassName}>Ventas Reportadas</Label>
            <div className="relative">
              <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="totalReportedSalesAmount" type="number" step="0.01" min="0" className={`pl-10 ${inputClassName}`} {...register('totalReportedSalesAmount')} />
            </div>
            {errors.totalReportedSalesAmount ? <span className="text-[10px] font-medium text-destructive">{errors.totalReportedSalesAmount.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="consigneeCommissionAmount" className={labelClassName}>Comisión Consignatario</Label>
            <div className="relative">
              <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="consigneeCommissionAmount" type="number" step="0.01" min="0" className={`pl-10 ${inputClassName}`} {...register('consigneeCommissionAmount')} />
            </div>
            {errors.consigneeCommissionAmount ? <span className="text-[10px] font-medium text-destructive">{errors.consigneeCommissionAmount.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalReceivedAmount" className={labelClassName}>Total Recibido</Label>
            <div className="relative">
              <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="totalReceivedAmount" type="number" step="0.01" min="0" className={`pl-10 ${inputClassName}`} {...register('totalReceivedAmount')} />
            </div>
            {errors.totalReceivedAmount ? <span className="text-[10px] font-medium text-destructive">{errors.totalReceivedAmount.message}</span> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status" className={labelClassName}>Estado</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select id="status" {...field} className={selectClassName}>
                  <option value={ReceivedConsignmentSettlementStatus.PENDING}>PENDING</option>
                  <option value={ReceivedConsignmentSettlementStatus.PAID}>PAID</option>
                </select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptReference" className={labelClassName}>Referencia</Label>
            <Input
              id="receiptReference"
              placeholder="Ej. LIQ-00045"
              className={inputClassName}
              {...register('receiptReference')}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
          Neto esperado: <span className="font-semibold text-foreground">{estimatedBalance}</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settlementNotes" className={labelClassName}>Notas</Label>
          <Textarea
            id="settlementNotes"
            placeholder="Observaciones o contexto de la liquidación."
            className="bg-muted/30 border-border min-h-[100px] text-xs resize-none focus:bg-background transition-colors p-3 leading-relaxed"
            {...register('settlementNotes')}
          />
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
            disabled={isSubmitting || isOptionsLoading}
            className="w-full sm:flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.99] uppercase tracking-wider"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Guardando...' : 'Registrar Liquidación'}
          </Button>
        </div>
      </form>
    </div>
  );
}
