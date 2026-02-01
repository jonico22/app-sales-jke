import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PenLine, Wand2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label, Textarea, Switch } from '@/components/ui';
import { categoryService } from '@/services/category.service';
import type { Category } from '@/services/category.service';

const categorySchema = z.object({
  code: z.string().min(1, { message: "El código es requerido" }),
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
}

export default function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: category?.code || '',
      name: category?.name || '',
      description: category?.description || '',
      isActive: category?.isActive ?? true,
    },
  });

  const isActive = watch('isActive');

  const generateCode = () => {
    setIsGeneratingCode(true);
    // Generate a random code (you can customize this logic)
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const generatedCode = `CAT-${timestamp}-${random}`;
    setValue('code', generatedCode);
    setIsGeneratingCode(false);
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        // Update existing category
        await categoryService.update(category.id, {
          code: data.code,
          name: data.name,
          description: data.description || undefined,
          isActive: data.isActive,
        });
        toast.success('Categoría actualizada exitosamente');
      } else {
        // Create new category
        await categoryService.create({
          code: data.code,
          name: data.name,
          description: data.description || undefined,
          isActive: data.isActive,
        });
        toast.success('Categoría creada exitosamente');
        reset();
      }
      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Error al guardar la categoría';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-50 p-3 rounded-xl">
          <PenLine className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">
            {category ? 'Editar Categoría' : 'Ingreso Manual'}
          </h3>
          <p className="text-sm text-slate-500">
            {category ? 'Modificar la información de la categoría.' : 'Crear una nueva categoría individualmente.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
        {/* Code Field */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Código</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Generar automáticamente"
                className={`bg-slate-50/50 ${errors.code ? 'border-red-500' : ''}`}
                {...register('code')}
                readOnly={!!category}
              />
              {errors.code && (
                <span className="text-xs text-red-500 mt-1">{errors.code.message}</span>
              )}
            </div>
            {!category && (
              <Button
                type="button"
                className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-3"
                onClick={generateCode}
                disabled={isGeneratingCode}
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nombre de la Categoría</Label>
          <Input
            placeholder="Ej. Electrodomésticos"
            className={errors.name ? 'border-red-500' : ''}
            {...register('name')}
          />
          {errors.name && (
            <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Descripción <span className="text-slate-400 font-normal normal-case">(Opcional)</span>
          </Label>
          <Textarea
            placeholder="Breve descripción de la categoría..."
            className="resize-none h-32"
            {...register('description')}
          />
        </div>

        {/* Status Field */}
        <div className="space-y-3 pt-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Estado</Label>
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue('isActive', e.target.checked)}
            />
            <span className="text-sm font-medium text-slate-700">Activo</span>
          </div>
        </div>

        <div className="border-t border-slate-100 my-6"></div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-6 rounded-lg text-base font-semibold shadow-lg shadow-sky-500/20 mt-auto"
          disabled={isSubmitting}
        >
          <Save className="h-5 w-5 mr-2" />
          {isSubmitting ? 'Guardando...' : (category ? 'Actualizar Categoría' : 'Guardar Categoría')}
        </Button>
      </form>
    </div>
  );
}

