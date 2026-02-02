import { useRef, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Camera,
  Package,
  Bell,
  DollarSign,
  Save,
  Wand2
} from 'lucide-react';
import { Button, Input, Label, Textarea, Switch } from '@/components/ui';
import { SlidePanel } from '@/components/shared/SlidePanel';
import { generateSku } from '@/lib/utils';
import { productService, type Product } from '@/services/product.service';
import { categoryService, type CategorySelectOption } from '@/services/category.service';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  categoryId: z.string().min(1, { message: "La categoría es obligatoria" }),
  sku: z.string().min(1, { message: "El SKU es obligatorio" }),
  stock: z.coerce.number().min(0, { message: "Debe ser mayor o igual a 0" }),
  minStock: z.coerce.number().min(0, { message: "Debe ser mayor o igual a 0" }),
  priceCost: z.coerce.number().min(0, { message: "Debe ser mayor o igual a 0" }),
  price: z.coerce.number().min(0, { message: "Debe ser mayor o igual a 0" }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ProductFormValues = z.output<typeof productSchema>;

interface ProductEditPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
  onSuccess?: () => void;
}

export function ProductEditPanel({
  open,
  onOpenChange,
  productId,
  onSuccess,
}: ProductEditPanelProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategorySelectOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, setValue, reset, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      categoryId: '',
      sku: '',
      description: '',
      isActive: true,
      stock: 0,
      minStock: 0,
      priceCost: 0,
      price: 0
    }
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getForSelect();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Error al cargar las categorías');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch product data when panel opens with a productId
  useEffect(() => {
    if (!open || !productId) {
      reset();
      setPreviewImage(null);
      return;
    }

    const fetchProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const response = await productService.getById(productId);
        const product: Product = response.data;
        
        reset({
          name: product.name,
          categoryId: product.categoryId,
          sku: product.code || '',
          description: product.description || '',
          isActive: product.isActive,
          stock: product.stock,
          minStock: product.minStock,
          priceCost: parseFloat(product.priceCost),
          price: parseFloat(product.price),
        });

        if (product.image) {
          setPreviewImage(product.image);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Error al cargar el producto');
        onOpenChange(false);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [open, productId, reset, onOpenChange]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!productId) return;
    
    try {
      await productService.update(productId, {
        name: data.name,
        description: data.description || undefined,
        price: data.price,
        priceCost: data.priceCost,
        stock: data.stock,
        minStock: data.minStock,
        categoryId: data.categoryId,
        isActive: data.isActive,
      });
      toast.success('Producto actualizado exitosamente');
      onOpenChange(false);
      onSuccess?.();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el producto');
    }
  };

  const handleGenerateSku = () => {
    const sku = generateSku();
    setValue('sku', sku, { shouldValidate: true });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const footer = (
    <>
      <Button
        type="submit"
        form="product-edit-form"
        disabled={isSubmitting || isLoadingProduct}
        className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-6 rounded-xl text-base font-bold shadow-lg shadow-sky-500/20"
      >
        <Save className="mr-2 h-5 w-5" /> {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
      <Button
        variant="ghost"
        className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-4"
        onClick={() => onOpenChange(false)}
      >
        Cancelar
      </Button>
    </>
  );

  return (
    <SlidePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Producto"
      footer={footer}
    >
      {isLoadingProduct ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9]"></div>
        </div>
      ) : (
        <form id="product-edit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>IMAGEN (OPCIONAL)</Label>
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-4 flex items-center justify-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-16 w-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-[#0ea5e9] hover:underline cursor-pointer">
                  Subir imagen
                </span>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG hasta 5MB</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">NOMBRE DEL PRODUCTO</Label>
            <Input
              id="edit-name"
              placeholder="Ej. Monitor UltraWide 34&quot;"
              {...register('name')}
              className={errors.name ? "border-destructive bg-red-50" : "bg-white"}
            />
            {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="edit-categoryId">CATEGORÍA</Label>
            <div className="relative">
              <select
                id="edit-categoryId"
                {...register('categoryId')}
                disabled={isLoadingCategories}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent appearance-none text-slate-600 disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="">{isLoadingCategories ? 'Cargando...' : 'Seleccionar...'}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {errors.categoryId && <span className="text-xs text-destructive">{errors.categoryId.message}</span>}
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="edit-sku">SKU / CÓDIGO</Label>
            <div className="flex gap-2">
              <Input
                id="edit-sku"
                placeholder="Ej. JKE-2024-001"
                {...register('sku')}
                className={errors.sku ? "border-destructive bg-red-50" : "bg-white"}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGenerateSku}
                title="Generar SKU Aleatorio"
              >
                <Wand2 className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
            {errors.sku && <span className="text-xs text-destructive">{errors.sku.message}</span>}
          </div>

          {/* Stock Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stock">STOCK</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-stock"
                  type="number"
                  className="pl-9 bg-white"
                  placeholder="0"
                  {...register('stock')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-minStock">STOCK MÍNIMO</Label>
              <div className="relative">
                <Bell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-minStock"
                  type="number"
                  className="pl-9 bg-white"
                  placeholder="0"
                  {...register('minStock')}
                />
              </div>
            </div>
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-priceCost">PRECIO COSTO</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-priceCost"
                  type="number"
                  step="0.01"
                  className="pl-9 bg-white"
                  placeholder="0.00"
                  {...register('priceCost')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">PRECIO VENTA</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  className="pl-9 bg-white"
                  placeholder="0.00"
                  {...register('price')}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">DESCRIPCIÓN (OPCIONAL)</Label>
            <Textarea
              id="edit-description"
              placeholder="Características detalladas del producto..."
              className="bg-white min-h-[100px] resize-none"
              {...register('description')}
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <div>
              <Label htmlFor="edit-isActive" className="text-sm font-bold text-slate-700">ESTADO DEL PRODUCTO</Label>
              <p className="text-[10px] text-slate-400">Habilitar visibilidad en catálogo</p>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field: { value, ...field } }) => (
                <Switch
                  id="edit-isActive"
                  checked={value}
                  {...field}
                />
              )}
            />
          </div>
        </form>
      )}
    </SlidePanel>
  );
}
