import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button, Input, Label } from '@/components/ui';
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
            <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col bg-white">
                <SheetHeader className="px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <SheetTitle>Editar Usuario</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-firstName" className="text-slate-700 text-xs font-medium">Nombres</Label>
                                <Input
                                    id="edit-firstName"
                                    placeholder="Juan"
                                    {...register('firstName')}
                                    disabled={isSaving}
                                    className="border-slate-200 text-slate-700 focus-visible:ring-sky-500/20"
                                />
                                {errors.firstName && (
                                    <p className="text-xs text-red-500">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-lastName" className="text-slate-700 text-xs font-medium">Apellidos</Label>
                                <Input
                                    id="edit-lastName"
                                    placeholder="Pérez"
                                    {...register('lastName')}
                                    disabled={isSaving}
                                    className="border-slate-200 text-slate-700 focus-visible:ring-sky-500/20"
                                />
                                {errors.lastName && (
                                    <p className="text-xs text-red-500">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-phone" className="text-slate-700 text-xs font-medium">Teléfono</Label>
                            <Input
                                id="edit-phone"
                                type="tel"
                                placeholder="+51 999 999 999"
                                {...register('phone')}
                                disabled={isSaving}
                                className="border-slate-200 text-slate-700 focus-visible:ring-sky-500/20"
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-500">{errors.phone.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-email" className="text-slate-700 text-xs font-medium">Correo Electrónico</Label>
                            <div className="relative">
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={user?.email || ''}
                                    className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed pr-10"
                                    disabled
                                    readOnly
                                />
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            <p className="text-[11px] text-slate-400 italic">El correo electrónico no puede ser modificado por seguridad.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-roleCode" className="text-slate-700 text-xs font-medium">Rol</Label>
                            <div className="relative">
                                <select
                                    id="edit-roleCode"
                                    {...register('roleCode')}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 appearance-none disabled:opacity-50"
                                    disabled={isSaving || isLoadingRoles}
                                >
                                    <option value="" className="text-slate-400">Seleccionar Rol</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.code} className="text-slate-700">
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            {errors.roleCode && (
                                <p className="text-xs text-red-500 mt-1">{errors.roleCode.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <Label htmlFor="edit-status" className="text-slate-700 text-sm font-medium">Estado del Usuario</Label>
                                <p className="text-[11px] text-slate-500 mt-0.5">Activar o desactivar acceso al sistema</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setValue('isActive', !isActiveWatch)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#56a3e2] focus-visible:ring-offset-2 ${isActiveWatch ? 'bg-[#56a3e2]' : 'bg-slate-200'}`}
                                role="switch"
                                aria-checked={isActiveWatch}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActiveWatch ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 flex flex-col gap-3">
                    <Button
                        type="submit"
                        form="edit-user-form"
                        disabled={isSaving || isLoadingRoles}
                        className="w-full bg-[#56a3e2] hover:bg-[#4a8ec5] text-white py-2.5 h-auto text-sm font-medium"
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full"></span>
                                Guardando...
                            </>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving}
                        className="w-full bg-white border-slate-200 text-slate-700 py-2.5 h-auto text-sm font-medium hover:bg-slate-50 hover:text-slate-800"
                    >
                        Cancelar
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
