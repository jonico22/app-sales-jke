import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Camera,
  Plus,
  Package,
  Bell,
  Save,
  Wand2,
  Barcode,
  Tag,
  Palette,
  ChevronDown
} from 'lucide-react';
import { Button, Input, Label, Textarea, Switch } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { generateSku } from '@/lib/utils';
import { productService } from '@/services/product.service';
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
  // New Fields
  barcode: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  colorCode: z.string().optional(),
});

// Separate component for the edit modal integration
import { CategoryEditModal } from '../../categories/components/CategoryEditModal';

type ProductFormValues = z.output<typeof productSchema>;

export default function ProductForm() {
  const society = useSocietyStore(state => state.society); // Add hook
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [categories, setCategories] = useState<CategorySelectOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Fetch categories on mount
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await categoryService.getForSelect();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar las categorías');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategorySaved = async () => {
    await fetchCategories();
  };

  const { register, handleSubmit, control, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
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

  const onSubmit = async (data: ProductFormValues) => {
    try {
      await productService.create({
        name: data.name,
        description: data.description || undefined,
        price: data.price,
        priceCost: data.priceCost,
        stock: data.stock,
        minStock: data.minStock,
        categoryId: data.categoryId,
        isActive: data.isActive,
        code: data.sku,
        imageId: imageId || undefined,
        // New fields mapping
        barcode: data.barcode || undefined,
        brand: data.brand || undefined,
        color: data.color || undefined,
        colorCode: data.colorCode || undefined
      });
      toast.success('Producto guardado exitosamente');
      reset();
      setPreviewImage(null);
      setImageId(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el producto');
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

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2.5 rounded-lg">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">Ingreso Manual</h3>
          <p className="text-sm text-muted-foreground">Registro detallado producto por producto.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-6 border-b border-border w-full justify-start space-x-6 bg-transparent h-auto p-0">
            <TabsTrigger value="basic" className="px-0 pb-3 text-[11px] font-bold uppercase tracking-wider data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-all rounded-none bg-transparent">
              Datos Básicos
            </TabsTrigger>
            <TabsTrigger value="attributes" className="px-0 pb-3 text-[11px] font-bold uppercase tracking-wider data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-all rounded-none bg-transparent">
              Atributos
            </TabsTrigger>
          </TabsList>

          {/* === TAB: DATOS BÁSICOS === */}
          <TabsContent value="basic" className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nombre del Producto</Label>
              <Input
                id="name"
                placeholder="Ej. Monitor UltraWide 34&quot;"
                {...register('name')}
                className={errors.name ? "border-destructive bg-destructive/10 h-10 text-xs" : "bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"}
              />
              {errors.name && <span className="text-[10px] font-medium text-destructive">{errors.name.message}</span>}
            </div>

            {/* Category & Action */}
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Categoría</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    id="categoryId"
                    {...register('categoryId')}
                    disabled={isLoadingCategories}
                    className="w-full h-10 px-3 py-2 text-xs rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors"
                  >
                    <option value="">{isLoadingCategories ? 'Cargando...' : 'Seleccionar...'}</option>
                    {categories.map((cat) => (
                      <option key={cat.code} value={cat.code}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shrink-0 h-10 w-10 flex items-center justify-center p-0 shadow-lg shadow-primary/20 transition-all active:scale-95"
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              {errors.categoryId && <span className="text-[10px] font-medium text-destructive">{errors.categoryId.message}</span>}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SKU / Código</Label>
              <div className="flex gap-2">
                <Input
                  id="sku"
                  placeholder="Ej. JKE-2024-001"
                  {...register('sku')}
                  className={errors.sku ? "border-destructive bg-destructive/10 h-10 text-xs" : "bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGenerateSku}
                  title="Generar SKU Aleatorio"
                  className="h-10 w-10 p-0 flex items-center justify-center text-muted-foreground border-border hover:bg-muted transition-all active:scale-95 shrink-0"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>
              {errors.sku && <span className="text-[10px] font-medium text-destructive">{errors.sku.message}</span>}
            </div>

            {/* Stock Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stock Inicial</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="stock"
                    type="number"
                    className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                    placeholder="0"
                    {...register('stock')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stock Mínimo</Label>
                <div className="relative">
                  <Bell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="minStock"
                    type="number"
                    className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                    placeholder="0"
                    {...register('minStock')}
                  />
                </div>
              </div>
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceCost" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Precio Costo</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground/50">
                    {society?.mainCurrency?.symbol || 'S/'}
                  </span>
                  <Input
                    id="priceCost"
                    type="number"
                    step="0.01"
                    className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                    placeholder="0.00"
                    {...register('priceCost')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Precio Venta</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground/50">
                    {society?.mainCurrency?.symbol || 'S/'}
                  </span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                    placeholder="0.00"
                    {...register('price')}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <div>
                <Label htmlFor="isActive" className="text-[10px] font-bold text-foreground uppercase tracking-wider">Estado del Producto</Label>
                <p className="text-[10px] text-muted-foreground font-medium">Habilitar visibilidad en catálogo</p>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Switch
                    id="isActive"
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
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Imagen (Opcional)</Label>
              <div
                className="border-2 border-dashed border-border rounded-xl bg-muted/20 p-6 flex items-center justify-center gap-6 hover:bg-muted/30 transition-all cursor-pointer group"
                onClick={() => setIsImageModalOpen(true)}
              >
                <div className="h-16 w-16 bg-card border border-border rounded-lg flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-primary group-hover:underline cursor-pointer">
                    Subir imagen
                  </span>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">PNG, JPG, WEBP hasta 5MB</p>
                </div>
              </div>
            </div>

            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Código de Barras (EAN/UPC)</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                  <Barcode className="h-4 w-4" />
                </div>
                <Input
                  id="barcode"
                  placeholder="Ej. 775000000001"
                  className="pl-10 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                  {...register('barcode')}
                />
              </div>
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Marca del Producto (Opcional)</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                  <Tag className="h-4 w-4" />
                </div>
                <Input
                  id="brand"
                  placeholder="Ej. Marca Premium"
                  className="pl-10 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                  {...register('brand')}
                />
              </div>
            </div>

            {/* Color & Color Code Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Color (Opcional)</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                    <Palette className="h-4 w-4" />
                  </div>
                  <Input
                    id="color"
                    placeholder="Ej. Azul Cobalto"
                    className="pl-10 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                    {...register('color')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="colorCode" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Código Hex (Opcional)</Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-mono text-[10px]">
                      #
                    </div>
                    <Input
                      id="colorCode"
                      placeholder="FFFFFF"
                      className="pl-7 bg-muted/30 border-border uppercase h-10 font-mono text-xs focus:bg-background transition-colors"
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
                      className="h-10 w-10 rounded-full border border-border shadow-sm ring-2 ring-background transition-transform active:scale-95"
                      style={{ backgroundColor: colorCode || '#ffffff' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="description" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Ingrese las características detalladas del producto aquí..."
                className="bg-muted/30 border-border min-h-[100px] text-xs resize-none focus:bg-background transition-colors p-3 leading-relaxed"
                {...register('description')}
              />
            </div>

          </TabsContent>
        </Tabs>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 mt-8 transition-all active:scale-[0.99] uppercase tracking-wider"
        >
          <Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
        </Button>

      </form>

      <CategoryEditModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        category={null} // null indicates creation mode
        onSave={handleCategorySaved}
      />

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
    </div>
  );
}
