import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft, Info } from 'lucide-react';
import { Button, Input, Label, Card } from '@/components/ui';
import { authService } from '@/services/auth.service';

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
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password', '');

  const strength = useMemo(() => {
    let score = 0;
    if (password.length > 0) {
      if (password.length >= 8) score += 33;
      if (/[0-9]/.test(password)) score += 33;
      if (/[^a-zA-Z0-9]/.test(password)) score += 34;
    }
    return Math.min(score, 100);
  }, [password]);

  const strengthColor = useMemo(() => {
    if (strength < 34) return 'bg-red-500';
    if (strength < 67) return 'bg-yellow-500';
    return 'bg-green-500';
  }, [strength]);

  const strengthText = useMemo(() => {
    if (strength === 0) return '';
    if (strength < 34) return 'Débil';
    if (strength < 67) return 'Media';
    return 'Fuerte';
  }, [strength]);

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!token) {
      toast.error('Token inválido o faltante.');
      return;
    }

    try {
      await authService.resetPassword({ token, newPassword: data.password });
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
    <Card className="p-10 shadow-xl border-none">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-headings text-foreground mb-2">Restablecer Contraseña</h1>
        <p className="text-sm text-muted-foreground text-[#64748B]">
          Crea una nueva contraseña segura para tu cuenta
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Nueva Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-destructive font-medium">{errors.password.message}</span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</span>
          )}
        </div>

        {/* Strength Meter */}
        <div className="bg-slate-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-700">Fortaleza de la contraseña</span>
            <span className="text-[#64748B] font-medium">
              {strengthText && `${strengthText} (${Math.round(strength)}%)`}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${strengthColor}`} 
              style={{ width: `${strength}%` }}
            ></div>
          </div>
          <div className="flex gap-2 items-start">
            <Info className="h-4 w-4 text-[#64748B] mt-0.5 shrink-0" />
            <p className="text-xs text-[#64748B] leading-snug">
              La contraseña debe tener al menos 8 caracteres, incluir un número y un símbolo especial.
            </p>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full text-white font-bold h-12 text-base shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-transform" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
        </Button>

        <div className="text-center pt-2">
          <Link 
            to="/auth/login" 
            className="inline-flex items-center text-sm text-[#64748B] hover:text-primary transition-colors font-medium gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
        

      </form>
    </Card>
  );
}
