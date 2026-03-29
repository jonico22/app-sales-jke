import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
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

import { AuthHeader } from './components/AuthHeader';
import { PasswordInput } from './components/PasswordInput';
import { AuthTurnstile } from './components/AuthTurnstile';

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

// type LoginSchema... (removed)

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultEmail, setDefaultEmail] = useState('');

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setDefaultEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const queryClient = useQueryClient();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    // Validate with Zod
    const result = loginSchema.safeParse(data);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const loginData = result.data;
      const response = await authService.login({ 
        email: loginData.email, 
        password: loginData.password,
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
        localStorage.setItem('rememberedEmail', loginData.email);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-8 shadow-xl dark:shadow-none">
      <AuthHeader 
        title="Iniciar Sesión" 
        description="Ingresa tus credenciales para acceder a tu cuenta" 
      />

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            placeholder="usuario@jkesolutions.com"
            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.email && (
            <span className="text-xs text-destructive font-medium">{errors.email}</span>
          )}
        </div>

        <PasswordInput
          id="password"
          name="password"
          label="Contraseña"
          error={errors.password ? { message: errors.password } : undefined}
        />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            name="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <Label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground"
          >
            Recordar correo
          </Label>
        </div>

        <AuthTurnstile onTokenChange={setTurnstileToken} />

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
    </Card>
  );
}
