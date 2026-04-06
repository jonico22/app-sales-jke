import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { isAxiosError } from 'axios';
import { AuthHeader } from './components/AuthHeader';
import { AuthTurnstile } from './components/AuthTurnstile';
import { SuccessModal } from './components/SuccessModal';
import { parseZodErrors } from './auth.utils';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo válido" }),
});

export default function ForgotPasswordPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    // Validate with Zod
    const result = forgotPasswordSchema.safeParse(data);
    
    if (!result.success) {
      setErrors(parseZodErrors(result));
      setIsSubmitting(false);
      return;
    }

    try {
      const email = result.data.email;
      await authService.forgotPassword({ email, turnstileToken });
      setSubmittedEmail(email);
      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error('Error in forgot password:', error);
      let errorMessage = 'Error al procesar la solicitud.';
      
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="p-10 shadow-2xl dark:shadow-none border-none text-center">
        <AuthHeader 
          title="Recuperar Contraseña" 
          description="Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña."
        />

        <form onSubmit={onSubmit} className="space-y-6 text-left">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold text-foreground">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nombre@empresa.com"
              className={`h-12 text-base transition-all ${errors.email ? "border-destructive focus-visible:ring-destructive" : "focus:border-primary focus:ring-4 focus:ring-primary/10"}`}
            />
            {errors.email && (
              <span className="text-xs text-destructive font-semibold animate-in fade-in slide-in-from-top-1 duration-200">{errors.email}</span>
            )}
          </div>

          <AuthTurnstile onTokenChange={(token) => setTurnstileToken(token)} />

          <Button
            type="submit"
            variant="primary"
            className="w-full text-white font-bold h-12 text-base shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.99]"
            disabled={isSubmitting || !turnstileToken}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
          </Button>

          <div className="text-center pt-4">
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

      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        email={submittedEmail} 
      />
    </>
  );
}

