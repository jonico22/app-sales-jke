import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/services/auth.service';
import { societyService } from '@/services/society.service';
import { useAuthStore } from '@/store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { PERMISSIONS_QUERY_KEY } from '@/hooks/usePermissions';
import { Turnstile } from '@marsidev/react-turnstile';

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  // Handle Turnstile bypass for testing
  useEffect(() => {
    const isTest = searchParams.get('test') === 'true' || import.meta.env.MODE === 'test';
    if (isTest) {
      setTurnstileToken('test-token-bypass');
    }
  }, [searchParams]);

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  const queryClient = useQueryClient();

  const onSubmit = async (data: LoginSchema) => {
    try {
      const response = await authService.login({ 
        email: data.email, 
        password: data.password,
        turnstileToken 
      });
      
      // Remove existing permissions to ensure a clean state and show skeleton loader
      queryClient.removeQueries({ queryKey: PERMISSIONS_QUERY_KEY });

      login(response.data); // Update global store

      // Only load society data if password change is not mandatory
      // The backend likely blocks normal endpoints until the password is changed
      if (!response.data.user.mustChangePassword) {
        try {
          await societyService.getCurrent();
        } catch (err) {
          console.error('Failed to load initial society data', err);
        }
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast.success('¡Bienvenido! Has iniciado sesión correctamente.');

      // Navigation Logic
      const savedUrl = localStorage.getItem('redirectUrl');

      if (response.data.user.mustChangePassword) {
        navigate('/security');
      } else {
        if (savedUrl) {
          localStorage.removeItem('redirectUrl');
          navigate(savedUrl);
        } else {
          navigate('/');
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Por favor verifica tus credenciales.';
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="p-8 shadow-xl dark:shadow-none">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-destructive font-medium">{errors.password.message}</span>
          )}
        </div>




        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground"
          >
            Recordar correo
          </label>
        </div>

        {(searchParams.get('test') !== 'true' && import.meta.env.MODE !== 'test') && (
          <div className="flex justify-center py-2">
            <Turnstile
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken('')}
              onError={() => setTurnstileToken('')}
              options={{
                theme: 'light',
              }}
            />
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full text-white font-bold" 
          disabled={isSubmitting || !turnstileToken}
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Button>

        <div className="text-center pt-2">
          <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline hover:text-primary-hover font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>
    </Card >
  );
}
