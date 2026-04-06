import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  planName?: string;
  isBeta: boolean;
  cancelReason: string;
  onCancelReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isCancelling: boolean;
}

export function CancelSubscriptionModal({
  isOpen,
  onOpenChange,
  planName,
  isBeta,
  cancelReason,
  onCancelReasonChange,
  onConfirm,
  isCancelling
}: CancelSubscriptionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 text-center border-0 shadow-2xl !rounded-xl [&>button]:hidden">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4 mt-2">
          <AlertTriangle className="h-6 w-6 text-[#E5534B]" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-3">
          ¿Estás seguro de que deseas cancelar?
        </h3>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed px-2">
          Al cancelar, perderás el acceso a las funcionalidades del plan {planName} {isBeta && '(Public Preview)'} al finalizar tu ciclo actual. No te preocupes, tus datos de inventario se mantendrán guardados.
        </p>
        <div className="text-left mb-6">
          <label className="text-xs font-bold text-foreground mb-2 block lowercase first-letter:uppercase">
            Motivo de la cancelación (Opcional)
          </label>
          <div className="relative">
            <Textarea
              placeholder="Cuéntanos por qué te vas..."
              value={cancelReason}
              onChange={(e) => onCancelReasonChange(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 mb-2">
          <button
            className={`w-full bg-[#E5534B] hover:bg-[#D6453E] text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${isCancelling ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={onConfirm}
            disabled={isCancelling}
          >
            {isCancelling && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            Confirmar Cancelación
          </button>
          <button
            onClick={() => onOpenChange(false)}
            disabled={isCancelling}
            className="w-full border border-border text-muted-foreground font-bold py-2.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 text-xs uppercase"
          >
            Mantener mi plan
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
