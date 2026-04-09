import { ChevronLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';

interface CreateMovementHeaderProps {
    currentStep: number;
    onBack: () => void;
}

export function CreateMovementHeader({ currentStep, onBack }: CreateMovementHeaderProps) {
  return (
    <PageHeader
      title={currentStep === 1 ? 'Nueva Transferencia Interna' : 'Confirmar Envío'}
      subtitle={
        currentStep === 1
          ? 'Complete la información para reservar el stock en la sucursal de origen.'
          : 'El movimiento ha sido registrado correctamente en el sistema.'
      }
      className="space-y-0"
      titleClassName="normal-case"
      topContent={(
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Volver a Listado
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
            {currentStep === 1 ? 'Paso 1 de 2' : 'Finalizado'}
          </span>
        </div>
      )}
      actions={(
        <Badge className={`${currentStep === 1 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-green-500/10 text-green-600 border-green-500/20'} px-3 py-1 font-black text-[10px] uppercase tracking-widest`}>
          {currentStep === 1 ? 'Borrador' : 'Confirmado'}
        </Badge>
      )}
    />
  );
}
