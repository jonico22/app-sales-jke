import { useNavigate } from 'react-router-dom';
import { MailCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function SuccessModal({ isOpen, onClose, email }: SuccessModalProps) {
  const navigate = useNavigate();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Correo Enviado"
      size="sm"
    >
      <div className="flex flex-col items-center text-center space-y-5">
        <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
          <MailCheck className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">¡Revisa tu bandeja de entrada!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
            <span className="font-semibold text-foreground">{email}</span>.
            Si no lo encuentras, revisa tu carpeta de spam.
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full text-white font-bold h-11 text-sm shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-transform"
          onClick={() => navigate('/auth/login')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio de sesión
        </Button>
      </div>
    </Modal>
  );
}
