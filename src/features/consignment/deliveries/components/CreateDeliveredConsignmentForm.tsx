import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Box, Building2, CalendarDays, Coins, FileText, Package2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { deliveredConsignmentAgreementService } from '@/services/delivered-consignment-agreement.service';
import { outgoingConsignmentAgreementService, type OutgoingConsignmentAgreement } from '@/services/outgoing-consignment-agreement.service';
import { branchOfficeService, type BranchOfficeSelectOption } from '@/services/branch-office.service';
import { productService, type Product } from '@/services/product.service';
import { useBranchStore } from '@/store/branch.store';
import { useCartStore } from '@/store/cart.store';
import { useSocietyStore } from '@/store/society.store';

const deliverySchema = z.object({
  consignmentAgreementId: z.string().min(1, { message: 'El acuerdo es obligatorio' }),
  productId: z.string().min(1, { message: 'El producto es obligatorio' }),
  branchId: z.string().min(1, { message: 'La sucursal es obligatoria' }),
  deliveredStock: z.coerce.number().min(1, { message: 'La cantidad debe ser mayor a 0' }),
  costPrice: z.coerce.number().min(0, { message: 'El costo debe ser mayor o igual a 0' }),
  suggestedSalePrice: z.coerce.number().min(0, { message: 'El precio sugerido debe ser mayor o igual a 0' }),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

type DeliveryFormValues = z.output<typeof deliverySchema>;

const inputClassName = 'bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors';
const selectClassName = 'w-full h-10 px-3 py-2 text-xs rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors';
const labelClassName = 'text-[10px] font-bold text-muted-foreground uppercase tracking-wider';

interface CreateDeliveredConsignmentFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function CreateDeliveredConsignmentForm({ onCancel, onSuccess }: CreateDeliveredConsignmentFormProps) {
  const society = useSocietyStore((state) => state.society);
  const { branches: storedBranches, selectedBranch, setBranches } = useBranchStore();
  const cartBranchId = useCartStore((state) => state.branchId);
  const cartCurrencyId = useCartStore((state) => state.currencyId);

  const [branches, setLocalBranches] = useState<BranchOfficeSelectOption[]>(storedBranches);
  const [agreements, setAgreements] = useState<OutgoingConsignmentAgreement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultBranchId = selectedBranch?.id || cartBranchId || '';

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<DeliveryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(deliverySchema) as any,
    defaultValues: {
      consignmentAgreementId: '',
      productId: '',
      branchId: defaultBranchId,
      deliveredStock: 1,
      costPrice: 0,
      suggestedSalePrice: 0,
      deliveryDate: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  const selectedBranchId = watch('branchId');

  useEffect(() => {
    reset((currentValues) => ({
      ...currentValues,
      branchId: currentValues.branchId || defaultBranchId,
    }));
  }, [defaultBranchId, reset]);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        setIsOptionsLoading(true);
        const [branchResponse, agreementResponse] = await Promise.all([
          storedBranches.length
            ? Promise.resolve({ success: true, data: storedBranches })
            : branchOfficeService.getForSelect(),
          outgoingConsignmentAgreementService.getAll({
            societyId: society?.code || society?.id,
            status: 'ACTIVE',
            limit: 100,
            sortBy: 'startDate',
            sortOrder: 'desc',
          }),
        ]);

        if (!isMounted) return;

        const resolvedBranches = Array.isArray(branchResponse.data) ? branchResponse.data : [];
        setLocalBranches(resolvedBranches);
        if (!storedBranches.length) {
          setBranches(resolvedBranches);
        }
        setAgreements(agreementResponse.data.data);
      } catch (error) {
        console.error('Error loading delivery form options:', error);
        toast.error('No se pudieron cargar acuerdos o sucursales');
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
  }, [setBranches, society?.code, society?.id, storedBranches]);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      if (!selectedBranchId) {
        setProducts([]);
        return;
      }

      try {
        const response = await productService.getForSelect({ branchId: selectedBranchId });
        if (!isMounted) return;
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error loading products for delivery:', error);
        if (isMounted) {
          toast.error('No se pudieron cargar los productos de la sucursal');
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedBranchId]);

  const currencySymbol = useMemo(() => {
    const currentAgreement = agreements.find((agreement) => agreement.id === watch('consignmentAgreementId'));
    if (currentAgreement?.currencyId === cartCurrencyId) {
      return society?.mainCurrency?.symbol || 'S/';
    }
    return society?.mainCurrency?.symbol || 'S/';
  }, [agreements, cartCurrencyId, society?.mainCurrency?.symbol, watch]);

  const onSubmit = async (data: DeliveryFormValues) => {
    try {
      setIsSubmitting(true);
      await deliveredConsignmentAgreementService.create({
        consignmentAgreementId: data.consignmentAgreementId,
        productId: data.productId,
        branchId: data.branchId,
        deliveredStock: data.deliveredStock,
        costPrice: data.costPrice,
        suggestedSalePrice: data.suggestedSalePrice,
        deliveryDate: data.deliveryDate || undefined,
        notes: data.notes || undefined,
      });

      toast.success('Entrega registrada correctamente');
      onSuccess();
    } catch (error) {
      console.error('Error creating delivered consignment agreement:', error);
      toast.error('No se pudo registrar la entrega');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2.5 rounded-lg">
          <Package2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">Paso 2. Registrar entrega</h3>
          <p className="text-sm text-muted-foreground">
            Asocia el producto al acuerdo y registra el stock entregado al consignatario.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="consignmentAgreementId" className={labelClassName}>Acuerdo</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Controller
                name="consignmentAgreementId"
                control={control}
                render={({ field }) => (
                  <select
                    id="consignmentAgreementId"
                    {...field}
                    disabled={isOptionsLoading}
                    className={`${selectClassName} pl-10`}
                  >
                    <option value="">{isOptionsLoading ? 'Cargando...' : 'Seleccionar acuerdo'}</option>
                    {agreements.map((agreement) => (
                      <option key={agreement.id} value={agreement.id}>
                        {agreement.agreementCode || agreement.id} - {agreement.partnerId}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            {errors.consignmentAgreementId ? <span className="text-[10px] font-medium text-destructive">{errors.consignmentAgreementId.message}</span> : null}
          </div>

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
        </div>

        <div className="space-y-2">
          <Label htmlFor="productId" className={labelClassName}>Producto</Label>
          <div className="relative">
            <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Controller
              name="productId"
              control={control}
              render={({ field }) => (
                <select
                  id="productId"
                  {...field}
                  disabled={!selectedBranchId}
                  className={`${selectClassName} pl-10`}
                >
                  <option value="">{selectedBranchId ? 'Seleccionar producto' : 'Primero selecciona una sucursal'}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          {errors.productId ? <span className="text-[10px] font-medium text-destructive">{errors.productId.message}</span> : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deliveredStock" className={labelClassName}>Cantidad Entregada</Label>
            <Input id="deliveredStock" type="number" min="1" className={inputClassName} {...register('deliveredStock')} />
            {errors.deliveredStock ? <span className="text-[10px] font-medium text-destructive">{errors.deliveredStock.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPrice" className={labelClassName}>Costo Unitario</Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="costPrice" type="number" step="0.01" min="0" className={`pl-10 ${inputClassName}`} {...register('costPrice')} />
            </div>
            {errors.costPrice ? <span className="text-[10px] font-medium text-destructive">{errors.costPrice.message}</span> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestedSalePrice" className={labelClassName}>Precio Sugerido</Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="suggestedSalePrice" type="number" step="0.01" min="0" className={`pl-10 ${inputClassName}`} {...register('suggestedSalePrice')} />
            </div>
            {errors.suggestedSalePrice ? <span className="text-[10px] font-medium text-destructive">{errors.suggestedSalePrice.message}</span> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryDate" className={labelClassName}>Fecha de Entrega</Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input id="deliveryDate" type="date" className={`pl-10 ${inputClassName}`} {...register('deliveryDate')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className={labelClassName}>Moneda Referencial</Label>
            <div className="h-10 px-3 rounded-lg border border-border bg-muted/20 flex items-center text-xs font-medium text-muted-foreground">
              {currencySymbol}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className={labelClassName}>Notas</Label>
          <Textarea
            id="notes"
            placeholder="Observaciones de la entrega o condiciones especiales."
            className="bg-muted/30 border-border min-h-[100px] text-xs resize-none focus:bg-background transition-colors p-3 leading-relaxed"
            {...register('notes')}
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
            {isSubmitting ? 'Guardando...' : 'Registrar Entrega'}
          </Button>
        </div>
      </form>
    </div>
  );
}
