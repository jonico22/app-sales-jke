import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    User as UserIcon,
    Save,
    Camera,
    Shield,
    MapPin,
    ChevronRight,
    Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { useQueryClient } from '@tanstack/react-query';
import { useUserProfileQuery, USER_PROFILE_QUERY_KEY } from '@/hooks/useUserProfileQuery';
import { useAuthStore } from '@/store/auth.store';
import { AvatarSelectionModal } from './components/AvatarSelectionModal';

const profileSchema = z.object({
    firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    documentType: z.string().optional().nullable(),
    documentNumber: z.string().optional().nullable(),
    sexo: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
});

type ProfileSchema = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const role = useAuthStore((state) => state.role);
    const updateUser = useAuthStore((state) => state.updateUser);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.image || null);

    const { data: profileResponse } = useUserProfileQuery();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.person?.firstName || '',
            lastName: user?.person?.lastName || '',
            phone: user?.person?.phone || '',
            address: user?.person?.address || '',
            documentType: user?.person?.documentType?.code || '',
            documentNumber: user?.person?.documentNumber || '',
            sexo: user?.person?.sexo || 'MALE',
        },
    });

    // Sync form with fresh data from /users/me
    useEffect(() => {
        if (profileResponse?.data && !isDirty) {
            const freshUser = profileResponse.data;
            updateUser(freshUser);
            reset({
                firstName: freshUser.person?.firstName || '',
                lastName: freshUser.person?.lastName || '',
                phone: freshUser.person?.phone || '',
                address: freshUser.person?.address || '',
                documentType: freshUser.person?.documentType?.code || '',
                documentNumber: freshUser.person?.documentNumber || '',
                sexo: freshUser.person?.sexo || 'MALE',
            });
            if (freshUser.image) {
                setAvatarPreview(freshUser.image);
            }
        }
    }, [profileResponse, reset, updateUser, isDirty]);



    const queryClient = useQueryClient();

    const onSubmit = async (data: ProfileSchema) => {
        try {
            const response = await authService.updateProfile({
                ...data,
                image: avatarPreview,
            });

            if (response.success) {
                // Ensure we merge with existing user to prevent missing fields (like emailVerified) 
                // which would cause an infinite redirect loop in ProtectedRoute
                const updatedUser = {
                    ...user,
                    ...response.data,
                    image: avatarPreview || user?.image,
                } as any; // Cast to bypass strict type if response has different shape

                updateUser(updatedUser);
                
                // Invalidate queries to refresh background data
                queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
                queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

                toast.success('Perfil actualizado correctamente');
            }
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil';
            toast.error(errorMessage);
        }
    };

    const handleAvatarClick = () => {
        setIsAvatarModalOpen(true);
    };

    const handleAvatarConfirm = (url: string, updatedUser: any) => {
        setAvatarPreview(url);

        // Update global user store with the merged data
        const mergedUser = {
            ...user,
            ...updatedUser,
            image: url, // Explicitly update image in store
        };
        updateUser(mergedUser);
    };


    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Mi Perfil</h1>
                <p className="text-muted-foreground text-xs mt-1">
                    Administra tu información personal y cómo otros usuarios te ven en la plataforma.
                </p>
            </div>

            <Card className="border-border shadow-sm overflow-hidden rounded-2xl">
                <div className="p-8 space-y-8">
                    {/* Section Header */}
                    <div className="border-b border-border pb-4">
                        <h2 className="text-base font-bold text-foreground uppercase tracking-tight">Información Personal</h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <div className="h-40 w-40 rounded-full bg-primary/10 border-4 border-background shadow-md flex items-center justify-center overflow-hidden">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <UserIcon className="h-20 w-20 text-orange-300" />
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-2 bg-primary p-2.5 rounded-full border-4 border-background text-primary-foreground shadow-lg group-hover:bg-primary/90 transition-colors">
                                    <Camera className="h-5 w-5" />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAvatarClick}
                                className="text-sky-500 font-bold text-sm hover:text-sky-600 transition-colors"
                            >
                                Cambiar foto
                            </button>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Nombres</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Tu nombre"
                                        {...register('firstName')}
                                        className={errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors.firstName && (
                                        <p className="text-xs text-destructive font-medium mt-1">{errors.firstName.message}</p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Apellidos</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Tus apellidos"
                                        {...register('lastName')}
                                        className={errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                    {errors.lastName && (
                                        <p className="text-xs text-destructive font-medium mt-1">{errors.lastName.message}</p>
                                    )}
                                </div>

                                {/* Email (Read Only) */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="bg-muted/30 text-muted-foreground border-border pr-10 cursor-not-allowed text-xs"
                                        />
                                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    </div>
                                </div>

                                {/* Sexo */}
                                <div className="space-y-2">
                                    <Label htmlFor="sexo">Sexo</Label>
                                    <div className="relative">
                                        <select
                                            id="sexo"
                                            {...register('sexo')}
                                            className="w-full h-10 px-3 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent appearance-none"
                                        >
                                            <option value="MALE">Masculino</option>
                                            <option value="FEMALE">Femenino</option>
                                            <option value="OTHER">Otro</option>
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+34 600 000 000"
                                        {...register('phone')}
                                    />
                                </div>

                                {/* Document Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="documentType">Tipo de Documento</Label>
                                    <div className="relative">
                                        <select
                                            id="documentType"
                                            {...register('documentType')}
                                            className="w-full h-10 px-3 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent appearance-none"
                                        >
                                            <option value="">Seleccione tipo</option>
                                            <option value="DNI">DNI - Documento Nacional de Identidad</option>
                                            <option value="RUC">RUC - Registro Único de Contribuyentes</option>
                                            <option value="CE">C.E. - Carné de Extranjería</option>
                                            <option value="PASSPORT">Pasaporte</option>
                                            {user?.person?.documentType && !['DNI', 'RUC', 'CE', 'PASSPORT'].includes(user.person.documentType.code) && (
                                                <option value={user.person.documentType.id}>
                                                    {user.person.documentType.name}
                                                </option>
                                            )}
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Document Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="documentNumber">Número de Documento</Label>
                                    <Input
                                        id="documentNumber"
                                        placeholder="12345678X"
                                        {...register('documentNumber')}
                                    />
                                </div>

                                {/* Address */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Dirección Fisica</Label>
                                    <Input
                                        id="address"
                                        placeholder="Ej. Calle Principal 123..."
                                        {...register('address')}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-border mt-8">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={isSubmitting || (!isDirty && avatarPreview === user?.image)}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="w-5 h-5 mr-1" />
                                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </Card>

            {/* Bottom Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                {/* Role Information */}
                <Card className="p-8 border-border shadow-sm rounded-2xl flex flex-col justify-between">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Rol del Usuario</h3>
                        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full w-fit border border-primary/20">
                            <Shield className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{role?.name || 'Usuario'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {role?.code === 'ADMIN'
                                ? 'Tienes acceso total a todas las configuraciones y módulos del sistema.'
                                : 'Tienes acceso a las funciones asignadas según tu nivel de permiso.'}
                        </p>
                    </div>
                </Card>

                {/* Last Connection */}
                <Card className="p-8 border-border shadow-sm rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
                        Última Conexión
                    </h3>
                    <div className="space-y-4">
                        {user?.sessions && user.sessions.length > 0 ? (
                            <>
                                <p className="text-xs text-muted-foreground">Sesión actual iniciada desde:</p>
                                <div className="space-y-1">
                                    <p className="text-2xl font-bold text-foreground">
                                        {new Date(user.sessions[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <div className="flex flex-col gap-2 pt-2">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                            <MapPin className="h-3.5 w-3.5 text-primary" />
                                            <span>IP: {user.sessions[0].ipAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                            <Shield className="h-3.5 w-3.5 text-primary" />
                                            <span className="truncate max-w-[250px]">{user.sessions[0].userAgent}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-400">No hay información de sesiones recientes.</p>
                        )}
                    </div>
                </Card>
            </div>

            <AvatarSelectionModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onConfirm={handleAvatarConfirm}
                initialName={user?.person?.firstName || user?.name || ''}
            />
        </div>
    );
}
