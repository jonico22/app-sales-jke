import { FileSpreadsheet, CloudUpload, FileDown } from 'lucide-react';
import { Button } from '@/components/ui';

interface BulkUploadCardProps {
  title?: string;
  description?: string;
  dragDropText?: string;
  dragDropSubtext?: string;
  buttonText?: string;
  downloadText?: string;
  maxSizeText?: string;
  onUpload?: () => void;
  onDownloadTemplate?: () => void;
}

export function BulkUploadCard({
  title = "Carga Masiva",
  description = "Importación rápida de datos desde archivo.",
  dragDropText = "Cargar archivo (.xlsx, .csv)",
  dragDropSubtext = "Arrastra y suelta tu archivo aquí o explora",
  buttonText = "Seleccionar Archivo",
  downloadText = "Descargar plantilla",
  maxSizeText = "MAX 5MB • PLANTILLA V2.0",
  onUpload,
  onDownloadTemplate
}: BulkUploadCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-green-50 p-3 rounded-xl">
          <FileSpreadsheet className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-105 transition-transform duration-300">
           <CloudUpload className="h-8 w-8 text-[#0ea5e9]" />
        </div>
        <h4 className="font-bold text-slate-700 mb-1">{dragDropText}</h4>
        <p className="text-xs text-slate-500 mb-6">{dragDropSubtext}</p>
        
        <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:text-slate-900 group-hover:border-sky-200" onClick={onUpload}>
          {buttonText}
        </Button>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 border-t border-slate-100 pt-6">
        <button 
          className="flex items-center gap-2 text-xs font-semibold text-[#0ea5e9] hover:text-sky-700 transition-colors"
          onClick={onDownloadTemplate}
        >
          <FileDown className="h-4 w-4" /> {downloadText}
        </button>
        <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{maxSizeText}</p>
      </div>
    </div>
  );
}
