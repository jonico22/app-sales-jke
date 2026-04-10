import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { PERMISSIONS_QUERY_KEY } from '@/hooks/usePermissions';

import { AuthHeader } from './components/AuthHeader';
import { PasswordInput } from './components/PasswordInput';
import { AuthTurnstile } from './components/AuthTurnstile';
import { parseZodErrors } from './auth.utils';
import { sessionRedirect } from '@/utils/session-redirect';

async function validateLogin(data: Record<string, FormDataEntryValue>) {
  const { z } = await import('zod');
  const loginSchema = z.object({
    email: z.string().email({ message: "Por favor ingresa un correo válido" }),
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  });
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    return { success: false as const, errors: parseZodErrors(result) };
  }

  return { success: true as const, data: result.data };
}

export default function LoginPage() {
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
    
    // Load Zod only when the user submits, keeping the first render lighter.
    const result = await validateLogin(data);
    
    if (!result.success) {
      setErrors(result.errors);
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

      // Only load society data if password change is not mandatory
      if (!response.data.user.mustChangePassword) {
        try {
          const { societyService } = await import('@/services/society.service');
          await societyService.getCurrent(response.data.token);
        } catch (err) {
          console.error('Failed to load initial society data', err);
        }
      }

      login(response.data); // Update global store after preloading auth-dependent data

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', loginData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast.success('¡Bienvenido! Has iniciado sesión correctamente.');

      // Navigation Logic
      const savedUrl = sessionRedirect.consume();

      if (response.data.user.mustChangePassword) {
        window.location.assign('/security');
      } else {
        if (savedUrl) {
          window.location.assign(savedUrl);
        } else {
          window.location.assign('/');
        }
      }
    } catch (error: unknown) {
      console.error('Error in login:', error);
      let errorMessage = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
      
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-8 shadow-2xl dark:shadow-none border-none">
      <AuthHeader 
        title="Iniciar Sesión" 
        description="Ingresa tus credenciales para acceder a tu cuenta" 
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium">Correo Electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            placeholder="usuario@jkesolutions.com"
            className={`h-12 text-base transition-all ${errors.email ? "border-destructive focus-visible:ring-destructive" : "focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
          />
          {errors.email && (
            <span className="text-xs text-destructive font-semibold animate-in fade-in slide-in-from-top-1 duration-200">{errors.email}</span>
          )}
        </div>

        <PasswordInput
          id="password"
          name="password"
          label="Contraseña"
          className="h-12 text-base"
          error={errors.password ? { message: errors.password } : undefined}
        />

        <div className="flex items-center space-x-2 py-1">
          <Checkbox
            id="remember"
            name="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <Label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground select-none"
          >
            Recordar correo
          </Label>
        </div>

        <AuthTurnstile onTokenChange={(token) => setTurnstileToken(token)} />

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full text-white font-bold h-12 text-base shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.99]" 
          disabled={isSubmitting || !turnstileToken}
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Button>

        <div className="text-center pt-2">
          <a href="/auth/forgot-password" className="text-sm text-primary hover:underline hover:text-primary-hover font-bold transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </form>
    </Card>
  );
}
