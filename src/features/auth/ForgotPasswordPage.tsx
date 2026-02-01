import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button, Input, Label, Card } from '@/components/ui';
import { authService } from '@/services/auth.service';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo válido" }),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await authService.forgotPassword({ email: data.email });
      toast.success('Si tu correo está registrado, recibirás las instrucciones pronto.');
      // Optionally redirect to login or show a success message in place
      // navigate('/login'); 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Error al procesar la solicitud.';
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="p-10 shadow-xl border-none text-center">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-headings text-foreground mb-3">Recuperar Contraseña</h1>
        <p className="text-sm text-muted-foreground leading-relaxed px-4">
          Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium text-slate-700">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="nombre@empresa.com"
            {...register('email')}
            className={errors.email ? "border-destructive focus-visible:ring-destructive h-12" : "h-12"}
          />
          {errors.email && (
            <span className="text-xs text-destructive font-medium">{errors.email.message}</span>
          )}
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full text-white font-bold h-12 text-base shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-transform" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
        </Button>

        <div className="text-center pt-4">
          <Link 
            to="/auth/login" 
            className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors font-medium gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </Card>
  );
}
