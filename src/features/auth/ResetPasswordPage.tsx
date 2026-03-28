import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { AuthHeader } from './components/AuthHeader';
import { PasswordInput } from './components/PasswordInput';
import { AuthTurnstile } from './components/AuthTurnstile';
import { PasswordStrengthMeter } from './components/PasswordStrengthMeter';

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/[0-9]/, { message: "Debe incluir al menos un número" })
    .regex(/[^a-zA-Z0-9]/, { message: "Debe incluir al menos un símbolo especial" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!token) {
      toast.error('Token inválido o faltante.');
      return;
    }

    try {
      await authService.resetPassword({ token, newPassword: data.password, turnstileToken });
      toast.success('¡Contraseña actualizada correctamente!');
      navigate('/auth/login');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Error al restablecer la contraseña.';
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="p-10 shadow-xl dark:shadow-none">
      <AuthHeader 
        title="Restablecer Contraseña" 
        description="Crea una nueva contraseña segura para tu cuenta" 
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* New Password */}
        <PasswordInput
          id="password"
          label="Nueva Contraseña"
          registration={register('password')}
          error={errors.password}
        />

        {/* Confirm Password */}
        <PasswordInput
          id="confirmPassword"
          label="Confirmar Nueva Contraseña"
          registration={register('confirmPassword')}
          error={errors.confirmPassword}
        />

        {/* Strength Meter */}
        <PasswordStrengthMeter password={password} />

        <AuthTurnstile onTokenChange={setTurnstileToken} />

        <Button
          type="submit"
          variant="primary"
          className="w-full text-white font-bold h-12 text-base shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-transform"
          disabled={isSubmitting || !turnstileToken}
        >
          {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/auth/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors font-medium gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>

      </form>
    </Card>
  );
}
