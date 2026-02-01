import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button, Input, Label, Card } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      const response = await authService.login({ email: data.email, password: data.password });
      login(response.data); // Update global store
      toast.success('¡Bienvenido! Has iniciado sesión correctamente.');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Por favor verifica tus credenciales.';
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="p-8 shadow-xl border-none">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold font-headings text-foreground">Iniciar Sesión</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Ingresa tus credenciales para acceder a tu cuenta
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="usuario@jkesolutions.com"
            {...register('email')}
            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.email && (
            <span className="text-xs text-destructive font-medium">{errors.email.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.password && (
            <span className="text-xs text-destructive font-medium">{errors.password.message}</span>
          )}
        </div>

        <Button type="submit" variant="primary" className="w-full text-white font-bold" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Button>

        <div className="text-center pt-2">
          <a href="#" className="text-sm text-primary hover:underline hover:text-primary-hover font-medium">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </form>
    </Card>
  );
}
