import { useState, useRef, useEffect } from 'react';
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
import { Button, Input, Label, Card } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/auth.store';

const profileSchema = z.object({
    firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
    phone: z.string().optional().nullable(),
    documentType: z.string().optional().nullable(),
    documentNumber: z.string().optional().nullable(),
});

type ProfileSchema = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const role = useAuthStore((state) => state.role);
    const updateUser = useAuthStore((state) => state.updateUser);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.image || null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.person?.firstName || '',
            lastName: user?.person?.lastName || '',
            phone: user?.person?.phone || '',
            documentType: user?.person?.documentType?.id || '',
            documentNumber: user?.person?.documentNumber || '',
        },
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await userService.getMe();
                if (response.success) {
                    updateUser(response.data);
                    reset({
                        firstName: response.data.person?.firstName || '',
                        lastName: response.data.person?.lastName || '',
                        phone: response.data.person?.phone || '',
                        documentType: response.data.person?.documentType?.id || '',
                        documentNumber: response.data.person?.documentNumber || '',
                    });
                    if (response.data.image) {
                        setAvatarPreview(response.data.image);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // We don't necessarily want to toast error here as it might just be a first-time load issue
            }
        };

        fetchUserData();
    }, []); // Only fetch on mount to avoid infinite loops if reset/updateUser change

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
                } as any; // Cast to bypass strict type if response has different shape

                updateUser(updatedUser);
                toast.success('Perfil actualizado correctamente');
            }
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil';
            toast.error(errorMessage);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mi Perfil</h1>
                <p className="text-slate-500 mt-1">
                    Administra tu información personal y cómo otros usuarios te ven en la plataforma.
                </p>
            </div>

            <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl">
                <div className="p-8 space-y-8">
                    {/* Section Header */}
                    <div className="border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-bold text-slate-800">Información Personal</h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <div className="h-40 w-40 rounded-full bg-orange-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <UserIcon className="h-20 w-20 text-orange-300" />
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-2 bg-sky-500 p-2.5 rounded-full border-4 border-white text-white shadow-lg group-hover:bg-sky-600 transition-colors">
                                    <Camera className="h-5 w-5" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
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
                                            className="bg-slate-50 text-slate-500 border-slate-200 pr-10 cursor-not-allowed"
                                        />
                                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                                            className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none"
                                        >
                                            <option value="">Seleccione tipo</option>
                                            {user?.person?.documentType && (
                                                <option value={user.person.documentType.id}>
                                                    {user.person.documentType.name}
                                                </option>
                                            )}
                                            {/* In a real app, these would come from an API or shared constant */}
                                            {!user?.person?.documentType && (
                                                <>
                                                    <option value="DNI">DNI - Documento Nacional de Identidad</option>
                                                    <option value="NIE">NIE - Número de Identidad de Extranjero</option>
                                                </>
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
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-50 mt-8">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-6 rounded-xl font-bold h-auto shadow-sm transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
                                    disabled={isSubmitting || (!isDirty && avatarPreview === user?.image)}
                                >
                                    <Save className="w-5 h-5 mr-3" />
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
                <Card className="p-8 border-slate-100 shadow-sm rounded-2xl flex flex-col justify-between">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800">Rol del Usuario</h3>
                        <div className="flex items-center gap-2 bg-sky-50 text-sky-600 px-3 py-1.5 rounded-full w-fit">
                            <Shield className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{role?.name || 'Usuario'}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {role?.code === 'ADMIN'
                                ? 'Tienes acceso total a todas las configuraciones y módulos del sistema.'
                                : 'Tienes acceso a las funciones asignadas según tu nivel de permiso.'}
                        </p>
                    </div>
                </Card>

                {/* Last Connection */}
                <Card className="p-8 border-slate-100 shadow-sm rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        Última Conexión
                    </h3>
                    <div className="space-y-4">
                        {user?.sessions && user.sessions.length > 0 ? (
                            <>
                                <p className="text-sm text-slate-500">Sesión actual iniciada desde:</p>
                                <div className="space-y-1">
                                    <p className="text-2xl font-bold text-slate-800">
                                        {new Date(user.sessions[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <div className="flex flex-col gap-2 pt-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <MapPin className="h-3.5 w-3.5 text-sky-500" />
                                            <span>IP: {user.sessions[0].ipAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            <Shield className="h-3.5 w-3.5 text-sky-500" />
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
        </div>
    );
}
