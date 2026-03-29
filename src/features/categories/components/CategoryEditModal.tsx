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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { Category } from '@/services/category.service';
import { generateSku } from '@/lib/utils';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../hooks/useCategoryQueries';

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
  onSave: () => void;
}

export function CategoryEditModal({
  open,
  onOpenChange,
  category,
  onSave,
}: CategoryEditModalProps) {
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
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
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Populate form when category changes
  useEffect(() => {
    if (category) {
      reset({
        code: category.code,
        name: category.name,
        description: category.description || '',
        active: category.isActive,
      });
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        active: true,
      });
    }
  }, [category, reset]);

  const handleGenerateCode = () => {
    const code = `CAT-${generateSku().split('-')[2] || Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setValue('code', code, { shouldValidate: true });
  };

  const onSubmit = async (data: EditCategoryFormValues) => {
    const payload = {
      code: data.code,
      name: data.name,
      description: data.description || undefined,
      isActive: data.active,
    };

    if (category) {
      updateMutation.mutate({ id: category.id, data: payload }, {
        onSuccess: () => {
          onSave();
          onOpenChange(false);
        },
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onSave();
          onOpenChange(false);
          reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-border shadow-2xl">
        <div className="p-5 pb-0">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground uppercase tracking-tight">
              {category ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-5 space-y-5">
            {/* Code Field */}
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                Código <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  {...register('code')}
                  className="flex-1 font-mono text-xs bg-muted/20 border-border text-foreground h-9 focus-visible:ring-primary/20"
                  placeholder="CAT - 000"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 w-9 h-9 px-0 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={handleGenerateCode}
                  title="Generar código aleatorio"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/60 leading-tight">
                El código se genera automáticamente o puede ser personalizado.
              </p>
              {errors.code && (
                <p className="text-[10px] text-destructive mt-1 font-medium">{errors.code.message}</p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1">
                Nombre de la Categoría <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                className="bg-muted/20 border-border text-foreground text-xs h-9 focus-visible:ring-primary/20"
                placeholder="Ej. Electrónica"
              />
              {errors.name && (
                <p className="text-[10px] text-destructive mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                className="resize-none min-h-[80px] bg-muted/20 border-border text-foreground text-xs p-3 focus-visible:ring-primary/20"
                placeholder="Breve descripción de la categoría..."
              />
            </div>

            {/* Status Field */}
            <div className="space-y-2 pt-1">
              <Label className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                Estado
              </Label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('active', checked)}
                />
                <span className="text-xs font-semibold text-foreground">
                  {isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-muted/20 border-t border-border mt-0 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground font-bold text-[10px] uppercase tracking-wider h-9"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-6 h-9 font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95"
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
