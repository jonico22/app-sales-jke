import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChangePassword } from '../hooks/useChangePassword';

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: "La contraseña actual es requerida" }),
    newPassword: z.string().min(8, { message: "La nueva contraseña debe tener al menos 8 caracteres" })
        .regex(/[A-Za-z]/, { message: "Debe contener al menos una letra" })
        .regex(/[0-9]/, { message: "Debe contener al menos un número" }),
    confirmPassword: z.string().min(1, { message: "Debes confirmar la nueva contraseña" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { mutate: changePassword, isPending } = useChangePassword();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordSchema>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: ChangePasswordSchema) => {
        changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        }, {
            onSuccess: () => reset()
        });
    };

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-lg border border-primary/20">
                    <Lock className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-base font-bold text-foreground uppercase tracking-tight">Cambiar Contraseña</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Asegúrese de que su contraseña tenga al menos 8 caracteres y combine letras y números.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña actual</Label>
                    <div className="relative">
                        <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Introduce tu contraseña actual"
                            {...register('currentPassword')}
                            className={errors.currentPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors focus:outline-none"
                        >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.currentPassword && (
                        <p className="text-xs text-destructive font-medium mt-1">{errors.currentPassword.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva contraseña</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Mínimo 8 caracteres"
                                {...register('newPassword')}
                                className={errors.newPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors focus:outline-none"
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-xs text-destructive font-medium mt-1">{errors.newPassword.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Repite la nueva contraseña"
                                {...register('confirmPassword')}
                                className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-destructive font-medium mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="font-bold flex items-center shadow-sm"
                        disabled={isPending}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isPending ? 'Guardando...' : 'Guardar Contraseña'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
