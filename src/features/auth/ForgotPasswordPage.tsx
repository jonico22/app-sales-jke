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
import { AuthHeader } from './components/AuthHeader';
import { AuthTurnstile } from './components/AuthTurnstile';
import { SuccessModal } from './components/SuccessModal';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo válido" }),
});

// type ForgotPasswordSchema... (removed)

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
      const email = result.data.email;
      await authService.forgotPassword({ email, turnstileToken });
      setSubmittedEmail(email);
      setShowSuccessModal(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Error al procesar la solicitud.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="p-10 shadow-xl dark:shadow-none text-center">
        <AuthHeader 
          title="Recuperar Contraseña" 
          description="Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña."
        />

        <form onSubmit={onSubmit} className="space-y-6 text-left">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium text-foreground">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nombre@empresa.com"
              className={errors.email ? "border-destructive focus-visible:ring-destructive h-12" : "h-12"}
            />
            {errors.email && (
              <span className="text-xs text-destructive font-medium">{errors.email}</span>
            )}
          </div>

          <AuthTurnstile onTokenChange={setTurnstileToken} />

          <Button
            type="submit"
            variant="primary"
            className="w-full text-white font-bold h-12 text-base shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-transform"
            disabled={isSubmitting || !turnstileToken}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
          </Button>

          <div className="text-center pt-4">
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

      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        email={submittedEmail} 
      />
    </>
  );
}
