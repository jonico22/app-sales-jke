import { ArrowLeft, Printer, CalendarDays, Clock, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CashClosingHeaderProps {
    branchName: string;
    formattedDate: string;
    formattedTime: string;
}

export function CashClosingHeader({ branchName, formattedDate, formattedTime }: CashClosingHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest">
                    <Lock className="w-3 h-3" />
                    Proceso de Cierre
                </div>
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                    Cierre de Caja – {branchName}
                </h1>
                <div className="flex items-center gap-3 mt-1.5 text-muted-foreground text-xs font-medium">
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
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
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
            </div>
        </div>
    );
}
