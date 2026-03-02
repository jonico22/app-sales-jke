import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Camera,
  Package,
  Bell,
  Save,
  Wand2,
  Barcode,
  Tag,
  Palette
} from 'lucide-react';
import { Button, Input, Label, Textarea, Switch } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SlidePanel } from '@/components/shared/SlidePanel';
import { generateSku } from '@/lib/utils';
import { productService, type Product } from '@/services/product.service';
import { categoryService, type CategorySelectOption } from '@/services/category.service';
import { useSocietyStore } from '@/store/society.store';
import { toast } from 'sonner';
import { UploadFileModal } from '@/components/shared/UploadFileModal';
import { FileCategory } from '@/services/file.service';

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
  barcode: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  colorCode: z.string().optional(),
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
  const society = useSocietyStore(state => state.society); // Add hook
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [categories, setCategories] = useState<CategorySelectOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
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
      price: 0,
      barcode: '',
      brand: '',
      color: '',
      colorCode: ''
    }
  });

  const colorCode = watch('colorCode');

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
      setImageId(null);
      return;
    }

    const fetchProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const response = await productService.getById(productId);
        const product: Product = response.data;
        console.log(product);
        reset({
          name: product.name,
          categoryId: product.category?.code || '',
          sku: product.code || '',
          description: product.description || '',
          isActive: product.isActive,
          stock: product.stock,
          minStock: product.minStock,
          priceCost: parseFloat(product.priceCost),
          price: parseFloat(product.price),
          barcode: product.barcode || '',
          brand: product.brand || '',
          color: product.color || '',
          colorCode: product.colorCode || ''
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
    console.log(data);
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
        imageId: imageId || undefined,
        barcode: data.barcode || undefined,
        brand: data.brand || undefined,
        color: data.color || undefined,
        colorCode: data.colorCode || undefined
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

  const handleImageUploadSuccess = (data: any) => {
    if (data) {
      if (data.id) setImageId(data.id);
      if (data.path || data.downloadUrl) setPreviewImage(data.downloadUrl || data.path);
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
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-6 border-b border-slate-100 w-full justify-start space-x-6">
              <TabsTrigger value="basic" className="px-0 pb-3 text-sm font-bold uppercase tracking-wide data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] text-slate-400 hover:text-slate-600 border-b-2 border-transparent transition-all rounded-none">
                Datos Básicos
              </TabsTrigger>
              <TabsTrigger value="attributes" className="px-0 pb-3 text-sm font-bold uppercase tracking-wide data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] text-slate-400 hover:text-slate-600 border-b-2 border-transparent transition-all rounded-none">
                Atributos
              </TabsTrigger>
            </TabsList>

            {/* === TAB: DATOS BÁSICOS === */}
            <TabsContent value="basic" className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
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
                      <option key={cat.code} value={cat.code}>
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      {society?.mainCurrency?.symbol || 'S/'}
                    </span>
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      {society?.mainCurrency?.symbol || 'S/'}
                    </span>
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

              {/* Status */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <div>
                  <Label htmlFor="edit-isActive" className="text-sm font-bold text-slate-700">ESTADO DEL PRODUCTO</Label>
                  <p className="text-[10px] text-slate-400">Habilitar visibilidad en catálogo</p>
                </div>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Switch
                      id="edit-isActive"
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      {...field}
                    />
                  )}
                />
              </div>
            </TabsContent>

            {/* === TAB: ATRIBUTOS === */}
            <TabsContent value="attributes" className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">IMAGEN (OPCIONAL)</Label>
                <div
                  className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 flex items-center justify-center gap-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <div className="h-20 w-20 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-base font-bold text-[#0ea5e9] group-hover:underline cursor-pointer">
                      Subir imagen
                    </span>
                    <p className="text-sm text-slate-400 mt-1">PNG, JPG, WEBP hasta 5MB</p>
                  </div>
                </div>
              </div>

              {/* Barcode */}
              <div className="space-y-2">
                <Label htmlFor="edit-barcode" className="text-sm font-bold text-slate-700">CÓDIGO DE BARRAS (EAN/UPC)</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Barcode className="h-5 w-5" />
                  </div>
                  <Input
                    id="edit-barcode"
                    placeholder="Ej. 775000000001"
                    className="pl-10 bg-white h-11"
                    {...register('barcode')}
                  />
                </div>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <Label htmlFor="edit-brand" className="text-sm font-bold text-slate-700">MARCA DEL PRODUCTO</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Tag className="h-4 w-4" />
                  </div>
                  <Input
                    id="edit-brand"
                    placeholder="Ej. Marca Premium"
                    className="pl-10 bg-white h-11"
                    {...register('brand')}
                  />
                </div>
              </div>

              {/* Color & Color Code Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-color" className="text-sm font-bold text-slate-700">COLOR</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Palette className="h-4 w-4" />
                    </div>
                    <Input
                      id="edit-color"
                      placeholder="Ej. Azul"
                      className="pl-10 bg-white h-11"
                      {...register('color')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-colorCode" className="text-sm font-bold text-slate-700">CÓDIGO HEX / COLOR</Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                        #
                      </div>
                      <Input
                        id="edit-colorCode"
                        placeholder="FFFFFF"
                        className="pl-8 bg-white uppercase h-11 font-mono"
                        maxLength={7}
                        {...register('colorCode')}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.startsWith('#')) val = val.substring(1);
                          setValue('colorCode', '#' + val);
                        }}
                      />
                    </div>
                    <div className="shrink-0 relative">
                      <input
                        type="color"
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        onChange={(e) => setValue('colorCode', e.target.value)}
                        value={colorCode || '#ffffff'}
                      />
                      <div
                        className="h-11 w-11 rounded-full border border-slate-300 shadow-sm ring-2 ring-white"
                        style={{ backgroundColor: colorCode || '#ffffff' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2">
                <Label htmlFor="edit-description" className="text-sm font-bold text-slate-700">DESCRIPCIÓN (OPCIONAL)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Ingrese las características detalladas..."
                  className="bg-white min-h-[120px] resize-none focus:ring-[#0ea5e9] p-4 text-slate-600"
                  {...register('description')}
                />
              </div>
            </TabsContent>
          </Tabs>
        </form>
      )}

      <UploadFileModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSuccess={handleImageUploadSuccess}
        title="Subir Imagen de Producto"
        accept="image/jpeg,image/png,image/webp"
        category={FileCategory.GENERAL}
        cropShape="square"
        showLibraryTab={true}
      />
    </SlidePanel>
  );
}
