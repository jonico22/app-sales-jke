import { Button } from '@/components/ui/button';
import { SlidePanel } from '@/components/shared/SlidePanel';
import { useDeliveredConsignmentAgreement } from '../../hooks/useConsignmentQueries';
import { CreateDeliveredConsignmentForm } from './CreateDeliveredConsignmentForm';

interface DeliveredConsignmentAgreementEditPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryId: string | null;
}

export function DeliveredConsignmentAgreementEditPanel({
  open,
  onOpenChange,
  deliveryId,
}: DeliveredConsignmentAgreementEditPanelProps) {
  const deliveryQuery = useDeliveredConsignmentAgreement(open ? deliveryId : null);

  const footer = (
    <Button
      variant="ghost"
      className="w-full h-10 text-muted-foreground hover:text-foreground hover:bg-muted font-bold text-[10px] uppercase tracking-wider transition-all"
      onClick={() => onOpenChange(false)}
    >
      Cancelar
    </Button>
  );

  return (
    <SlidePanel
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Entrega"
      footer={deliveryQuery.data ? undefined : footer}
    >
      {deliveryQuery.isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : deliveryQuery.data ? (
        <CreateDeliveredConsignmentForm
          mode="edit"
          delivery={deliveryQuery.data}
          onCancel={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      ) : (
        <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-semibold text-foreground">No se pudo cargar la entrega.</p>
          <p className="text-xs text-muted-foreground">
            Cierra el panel e inténtalo nuevamente.
          </p>
        </div>
      )}
    </SlidePanel>
  );
}
