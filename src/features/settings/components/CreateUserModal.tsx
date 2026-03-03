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
            <div className="mb-5 -mt-2">
                <p className="text-[11px] text-muted-foreground font-medium italic">Complete los datos del perfil para el nuevo integrante del equipo.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-foreground text-[11px] font-bold uppercase tracking-wider">Nombres</Label>
                        <Input
                            id="firstName"
                            placeholder="Ej. Juan"
                            {...register('firstName')}
                            disabled={isSaving}
                            className="h-9 border-border bg-muted/20 text-xs focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 rounded-lg"
                        />
                        {errors.firstName && (
                            <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-tight">{errors.firstName.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-foreground text-[11px] font-bold uppercase tracking-wider">Apellidos</Label>
                        <Input
                            id="lastName"
                            placeholder="Ej. Pérez"
                            {...register('lastName')}
                            disabled={isSaving}
                            className="h-9 border-border bg-muted/20 text-xs focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 rounded-lg"
                        />
                        {errors.lastName && (
                            <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-tight">{errors.lastName.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-foreground text-[11px] font-bold uppercase tracking-wider">Email Corporativo</Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                placeholder="juan@jke.com"
                                {...register('email')}
                                className="pl-9 h-9 border-border bg-muted/20 text-xs focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 rounded-lg"
                                disabled={isSaving}
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                        </div>
                        {errors.email && (
                            <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-tight">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-foreground text-[11px] font-bold uppercase tracking-wider">Teléfono</Label>
                        <div className="relative">
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+51 999 999 999"
                                {...register('phone')}
                                className="pl-9 h-9 border-border bg-muted/20 text-xs focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 rounded-lg"
                                disabled={isSaving}
                            />
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                        </div>
                        {errors.phone && (
                            <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-tight">{errors.phone.message}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="roleCode" className="text-foreground text-[11px] font-bold uppercase tracking-wider">Rol del Usuario</Label>
                    <div className="relative">
                        <select
                            id="roleCode"
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
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">Define el nivel de acceso y permisos dentro de la plataforma.</p>
                    {errors.roleCode && (
                        <p className="text-[10px] font-bold text-danger mt-1 uppercase tracking-tight">{errors.roleCode.message}</p>
                    )}
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-3 text-[11px] text-muted-foreground font-medium mt-1">
                    <Info className="w-4 h-4 text-primary shrink-0" />
                    <p>Se generará una <span className="font-bold text-primary">contraseña temporal</span> de forma segura y se enviará automáticamente al email corporativo ingresado.</p>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={isSaving}
                        className="h-8 px-4 rounded-lg font-bold text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isSaving || isLoadingRoles}
                        className="h-8 px-5 rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-sm flex items-center shadow-primary/20"
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin w-3.5 h-3.5 mr-2 border-2 border-white/20 border-t-white rounded-full"></span>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-3.5 h-3.5 mr-2" />
                                Guardar Usuario
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
