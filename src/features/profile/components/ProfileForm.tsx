import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Lock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type User } from '@/services/auth.service';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

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

interface ProfileFormProps {
    user: User | null;
    profileData: any;
    avatarPreview: string | null;
}

export function ProfileForm({ user, profileData, avatarPreview }: ProfileFormProps) {
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileSchema>({
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
        if (profileData && !isDirty) {
            reset({
                firstName: profileData.person?.firstName || '',
                lastName: profileData.person?.lastName || '',
                phone: profileData.person?.phone || '',
                address: profileData.person?.address || '',
                documentType: profileData.person?.documentType?.code || '',
                documentNumber: profileData.person?.documentNumber || '',
                sexo: profileData.person?.sexo || 'MALE',
            });
        }
    }, [profileData, reset, isDirty]);

    const onSubmit = (data: ProfileSchema) => {
        updateProfile({
            ...data,
            image: avatarPreview,
        });
    };

    const hasChanges = isDirty || avatarPreview !== user?.image;

    return (
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
                    disabled={isPending || !hasChanges}
                    className="flex items-center gap-2"
                >
                    <Save className="w-5 h-5 mr-1" />
                    {isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}
