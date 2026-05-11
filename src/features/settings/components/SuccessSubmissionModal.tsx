import { ClipboardCheck, Clock, Home } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface SuccessSubmissionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  referenceCode: string;
}

export function SuccessSubmissionModal({
  isOpen,
  onOpenChange,
  referenceCode
}: SuccessSubmissionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 sm:p-10 border-0 shadow-2xl !rounded-2xl text-center [&>button]:hidden">
        <div className="flex flex-col items-center justify-center mb-1 sm:mb-2 mt-1 sm:mt-4">
          <div className="h-18 w-18 sm:h-24 sm:w-24 bg-primary/10 rounded-full flex items-center justify-center relative mb-5 sm:mb-6">
            <ClipboardCheck className="h-8 w-8 sm:h-10 sm:w-10 text-primary" strokeWidth={2} />
            <div className="absolute bottom-1 right-1 bg-card rounded-full p-0.5 shadow-sm">
              <div className="bg-sky-500 text-white rounded-full p-1">
                <Clock className="h-4 w-4" strokeWidth={3} />
              </div>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">
            ¡Comprobante Enviado!
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-sm mx-auto">
            Hemos recibido tu comprobante de pago. Nuestro equipo validará la información en un plazo máximo de <strong>24 horas hábiles</strong>. Te notificaremos vía email cuando tu suscripción sea activada correctamente.
          </p>

          <div className="bg-muted/20 border border-border rounded-xl py-3 sm:py-4 px-4 sm:px-6 w-full mb-6 sm:mb-8">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Referencia del envío</p>
            <p className="text-xs font-bold text-foreground font-mono truncate">Nº de Operación: {referenceCode}</p>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 sm:py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm mb-3 sm:mb-4"
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            Volver al Inicio
          </button>

          <button
            onClick={() => onOpenChange(false)}
            className="text-[10px] text-muted-foreground hover:text-foreground font-bold transition-colors uppercase tracking-wider"
          >
            Ver estado de mi solicitud
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
