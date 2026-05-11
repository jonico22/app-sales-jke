import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { BadgeDollarSign, CalendarDays, FileText, Hash, Save, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { deliveredConsignmentAgreementService, type DeliveredConsignmentAgreement } from '@/services/delivered-consignment-agreement.service';
import {
  externalConsignmentSaleService,
  type ExternalConsignmentSale,
} from '@/services/external-consignment-sale.service';
import { outgoingConsignmentAgreementService, type OutgoingConsignmentAgreement } from '@/services/outgoing-consignment-agreement.service';
import { productService, type Product } from '@/services/product.service';
import { useSocietyStore } from '@/store/society.store';
import { useUpdateExternalConsignmentSale } from '../../hooks/useConsignmentQueries';

const saleSchema = z.object({
  deliveredConsignmentId: z.string().min(1, { message: 'La entrega es obligatoria' }),
  soldQuantity: z.coerce.number().min(1, { message: 'La cantidad vendida debe ser mayor a 0' }),
  reportedSaleDate: z.string().min(1, { message: 'La fecha de venta es obligatoria' }),
  reportedSalePrice: z.coerce.number().min(0, { message: 'El total vendido debe ser mayor o igual a 0' }),
  unitSalePrice: z.coerce.number().min(0, { message: 'El precio unitario debe ser mayor o igual a 0' }),
  totalCommissionAmount: z.coerce.number().min(0, { message: 'La comisión debe ser mayor o igual a 0' }),
  remarks: z.string().optional(),
  documentReference: z.string().optional(),
});

type SaleFormValues = z.output<typeof saleSchema>;

const inputClassName = 'bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors';
const selectClassName = 'w-full h-10 px-3 py-2 text-xs rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors';
const labelClassName = 'text-[10px] font-bold text-muted-foreground uppercase tracking-wider';

interface CreateExternalConsignmentSaleFormProps {
  mode?: 'create' | 'edit';
  sale?: ExternalConsignmentSale;
  onCancel: () => void;
  onSuccess: () => void;
}

export function CreateExternalConsignmentSaleForm({
  mode = 'create',
  sale,
  onCancel,
  onSuccess,
}: CreateExternalConsignmentSaleFormProps) {
  const society = useSocietyStore((state) => state.society);
  const [deliveries, setDeliveries] = useState<DeliveredConsignmentAgreement[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<OutgoingConsignmentAgreement | null>(null);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateMutation = useUpdateExternalConsignmentSale();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SaleFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(saleSchema) as any,
    defaultValues: {
      deliveredConsignmentId: '',
      soldQuantity: 1,
      reportedSaleDate: new Date().toISOString().slice(0, 10),
      reportedSalePrice: 0,
      unitSalePrice: 0,
      totalCommissionAmount: 0,
      remarks: '',
      documentReference: '',
    },
  });

  useEffect(() => {
    if (!sale) return;

    setValue('deliveredConsignmentId', sale.deliveredConsignmentId, { shouldDirty: false, shouldValidate: false });
    setValue('soldQuantity', Number(sale.soldQuantity ?? 1), { shouldDirty: false, shouldValidate: false });
    setValue('reportedSaleDate', sale.reportedSaleDate?.slice(0, 10) || '', { shouldDirty: false, shouldValidate: false });
    setValue('reportedSalePrice', Number(sale.reportedSalePrice ?? 0), { shouldDirty: false, shouldValidate: false });
    setValue('unitSalePrice', Number(sale.unitSalePrice ?? 0), { shouldDirty: false, shouldValidate: false });
    setValue('totalCommissionAmount', Number(sale.totalCommissionAmount ?? 0), { shouldDirty: false, shouldValidate: false });
    setValue('remarks', sale.remarks || '', { shouldDirty: false, shouldValidate: false });
    setValue('documentReference', sale.documentReference || '', { shouldDirty: false, shouldValidate: false });
  }, [sale, setValue]);

  useEffect(() => {
    let isMounted = true;

    const loadDeliveries = async () => {
      try {
        setIsOptionsLoading(true);
        const response = await deliveredConsignmentAgreementService.getAll({
          societyId: society?.code || society?.id,
          limit: 100,
          sortBy: 'deliveryDate',
          sortOrder: 'desc',
        });

        if (!isMounted) return;
        setDeliveries(response.data.data);
      } catch (error) {
        console.error('Error loading deliveries for external sale form:', error);
        toast.error('No se pudieron cargar las entregas');
      } finally {
        if (isMounted) {
          setIsOptionsLoading(false);
        }
      }
    };

    loadDeliveries();

    return () => {
      isMounted = false;
    };
  }, [society?.code, society?.id]);

  const selectedDeliveryId = watch('deliveredConsignmentId');
  const selectedDelivery = useMemo(
    () => deliveries.find((delivery) => delivery.id === selectedDeliveryId) || null,
    [deliveries, selectedDeliveryId]
  );
  const soldQuantity = Number(watch('soldQuantity') || 0);
  const unitSalePrice = Number(watch('unitSalePrice') || 0);

  useEffect(() => {
    let isMounted = true;

    const hydrateSelectedDelivery = async () => {
      if (!selectedDelivery) {
        setSelectedProduct(null);
        setSelectedAgreement(null);
        setValue('soldQuantity', 1, { shouldDirty: false, shouldValidate: false });
        setValue('unitSalePrice', 0, { shouldDirty: false, shouldValidate: false });
        setValue('reportedSalePrice', 0, { shouldDirty: false, shouldValidate: false });
        setValue('totalCommissionAmount', 0, { shouldDirty: false, shouldValidate: false });
        return;
      }

      try {
        const [productResponse, agreementResponse] = await Promise.all([
          productService.getById(selectedDelivery.productId),
          outgoingConsignmentAgreementService.getById(selectedDelivery.consignmentAgreementId),
        ]);

        if (!isMounted) return;

        setSelectedProduct(productResponse.data);
        setSelectedAgreement(agreementResponse.data);

        const defaultUnitPrice = Number(selectedDelivery.suggestedSalePrice || productResponse.data.price || 0);
        const defaultQuantity = 1;
        const totalSale = defaultQuantity * defaultUnitPrice;
        const commissionRate = Number(agreementResponse.data.commissionRate || 0);

        setValue('soldQuantity', defaultQuantity, { shouldDirty: true, shouldValidate: true });
        setValue('unitSalePrice', defaultUnitPrice, { shouldDirty: true, shouldValidate: true });
        setValue('reportedSalePrice', totalSale, { shouldDirty: true, shouldValidate: true });
        setValue('totalCommissionAmount', totalSale * commissionRate, { shouldDirty: true, shouldValidate: true });
      } catch (error) {
        console.error('Error loading selected delivery details:', error);
        if (isMounted) {
          toast.error('No se pudieron cargar los datos de la entrega seleccionada');
        }
      }
    };

    void hydrateSelectedDelivery();

    return () => {
      isMounted = false;
    };
  }, [selectedDelivery, setValue]);

  useEffect(() => {
    if (!selectedDelivery || !selectedAgreement) {
      return;
    }

    const totalSale = soldQuantity * unitSalePrice;
    const commissionRate = Number(selectedAgreement.commissionRate || 0);

    setValue('reportedSalePrice', totalSale, { shouldDirty: true, shouldValidate: true });
    setValue('totalCommissionAmount', totalSale * commissionRate, { shouldDirty: true, shouldValidate: true });
  }, [selectedAgreement, selectedDelivery, setValue, soldQuantity, unitSalePrice]);

  const onSubmit = async (data: SaleFormValues) => {
    try {
      setIsSubmitting(true);
      if (mode === 'edit' && sale?.id) {
        await updateMutation.mutateAsync({
          id: sale.id,
          data: {
            deliveredConsignmentId: data.deliveredConsignmentId,
            soldQuantity: data.soldQuantity,
            reportedSaleDate: data.reportedSaleDate,
            reportedSalePrice: data.reportedSalePrice,
            unitSalePrice: data.unitSalePrice,
            totalCommissionAmount: data.totalCommissionAmount,
            netTotal: data.reportedSalePrice - data.totalCommissionAmount,
            remarks: data.remarks || undefined,
            documentReference: data.documentReference || undefined,
          },
        });
      } else {
        await externalConsignmentSaleService.create({
          deliveredConsignmentId: data.deliveredConsignmentId,
          soldQuantity: data.soldQuantity,
          reportedSaleDate: data.reportedSaleDate,
          reportedSalePrice: data.reportedSalePrice,
          unitSalePrice: data.unitSalePrice,
          totalCommissionAmount: data.totalCommissionAmount,
          remarks: data.remarks || undefined,
          documentReference: data.documentReference || undefined,
        });

        toast.success('Venta externa registrada correctamente');
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating external consignment sale:', error);
      if (mode === 'create') {
        toast.error('No se pudo registrar la venta externa');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={mode === 'edit' ? 'space-y-6' : 'bg-card rounded-2xl border border-border shadow-sm p-6 lg:p-8'}>
      <div className={mode === 'edit' ? 'flex items-center gap-3' : 'flex items-center gap-3 mb-6'}>
        <div className="bg-primary/10 p-2.5 rounded-lg">
          <ShoppingBag className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">
            {mode === 'edit' ? 'Actualizar venta externa' : 'Paso 3. Registrar venta externa'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {mode === 'edit'
              ? 'Ajusta cantidad, fecha, importes y referencia desde el listado.'
              : 'Registra la venta reportada por el consignatario sobre una entrega existente.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="deliveredConsignmentId" className={labelClassName}>Entrega</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Controller
              name="deliveredConsignmentId"
              control={control}
              render={({ field }) => (
                <select
                  id="deliveredConsignmentId"
                  {...field}
                  disabled={isOptionsLoading}
                  className={`${selectClassName} pl-10`}
                >
                  <option value="">{isOptionsLoading ? 'Cargando...' : 'Seleccionar entrega'}</option>
                  {deliveries.map((delivery) => (
                    <option key={delivery.id} value={delivery.id}>
                      {delivery.id} - Stock restante: {delivery.remainingStock}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          {errors.deliveredConsignmentId ? <span className="text-[10px] font-medium text-destructive">{errors.deliveredConsignmentId.message}</span> : null}
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">Resumen de la Entrega</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">Producto:</span>{' '}
              {selectedProduct?.name || selectedDelivery?.productId || 'Selecciona una entrega'}
            </div>
            <div>
              <span className="font-semibold text-foreground">Stock restante:</span>{' '}
              {selectedDelivery?.remainingStock ?? 'N/D'}
            </div>
            <div>
              <span className="font-semibold text-foreground">Precio sugerido:</span>{' '}
              {selectedDelivery ? Number(selectedDelivery.suggestedSalePrice || 0).toFixed(2) : '0.00'}
            </div>
            <div>
              <span className="font-semibold text-foreground">Comisión:</span>{' '}
              {selectedAgreement ? `${(Number(selectedAgreement.commissionRate || 0) * 100).toFixed(2)}%` : '0.00%'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="soldQuantity" className={labelClassName}>Cantidad Vendida</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="soldQuantity" type="number" min="1" className={`pl-10 ${inputClassName}`} {...register('soldQuantity')} />
            </div>
            {errors.soldQuantity ? <span className="text-[10px] font-medium text-destructive">{errors.soldQuantity.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportedSaleDate" className={labelClassName}>Fecha Reportada</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="reportedSaleDate" type="date" className={`pl-10 ${inputClassName}`} {...register('reportedSaleDate')} />
            </div>
            {errors.reportedSaleDate ? <span className="text-[10px] font-medium text-destructive">{errors.reportedSaleDate.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label className={labelClassName}>Stock Disponible</Label>
            <div className="h-10 px-3 rounded-lg border border-border bg-muted/20 flex items-center text-xs font-medium text-muted-foreground">
              {selectedDelivery ? selectedDelivery.remainingStock : 'Selecciona una entrega'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reportedSalePrice" className={labelClassName}>Venta Total Reportada</Label>
            <div className="relative">
              <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="reportedSalePrice" type="number" step="0.01" min="0" className={`pl-10 ${inputClassName}`} {...register('reportedSalePrice')} />
            </div>
            {errors.reportedSalePrice ? <span className="text-[10px] font-medium text-destructive">{errors.reportedSalePrice.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitSalePrice" className={labelClassName}>Precio Unitario</Label>
            <div className="relative">
              <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="unitSalePrice" type="number" step="0.01" min="0" className={`pl-10 ${inputClassName}`} {...register('unitSalePrice')} />
            </div>
            {errors.unitSalePrice ? <span className="text-[10px] font-medium text-destructive">{errors.unitSalePrice.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalCommissionAmount" className={labelClassName}>Comisión Total</Label>
            <div className="relative">
              <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="totalCommissionAmount" type="number" step="0.01" min="0" className={`pl-10 ${inputClassName}`} {...register('totalCommissionAmount')} />
            </div>
            {errors.totalCommissionAmount ? <span className="text-[10px] font-medium text-destructive">{errors.totalCommissionAmount.message}</span> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="documentReference" className={labelClassName}>Referencia</Label>
            <Input
              id="documentReference"
              placeholder="Ej. FAC-EXT-1001"
              className={inputClassName}
              {...register('documentReference')}
            />
          </div>

          <div className="space-y-2">
            <Label className={labelClassName}>Neto Estimado</Label>
            <div className="h-10 px-3 rounded-lg border border-border bg-muted/20 flex items-center text-xs font-medium text-muted-foreground">
              {(Number(watch('reportedSalePrice') || 0) - Number(watch('totalCommissionAmount') || 0)).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks" className={labelClassName}>Observaciones</Label>
          <Textarea
            id="remarks"
            placeholder="Comentarios de la venta reportada por el consignatario."
            className="bg-muted/30 border-border min-h-[100px] text-xs resize-none focus:bg-background transition-colors p-3 leading-relaxed"
            {...register('remarks')}
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
            disabled={isSubmitting || isOptionsLoading || updateMutation.isPending}
            className="w-full sm:flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.99] uppercase tracking-wider"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting || updateMutation.isPending
              ? 'Guardando...'
              : mode === 'edit'
                ? 'Guardar Cambios'
                : 'Registrar Venta Externa'}
          </Button>
        </div>
      </form>
    </div>
  );
}
