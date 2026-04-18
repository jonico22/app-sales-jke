import { Button } from '@/components/ui/button';
import { SlidePanel } from '@/components/shared/SlidePanel';
import { useReceivedConsignmentSettlement } from '../../hooks/useConsignmentQueries';
import { CreateReceivedConsignmentSettlementForm } from './CreateReceivedConsignmentSettlementForm';

interface ReceivedConsignmentSettlementEditPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settlementId: string | null;
}

export function ReceivedConsignmentSettlementEditPanel({
  open,
  onOpenChange,
  settlementId,
}: ReceivedConsignmentSettlementEditPanelProps) {
  const settlementQuery = useReceivedConsignmentSettlement(open ? settlementId : null);

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
      title="Editar Liquidación"
      footer={settlementQuery.data ? undefined : footer}
    >
      {settlementQuery.isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : settlementQuery.data ? (
        <CreateReceivedConsignmentSettlementForm
          mode="edit"
          settlement={settlementQuery.data}
          onCancel={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      ) : (
        <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-semibold text-foreground">No se pudo cargar la liquidación.</p>
          <p className="text-xs text-muted-foreground">Cierra el panel e inténtalo nuevamente.</p>
        </div>
      )}
    </SlidePanel>
  );
}
