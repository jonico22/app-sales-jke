import { useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Camera, 
  Plus, 
  Package, 
  Bell, 
  DollarSign, 
  Save,
  Wand2
} from 'lucide-react';
import { Button, Input, Label, Textarea, Switch } from '@/components/ui';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { generateSku } from '@/lib/utils';

const productSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  category: z.string().min(1, { message: "La categoría es obligatoria" }),
  sku: z.string().min(1, { message: "El SKU es obligatorio" }),
  stockInitial: z.coerce.number().min(0, { message: "Debe ser mayor o igual a 0" }),
  stockMin: z.coerce.number().min(0, { message: "Debe ser mayor o igual a 0" }),
  pricePurchase: z.coerce.number().min(0, { message: "Debe ser mayor o igual a 0" }),
  priceSale: z.coerce.number().min(0, { message: "Debe ser mayor o igual a 0" }),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductForm() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      active: true,
      stockInitial: 0,
      stockMin: 0,
      pricePurchase: 0.00,
      priceSale: 0.00
    }
  });

  const onSubmit = (data: ProductFormValues) => {
    console.log('Product Data:', data);
    // Submit logic here
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

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-sky-50 p-2.5 rounded-lg">
          <svg className="w-6 h-6 text-[#0ea5e9]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Ingreso Manual</h3>
          <p className="text-sm text-slate-500">Registro detallado producto por producto.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

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
          <Label htmlFor="name">NOMBRE DEL PRODUCTO</Label>
          <Input 
            id="name" 
            placeholder="Ej. Monitor UltraWide 34&quot;" 
            {...register('name')}
            className={errors.name ? "border-destructive bg-red-50" : "bg-white"}
          />
          {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
        </div>

        {/* Category & Action */}
        <div className="space-y-2">
          <Label htmlFor="category">CATEGORÍA</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select 
                id="category"
                {...register('category')}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent appearance-none text-slate-600"
              >

                <option value="">Seleccionar...</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <Button type="button" size="icon" className="bg-[#0ea5e9] hover:bg-[#0284c7] rounded-lg shrink-0">
              <Plus className="h-5 w-5 text-white" />
            </Button>
          </div>
          {errors.category && <span className="text-xs text-destructive">{errors.category.message}</span>}
        </div>

        {/* SKU */}
        <div className="space-y-2">
          <Label htmlFor="sku">SKU / CÓDIGO</Label>
          <div className="flex gap-2">
            <Input 
              id="sku" 
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
            <Label htmlFor="stockInitial">STOCK INICIAL</Label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                id="stockInitial" 
                type="number" 
                className="pl-9 bg-white" 
                placeholder="0"
                {...register('stockInitial')} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockMin">STOCK MÍNIMO</Label>
            <div className="relative">
              <Bell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                id="stockMin" 
                type="number" 
                className="pl-9 bg-white" 
                placeholder="0"
                {...register('stockMin')} 
              />
            </div>
          </div>
        </div>

        {/* Price Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pricePurchase">PRECIO COMPRA</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                id="pricePurchase" 
                type="number" 
                step="0.01" 
                className="pl-9 bg-white" 
                placeholder="0.00"
                {...register('pricePurchase')} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceSale">PRECIO VENTA</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                id="priceSale" 
                type="number" 
                step="0.01" 
                className="pl-9 bg-white" 
                placeholder="0.00"
                {...register('priceSale')} 
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">DESCRIPCIÓN (OPCIONAL)</Label>
          <Textarea 
            id="description" 
            placeholder="Características detalladas del producto..." 
            className="bg-white min-h-[100px] resize-none"
            {...register('description')}
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <div>
            <Label htmlFor="active" className="text-sm font-bold text-slate-700">ESTADO DEL PRODUCTO</Label>
            <p className="text-[10px] text-slate-400">Habilitar visibilidad en catálogo</p>
          </div>
          <Controller
            name="active"
            control={control}
            render={({ field: { value, ...field } }) => (
              <Switch 
                id="active" 
                checked={value}
                {...field}
              />
            )}
          />
        </div>

        {/* Submit */}
        <Button 
          type="submit" 
          className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-6 rounded-xl text-base font-bold shadow-lg shadow-sky-500/20 mt-4"
        >
          <Save className="mr-2 h-5 w-5" /> Guardar Productos
        </Button>

      </form>
    </div>
  );
}
