import { useNavigate } from 'react-router-dom';
import { RefreshCw, FileText, Download, Plus } from 'lucide-react';

interface SalesHistoryHeaderProps {
  isExporting: boolean;
  onExportGeneral: () => void;
  onExportCurrent: () => void;
}

export function SalesHistoryHeader({
  isExporting,
  onExportGeneral,
  onExportCurrent
}: SalesHistoryHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Historial de Ventas</h1>
        <p className="text-muted-foreground text-[10px] mt-0.5 font-medium">Gestione y verifique las transacciones recientes.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={onExportGeneral}
          disabled={isExporting}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-all text-[11px] font-bold uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
        >
          {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
          <span className="truncate">Exportar Reporte General</span>
        </button>
        <button
          onClick={onExportCurrent}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-foreground hover:bg-muted shadow-sm transition-all text-[11px] font-bold uppercase tracking-wider active:scale-95"
        >
          <Download size={14} />
          <span className="truncate">Exportar Actual</span>
        </button>
        <button
          onClick={() => navigate('/pos')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary-hover shadow-md shadow-primary/10 transition-all text-[11px] font-bold uppercase tracking-wider active:scale-95"
        >
          <Plus size={14} />
          Nueva Venta
        </button>
      </div>
    </div>
  );
}
