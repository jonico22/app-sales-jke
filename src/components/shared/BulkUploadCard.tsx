import { FileSpreadsheet, CloudUpload, FileDown, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useDropzone } from 'react-dropzone';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface BulkUploadCardProps {
  title?: string;
  description?: string;
  dragDropText?: string;
  dragDropSubtext?: string;
  buttonText?: string;
  downloadText?: string;
  maxSizeText?: string;
  onUpload?: (file: File) => Promise<void>;
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error('El archivo excede el tamaño máximo de 5MB');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error('Tipo de archivo no válido. Solo se permiten archivos CSV o XLSX');
      } else {
        toast.error('Error al procesar el archivo');
      }
      return;
    }

    // Handle accepted files
    if (acceptedFiles.length > 0 && onUpload) {
      const file = acceptedFiles[0];
      setIsUploading(true);
      setUploadedFileName(file.name);

      try {
        await onUpload(file);
        // Success toast will be handled by the parent component
        setTimeout(() => {
          setUploadedFileName(null);
        }, 3000);
      } catch (error) {
        setUploadedFileName(null);
        // Error toast will be handled by the parent component
      } finally {
        setIsUploading(false);
      }
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    noClick: true,
    noKeyboard: true
  });

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-xl">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`flex-1 border-2 border-dashed rounded-xl bg-muted/30 flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ${isDragActive
          ? 'border-primary/50 bg-primary/5 scale-[1.02]'
          : isUploading
            ? 'border-border bg-muted'
            : 'border-border hover:bg-muted/50 cursor-pointer group'
          }`}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <>
            <div className="bg-card p-4 rounded-full shadow-sm mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h4 className="font-bold text-foreground mb-1">Subiendo archivo...</h4>
            <p className="text-xs text-muted-foreground">{uploadedFileName}</p>
          </>
        ) : uploadedFileName ? (
          <>
            <div className="bg-green-50 p-4 rounded-full shadow-sm mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-bold text-green-700 mb-1">¡Archivo procesado!</h4>
            <p className="text-xs text-muted-foreground">{uploadedFileName}</p>
          </>
        ) : (
          <>
            <div className={`bg-card p-4 rounded-full shadow-sm mb-4 transition-transform duration-300 ${isDragActive ? 'scale-110' : 'group-hover:scale-105'
              }`}>
              <CloudUpload className={`h-8 w-8 ${isDragActive ? 'text-primary' : 'text-primary/70'}`} />
            </div>
            <h4 className="font-bold text-foreground mb-1">
              {isDragActive ? '¡Suelta el archivo aquí!' : dragDropText}
            </h4>
            <p className="text-xs text-muted-foreground mb-6">{dragDropSubtext}</p>

            <Button
              variant="outline"
              className="bg-card border-border text-foreground hover:text-foreground hover:bg-muted group-hover:border-primary/30"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              disabled={isUploading}
            >
              {buttonText}
            </Button>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-6">
        <button
          className="flex items-center gap-2 text-xs font-semibold text-primary/80 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onDownloadTemplate}
          disabled={isUploading}
        >
          <FileDown className="h-4 w-4" /> {downloadText}
        </button>
        <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{maxSizeText}</p>
      </div>
    </div>
  );
}
