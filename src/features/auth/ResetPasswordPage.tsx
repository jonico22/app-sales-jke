import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
import { parseZodErrors } from './auth.utils';

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/[0-9]/, { message: "Debe incluir al menos un número" })
    .regex(/[^a-zA-Z0-9]/, { message: "Debe incluir al menos un símbolo especial" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [passwordValue, setPasswordValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error('Token inválido o faltante.');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    // Validate with Zod
    const result = resetPasswordSchema.safeParse(data);
    
    if (!result.success) {
      setErrors(parseZodErrors(result));
      setIsSubmitting(false);
      return;
    }

    try {
      await authService.resetPassword({ token, newPassword: result.data.password, turnstileToken });
      toast.success('¡Contraseña actualizada correctamente!');
      navigate('/auth/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al restablecer la contraseña.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-10 shadow-2xl dark:shadow-none border-none">
      <AuthHeader 
        title="Restablecer Contraseña" 
        description="Crea una nueva contraseña segura para tu cuenta" 
      />

      <form onSubmit={onSubmit} className="space-y-6">

        {/* New Password */}
        <PasswordInput
          id="password"
          name="password"
          label="Nueva Contraseña"
          className="h-12 text-base"
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
          error={errors.password ? { message: errors.password } : undefined}
        />

        {/* Confirm Password */}
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar Nueva Contraseña"
          className="h-12 text-base"
          error={errors.confirmPassword ? { message: errors.confirmPassword } : undefined}
        />

        {/* Strength Meter */}
        <PasswordStrengthMeter password={passwordValue} />

        <AuthTurnstile onTokenChange={(token) => setTurnstileToken(token)} />

        <Button
          type="submit"
          variant="primary"
          className="w-full text-white font-bold h-12 text-base shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.99]"
          disabled={isSubmitting || !turnstileToken}
        >
          {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/auth/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors font-bold gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>

      </form>
    </Card>
  );
}

