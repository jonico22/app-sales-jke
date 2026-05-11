import { ArrowLeft, Printer, Lock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useNavigate } from 'react-router-dom';
import type { CashShiftDetail } from '@/services/cash-shift.service';
import { fmtDate } from './SalesUtils';

interface ShiftDetailHeaderProps {
    shift: CashShiftDetail;
    isOpen: boolean;
    shortId: string;
}

export function ShiftDetailHeader({ shift, isOpen, shortId }: ShiftDetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <PageHeader
      title={(
        <>
          Detalle de Turno <span className="text-primary">#{shortId}</span>
        </>
      )}
      titleClassName="normal-case"
      topContent={(
        <button
          onClick={() => navigate('/sales/shifts')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al listado
        </button>
      )}
      meta={(
        <div className="flex items-center gap-3">
          {isOpen ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ABIERTO
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              CERRADO
            </span>
          )}
          <span className="text-[11px] text-muted-foreground font-medium">
            Iniciado el {fmtDate(shift.openedAt, "d 'de' MMMM, yyyy")}
          </span>
        </div>
      )}
      actionsClassName="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto"
      actions={(
        <>
                <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 border border-border bg-card text-foreground hover:bg-muted text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 w-full sm:w-auto"
                >
                    <Printer size={14} />
                    Imprimir Reporte
                </button>
                {isOpen && (
                    <button
                        onClick={() => navigate(`/pos/cash-closing/${shift.id}`)}
                        className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2 bg-primary text-primary-foreground rounded-xl shadow-sm shadow-primary/20 text-[11px] font-black uppercase tracking-wider hover:bg-primary/90 transition-all active:scale-95 w-full sm:w-auto"
                    >
                        <Lock size={14} />
                        Cerrar Turno
                    </button>
                )}
        </>
      )}
    />
  );
}
