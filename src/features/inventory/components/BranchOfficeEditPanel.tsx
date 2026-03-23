import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { BRANCHES_QUERY_KEY } from '@/hooks/useBranches';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Save,
    Building2,
    MapPin,
    Phone,
    Mail,
    FileText,
    Hash,
    Wand2
} from 'lucide-react';
import { Button, Input, Label, Textarea, Switch } from '@/components/ui';
import { SlidePanel } from '@/components/shared/SlidePanel';
import { branchOfficeService, type BranchOffice } from '@/services/branch-office.service';
import { useSocietyStore } from '@/store/society.store';
import { toast } from 'sonner';

const branchOfficeSchema = z.object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }),
    code: z.string().min(1, { message: "El código es obligatorio" }),
    description: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email({ message: "Email inválido" }).optional().or(z.literal('')),
    isActive: z.boolean().default(true),
});

type BranchOfficeFormValues = z.infer<typeof branchOfficeSchema>;

interface BranchOfficeEditPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branchOfficeId: string | null;
    onSuccess?: () => void;
}

export function BranchOfficeEditPanel({
    open,
    onOpenChange,
    branchOfficeId,
    onSuccess,
}: BranchOfficeEditPanelProps) {
    const queryClient = useQueryClient();
    const society = useSocietyStore(state => state.society);
    const [isLoadingBranchOffice, setIsLoadingBranchOffice] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);

    const { register, handleSubmit, control, reset, setValue, formState: { errors, isSubmitting } } = useForm<BranchOfficeFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(branchOfficeSchema) as any,
        defaultValues: {
            name: '',
            code: '',
            description: '',
            address: '',
            phone: '',
            email: '',
            isActive: true,
        }
    });

    // Fetch branch office data when panel opens with a branchOfficeId
    useEffect(() => {
        if (!open) {
            reset({
                name: '',
                code: '',
                description: '',
                address: '',
                phone: '',
                email: '',
                isActive: true,
            });
            return;
        }

        if (branchOfficeId) {
            const fetchBranchOffice = async () => {
                setIsLoadingBranchOffice(true);
                try {
                    const response = await branchOfficeService.getById(branchOfficeId);
                    const branch: BranchOffice = response.data;
                    reset({
                        name: branch.name,
                        code: branch.code,
                        description: branch.description || '',
                        address: branch.address || '',
                        phone: branch.phone || '',
                        email: branch.email || '',
                        isActive: branch.isActive,
                    });
                } catch (error) {
                    console.error('Error fetching branch office:', error);
                    toast.error('Error al cargar la sucursal');
                    onOpenChange(false);
                } finally {
                    setIsLoadingBranchOffice(false);
                }
            };
            fetchBranchOffice();
        }
    }, [open, branchOfficeId, reset, onOpenChange]);

    const generateCode = () => {
        setIsGeneratingCode(true);
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        const generatedCode = `SUC-${timestamp}-${random}`;
        setValue('code', generatedCode, { shouldValidate: true });
        setIsGeneratingCode(false);
    };

    const onSubmit = async (data: BranchOfficeFormValues) => {
        try {
            if (branchOfficeId) {
                await branchOfficeService.update(branchOfficeId, {
                    name: data.name,
                    description: data.description || undefined,
                    address: data.address || undefined,
                    phone: data.phone || undefined,
                    email: data.email || undefined,
                    isActive: data.isActive,
                });
                toast.success('Sucursal actualizada exitosamente');
            } else {
                if (!society?.id) {
                    toast.error('No se pudo identificar la sociedad');
                    return;
                }
                await branchOfficeService.create({
                    ...data,
                    societyId: society.id,
                });
                toast.success('Sucursal creada exitosamente');
            }
 
            // Invalidate branches select cache to ensure all selectors are updated
            queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
 
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Error saving branch office:', error);
            toast.error(error.response?.data?.message || 'Error al guardar la sucursal');
        }
    };

    const footer = (
        <>
            <Button
                type="submit"
                form="branch-office-form"
                disabled={isSubmitting || isLoadingBranchOffice}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-wider"
            >
                <Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Guardando...' : branchOfficeId ? 'Guardar Cambios' : 'Crear Sucursal'}
            </Button>
            <Button
                variant="ghost"
                className="w-full h-10 text-muted-foreground hover:text-foreground hover:bg-muted font-bold text-[10px] uppercase tracking-wider transition-all"
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
            title={branchOfficeId ? "Editar Sucursal" : "Nueva Sucursal"}
            footer={footer}
        >
            {isLoadingBranchOffice ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <form id="branch-office-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="branch-code" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Código de Sucursal</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                    <Input
                                        id="branch-code"
                                        placeholder="Ej. SUC-001"
                                        {...register('code')}
                                        readOnly={!!branchOfficeId}
                                        className={errors.code ? "pl-9 border-destructive bg-destructive/10 h-10 text-xs" : "pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"}
                                    />
                                </div>
                                {!branchOfficeId && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 shrink-0 border-border bg-muted/30 hover:bg-muted hover:text-primary transition-all active:scale-95"
                                        onClick={generateCode}
                                        disabled={isGeneratingCode}
                                        title="Generar código"
                                    >
                                        <Wand2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {errors.code && <span className="text-[10px] font-medium text-destructive">{errors.code.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="branch-name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nombre de la Sucursal</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                <Input
                                    id="branch-name"
                                    placeholder="Ej. Sucursal Central"
                                    {...register('name')}
                                    className={errors.name ? "pl-9 border-destructive bg-destructive/10 h-10 text-xs" : "pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"}
                                />
                            </div>
                            {errors.name && <span className="text-[10px] font-medium text-destructive">{errors.name.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="branch-address" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Dirección <span className="text-muted-foreground/50 font-normal normal-case">(Opcional)</span>
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                <Input
                                    id="branch-address"
                                    placeholder="Ej. Av. Principal 123, Lima"
                                    {...register('address')}
                                    className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="branch-phone" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Teléfono <span className="text-muted-foreground/50 font-normal normal-case">(Opcional)</span>
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                    <Input
                                        id="branch-phone"
                                        placeholder="+51 987..."
                                        {...register('phone')}
                                        className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="branch-email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Email <span className="text-muted-foreground/50 font-normal normal-case">(Opcional)</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                                    <Input
                                        id="branch-email"
                                        placeholder="sucursal@ejemplo.com"
                                        {...register('email')}
                                        className={errors.email ? "pl-9 border-destructive bg-destructive/10 h-10 text-xs" : "pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"}
                                    />
                                </div>
                                {errors.email && <span className="text-[10px] font-medium text-destructive">{errors.email.message}</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="branch-description" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Descripción / Notas <span className="text-muted-foreground/50 font-normal normal-case">(Opcional)</span>
                            </Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground/50" />
                                <Textarea
                                    id="branch-description"
                                    placeholder="Información adicional sobre la sucursal..."
                                    className="pl-9 pr-3 py-3 bg-muted/30 border-border min-h-[100px] text-xs resize-none focus:bg-background transition-colors leading-relaxed"
                                    {...register('description')}
                                />
                            </div>
                        </div>

                        {/* Status Switch */}
                        <div className="flex items-center justify-between border-t border-border pt-6">
                            <div>
                                <Label htmlFor="branch-isActive" className="text-[10px] font-bold text-foreground uppercase tracking-wider">Estado de la Sucursal</Label>
                                <p className="text-[10px] text-muted-foreground font-medium">Habilitar para operaciones comerciales</p>
                            </div>
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field: { value, onChange, ...field } }) => (
                                    <Switch
                                        id="branch-isActive"
                                        checked={value}
                                        onChange={(e) => onChange(e.target.checked)}
                                        {...field}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </form>
            )}
        </SlidePanel>
    );
}
