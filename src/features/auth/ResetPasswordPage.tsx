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

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/[0-9]/, { message: "Debe incluir al menos un número" })
    .regex(/[^a-zA-Z0-9]/, { message: "Debe incluir al menos un símbolo especial" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// type ResetPasswordSchema... (removed)

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
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await authService.resetPassword({ token, newPassword: result.data.password, turnstileToken });
      toast.success('¡Contraseña actualizada correctamente!');
      navigate('/auth/login');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Error al restablecer la contraseña.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-10 shadow-xl dark:shadow-none">
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
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
          error={errors.password}
        />

        {/* Confirm Password */}
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar Nueva Contraseña"
          error={errors.confirmPassword}
        />

        {/* Strength Meter */}
        <PasswordStrengthMeter password={passwordValue} />

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
