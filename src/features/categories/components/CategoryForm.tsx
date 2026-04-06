import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PenLine, Wand2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { Category } from '@/services/category.service';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../hooks/useCategoryQueries';

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
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  const { register, handleSubmit, formState: { errors }, setValue, control, reset } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: category?.code || '',
      name: category?.name || '',
      description: category?.description || '',
      isActive: category?.isActive ?? true,
    },
  });

  const isActive = useWatch({ control, name: 'isActive' });
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const generateCode = () => {
    setIsGeneratingCode(true);
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const generatedCode = `CAT-${timestamp}-${random}`;
    setValue('code', generatedCode);
    setIsGeneratingCode(false);
  };

  const onSubmit = async (data: CategoryFormData) => {
    const payload = {
      code: data.code,
      name: data.name,
      description: data.description || undefined,
      isActive: data.isActive,
    };

    if (category) {
      updateMutation.mutate({ id: category.id, data: payload }, {
        onSuccess: () => onSuccess?.(),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
      });
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 lg:p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/20">
          <PenLine className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm uppercase tracking-tight">
            {category ? 'Editar Categoría' : 'Ingreso Manual'}
          </h3>
          <p className="text-[11px] text-muted-foreground font-medium">
            {category ? 'Modificar la información de la categoría.' : 'Crear una nueva categoría individualmente.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1 flex flex-col">
        {/* Code Field */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">Código</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Generar automáticamente"
                className={`bg-muted/20 h-9 text-xs ${errors.code ? 'border-destructive' : 'border-border'} text-foreground focus-visible:ring-primary/20`}
                {...register('code')}
                readOnly={!!category}
              />
              {errors.code && (
                <span className="text-[10px] text-destructive mt-1 font-medium">{errors.code.message}</span>
              )}
            </div>
            {!category && (
              <Button
                type="button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 w-9 px-0 shadow-lg shadow-primary/20 transition-all active:scale-95"
                onClick={generateCode}
                disabled={isGeneratingCode}
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Name Field */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">Nombre de la Categoría</Label>
          <Input
            placeholder="Ej. Electrodomésticos"
            className={`${errors.name ? 'border-destructive' : 'border-border'} bg-muted/20 h-9 text-xs text-foreground focus-visible:ring-primary/20`}
            {...register('name')}
          />
          {errors.name && (
            <span className="text-[10px] text-destructive mt-1 font-medium">{errors.name.message}</span>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">
            Descripción <span className="text-muted-foreground/50 font-normal normal-case">(Opcional)</span>
          </Label>
          <Textarea
            placeholder="Breve descripción de la categoría..."
            className="resize-none h-24 bg-muted/20 border-border text-xs text-foreground p-3 focus-visible:ring-primary/20"
            {...register('description')}
          />
        </div>

        {/* Status Field */}
        <div className="space-y-2 pt-1">
          <Label className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">Estado</Label>
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <span className="text-xs font-semibold text-foreground">Activo</span>
          </div>
        </div>

        <div className="border-t border-border my-4"></div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 mt-auto transition-all active:scale-95"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Guardando...'
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {category ? 'Actualizar Categoría' : 'Guardar Categoría'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
