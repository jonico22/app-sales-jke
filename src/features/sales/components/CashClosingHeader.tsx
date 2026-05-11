import { ArrowLeft, Printer, CalendarDays, Clock, Lock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useNavigate } from 'react-router-dom';

interface CashClosingHeaderProps {
    branchName: string;
    formattedDate: string;
    formattedTime: string;
}

export function CashClosingHeader({ branchName, formattedDate, formattedTime }: CashClosingHeaderProps) {
  const navigate = useNavigate();

  return (
    <PageHeader
      title={`Cierre de Caja - ${branchName}`}
      titleClassName="text-xl sm:text-2xl normal-case"
      topContent={(
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest">
          <Lock className="w-3 h-3" />
          Proceso de Cierre
        </div>
      )}
      meta={(
        <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {formattedTime}
          </span>
        </div>
      )}
      actionsClassName="flex items-center gap-2 shrink-0"
      actions={(
        <>
                <button
                    onClick={() => navigate('/pos')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Volver
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
                >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir Reporte
                </button>
        </>
      )}
    />
  );
}
