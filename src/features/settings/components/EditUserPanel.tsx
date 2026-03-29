import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { roleService, type Role } from '@/services/role.service';
import { userService, type BusinessUser } from '@/services/user.service';
import { isAxiosError } from 'axios';

const editUserSchema = z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    phone: z.string().optional(),
    roleCode: z.string().min(1, 'Debe seleccionar un rol'),
    isActive: z.boolean(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserPanelProps {
    isOpen: boolean;
    onClose: () => void;
    user: BusinessUser | null;
    onSuccess: () => void;
}

export function EditUserPanel({ isOpen, onClose, user, onSuccess }: EditUserPanelProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            roleCode: '',
            isActive: true,
        }
    });

    const isActiveWatch = watch('isActive');

    useEffect(() => {
        if (user) {
            reset({
                firstName: user.person?.firstName || '',
                lastName: user.person?.lastName || '',
                phone: user.person?.phone || '',
                roleCode: user.role?.code || '',
                isActive: user.isActive,
            });
        }
    }, [user, reset]);

    useEffect(() => {
        if (isOpen) {
            fetchRoles();
        }
    }, [isOpen]);

    // Robust role selection: Sync form when both user and roles are available
    useEffect(() => {
        if (user && roles.length > 0) {
            const currentRoleCode = user.role?.code || '';
            const baseRoleCode = currentRoleCode.split('-')[0];
            
            // Try to find exact match first, then base match
            const matchedRole = roles.find(r => r.code === currentRoleCode) || 
                               roles.find(r => r.code === baseRoleCode);
            
            if (matchedRole) {
                setValue('roleCode', matchedRole.code);
            }
        }
    }, [user, roles, setValue]);

    const fetchRoles = async () => {
        try {
            setIsLoadingRoles(true);
            const response = await roleService.getRoles();
            if (response.data) {
                setRoles(response.data);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Error al cargar la lista de roles');
        } finally {
            setIsLoadingRoles(false);
        }
    };

    const onSubmit = async (data: EditUserFormValues) => {
        if (!user) return;

        try {
            setIsSaving(true);
            const updatePayload = {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone || undefined,
                roleCode: data.roleCode,
            };

            await userService.updateBusinessUser(user.id, updatePayload);
            toast.success('Usuario actualizado correctamente.');
            onSuccess();
        } catch (error) {
            console.error('Error updating user:', error);
            if (isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Error al actualizar el usuario');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col bg-background border-l border-border shadow-2xl">
                <SheetHeader className="px-5 py-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
                    <SheetTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Editar Usuario</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-firstName" className="text-foreground text-[11px] font-bold uppercase tracking-wider">Nombres</Label>
                                <Input
                                    id="edit-firstName"
                                    placeholder="Juan"
                                    {...register('firstName')}
                                    disabled={isSaving}
                                    className="h-9 border-border bg-muted/20 text-xs focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 rounded-lg"
                                />
                                {errors.firstName && (
                                    <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-tight">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-lastName" className="text-foreground text-[11px] font-bold uppercase tracking-wider">Apellidos</Label>
                                <Input
                                    id="edit-lastName"
                                    placeholder="Pérez"
                                    {...register('lastName')}
                                    disabled={isSaving}
                                    className="h-9 border-border bg-muted/20 text-xs focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 rounded-lg"
                                />
                                {errors.lastName && (
                                    <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-tight">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-phone" className="text-foreground text-[11px] font-bold uppercase tracking-wider">Teléfono</Label>
                            <Input
                                id="edit-phone"
                                type="tel"
                                placeholder="+51 999 999 999"
                                {...register('phone')}
                                disabled={isSaving}
                                className="h-9 border-border bg-muted/20 text-xs focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 rounded-lg"
                            />
                            {errors.phone && (
                                <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-tight">{errors.phone.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-email" className="text-foreground text-[11px] font-bold uppercase tracking-wider">Correo Electrónico</Label>
                            <div className="relative">
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={user?.email || ''}
                                    className="h-9 bg-muted/30 border-border text-muted-foreground/60 cursor-not-allowed pr-10 text-xs rounded-lg font-medium"
                                    disabled
                                    readOnly
                                />
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 italic font-medium">El correo electrónico no puede ser modificado por seguridad.</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-roleCode" className="text-foreground text-[11px] font-bold uppercase tracking-wider">Rol</Label>
                            <div className="relative">
                                <select
                                    id="edit-roleCode"
                                    {...register('roleCode')}
                                    className="w-full h-9 px-3 bg-muted/20 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none disabled:opacity-50 font-medium"
                                    disabled={isSaving || isLoadingRoles}
                                >
                                    <option value="" className="text-muted-foreground/40">Seleccionar Rol</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.code} className="bg-card text-foreground">
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/60">
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            {errors.roleCode && (
                                <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-tight">{errors.roleCode.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div>
                                <Label htmlFor="edit-status" className="text-foreground text-[11px] font-bold uppercase tracking-wider">Estado del Usuario</Label>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5 italic">Activar o desactivar acceso al sistema</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setValue('isActive', !isActiveWatch)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 ${isActiveWatch ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                                role="switch"
                                aria-checked={isActiveWatch}
                            >
                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${isActiveWatch ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-border bg-background/80 backdrop-blur-md sticky bottom-0 flex flex-col gap-3">
                    <Button
                        type="submit"
                        form="edit-user-form"
                        variant="primary"
                        size="sm"
                        disabled={isSaving || isLoadingRoles}
                        className="w-full h-9 rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-sm shadow-primary/20"
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin w-3.5 h-3.5 mr-2 border-2 border-white/20 border-t-white rounded-full"></span>
                                Guardando...
                            </>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={isSaving}
                        className="w-full h-9 rounded-lg font-bold text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                        Cancelar
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
