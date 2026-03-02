import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus, Mail, Phone, Info } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, Input, Label } from '@/components/ui';
import { roleService, type Role } from '@/services/role.service';
import { userService } from '@/services/user.service';
import { isAxiosError } from 'axios';

const userSchema = z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    roleCode: z.string().min(1, 'Debe seleccionar un rol'),
});

type UserFormValues = z.infer<typeof userSchema>;

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            roleCode: '',
        }
    });

    useEffect(() => {
        if (isOpen) {
            fetchRoles();
            reset();
        }
    }, [isOpen, reset]);

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

    const onSubmit = async (data: UserFormValues) => {
        try {
            setIsSaving(true);
            await userService.createBusinessUser(data);
            toast.success('Usuario creado correctamente, se han enviado las credenciales por correo.');
            onSuccess();
        } catch (error) {
            console.error('Error creating user:', error);
            if (isAxiosError(error) && error.response?.status === 403) {
                toast.error(error.response.data?.message || 'Límite de usuarios alcanzado para su plan actual.');
            } else if (isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Ocurrió un error inesperado al crear el usuario.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Agregar Nuevo Usuario"
        >
            <div className="mb-6 -mt-2">
                <p className="text-sm text-slate-500">Complete los datos del perfil para el nuevo integrante.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-700">Nombres</Label>
                        <Input
                            id="firstName"
                            placeholder="Ej. Juan"
                            {...register('firstName')}
                            disabled={isSaving}
                            className="border-slate-200 text-slate-700 placeholder:text-slate-400 focus-visible:ring-sky-500/20"
                        />
                        {errors.firstName && (
                            <p className="text-xs text-red-500">{errors.firstName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-700">Apellidos</Label>
                        <Input
                            id="lastName"
                            placeholder="Ej. Pérez"
                            {...register('lastName')}
                            disabled={isSaving}
                            className="border-slate-200 text-slate-700 placeholder:text-slate-400 focus-visible:ring-sky-500/20"
                        />
                        {errors.lastName && (
                            <p className="text-xs text-red-500">{errors.lastName.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700">Email Corporativo</Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                placeholder="juan@jke.com"
                                {...register('email')}
                                className="pl-10 border-slate-200 text-slate-700 placeholder:text-slate-400 focus-visible:ring-sky-500/20"
                                disabled={isSaving}
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700">Teléfono</Label>
                        <div className="relative">
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+51 999 999 999"
                                {...register('phone')}
                                className="pl-10 border-slate-200 text-slate-700 placeholder:text-slate-400 focus-visible:ring-sky-500/20"
                                disabled={isSaving}
                            />
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                        {errors.phone && (
                            <p className="text-xs text-red-500">{errors.phone.message}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="roleCode" className="text-slate-700">Rol del Usuario</Label>
                    <div className="relative">
                        <select
                            id="roleCode"
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
                    <p className="text-xs text-slate-500">Define el nivel de acceso y permisos dentro de la plataforma.</p>
                    {errors.roleCode && (
                        <p className="text-xs text-red-500 mt-1">{errors.roleCode.message}</p>
                    )}
                </div>

                <div className="bg-sky-50/50 border border-sky-100 rounded-lg p-3 flex gap-3 text-sm text-slate-600 mt-2">
                    <Info className="w-5 h-5 text-[#56a3e2] shrink-0" />
                    <p>Se generará una <span className="font-semibold text-slate-700">contraseña temporal</span> de forma segura y se enviará automáticamente al email corporativo ingresado.</p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSaving}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-800"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSaving || isLoadingRoles}
                        className="bg-[#56a3e2] hover:bg-[#4a8ec5] text-white px-5 shadow-sm"
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full"></span>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Guardar Usuario
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
