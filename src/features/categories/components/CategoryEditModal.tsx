import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button, Input, Label, Textarea, Switch } from '@/components/ui';
import type { Category } from '@/services/category.service';
import { categoryService } from '@/services/category.service';
import { toast } from 'sonner';
import { generateSku } from '@/lib/utils';

// Schema Definition
const editCategorySchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  active: z.boolean().optional(),
});

type EditCategoryFormValues = z.infer<typeof editCategorySchema>;

interface CategoryEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSave: (data: EditCategoryFormValues) => void;
}

export function CategoryEditModal({
  open,
  onOpenChange,
  category,
  onSave,
}: CategoryEditModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditCategoryFormValues>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      active: true,
    },
  });

  const isActive = watch('active');

  // Populate form when category changes
  useEffect(() => {
    if (category) {
      reset({
        code: category.code,
        name: category.name,
        description: category.description || '',
        active: category.isActive,
      });
    }
  }, [category, reset]);


  const handleGenerateCode = () => {
    // Generate a simple code like CAT-123456
    const code = `CAT-${generateSku().split('-')[2] || Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setValue('code', code, { shouldValidate: true });
  };

  const onSubmit = async (data: EditCategoryFormValues) => {
    try {
      if (category) {
        // Edit mode
        await categoryService.update(category.id, {
          code: data.code,
          name: data.name,
          description: data.description || undefined,
          isActive: data.active,
        });
        toast.success('Categoría actualizada exitosamente');
      } else {
        // Create mode
        await categoryService.create({
          code: data.code,
          name: data.name,
          description: data.description || undefined,
          isActive: data.active,
        });
        toast.success('Categoría creada exitosamente');
      }

      onSave(data);
      onOpenChange(false);
      reset(); // Reset form after successful submission
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la categoría');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">
              {category ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="p-6 space-y-6">
            {/* Code Field */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                Código <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  {...register('code')}
                  className="flex-1 font-mono text-slate-700 bg-white"
                  placeholder="CAT - 000"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 w-9 px-0 bg-sky-50 border-sky-100 text-sky-500 hover:bg-sky-100 hover:text-sky-600"
                  onClick={handleGenerateCode}
                  title="Generar código aleatorio"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[11px] text-slate-400">
                El código se genera automáticamente o puede ser personalizado.
              </p>
              {errors.code && (
                <p className="text-xs text-red-500">{errors.code.message}</p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                Nombre de la Categoría <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                className="bg-white text-slate-800"
                placeholder="Ej. Electrónica"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                className="resize-none min-h-[100px] bg-white text-slate-600"
                placeholder="Breve descripción de la categoría..."
              />
            </div>

            {/* Status Field */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Estado
              </Label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={isActive}
                  onChange={(e) => setValue('active', e.target.checked)}
                />
                <span className="text-sm font-medium text-slate-700">
                  {isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 mt-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-500 hover:text-slate-700 font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-sky-500/20 px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (category ? 'Guardar Cambios' : 'Crear Categoría')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
