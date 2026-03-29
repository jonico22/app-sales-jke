import React from 'react';
import { Upload, Plus, Minus, Crop, RotateCcw, RotateCw, File as FileIcon, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UploadTabProps {
  selectedFile: File | null;
  previewUrl: string | null;
  isDragging: boolean;
  isUploading: boolean;
  uploadedFiles: any[];
  maxSizeMB: number;
  accept: string;
  cropShape: 'round' | 'square' | 'none';
  isCropping: boolean;
  zoom: number;
  rotation: number;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onUpload: () => void;
  onRemoveSelected: () => void;
  onToggleCropping: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomChange: (zoom: number) => void;
  onRemoveUploaded: (idx: number) => void;
}

export const UploadTab = React.memo(({
  selectedFile,
  previewUrl,
  isDragging,
  isUploading,
  uploadedFiles,
  maxSizeMB,
  accept,
  cropShape,
  isCropping,
  zoom,
  rotation,
  fileInputRef,
  onFileSelect,
  onDrop,
  onDragOver,
  onDragLeave,
  onUpload,
  onRemoveSelected,
  onToggleCropping,
  onRotateLeft,
  onRotateRight,
  onZoomChange,
  onRemoveUploaded,
}: UploadTabProps) => {

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {!selectedFile && (
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 text-center",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileSelect}
              accept={accept}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-primary/10 text-primary">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                {uploadedFiles.length > 0 ? "Arrastra y suelta otro archivo aquí" : "Arrastra y suelta tu archivo aquí"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                O haz clic para seleccionar (Máx. {maxSizeMB}MB)
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Tamaño máximo: {maxSizeMB}MB • Formatos: {accept.split(',').map(t => t.split('/')[1]?.toUpperCase()).join(', ')}
            </p>
          </div>
        )}

        {selectedFile && (
          <div className="space-y-4 pt-2">
            {selectedFile.type.startsWith('image/') && previewUrl ? (
              <div className="flex flex-col items-center pt-2 pb-6">
                <div className="relative w-full aspect-square max-w-[320px] rounded overflow-hidden bg-[#595856] mb-6 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain z-0"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease-in-out'
                    }}
                  />
                  {cropShape !== 'none' && isCropping && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                      <div className={cn(
                        "w-[85%] h-[85%] ring-[200px] ring-black/40 border-[1px] border-white/20",
                        cropShape === 'round' ? "rounded-full" : "rounded-lg"
                      )}></div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1 mb-6 text-center">
                  <span className="text-sm font-bold text-foreground truncate max-w-[280px]">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}</span>
                  <button onClick={onRemoveSelected} className="text-xs text-primary font-medium hover:underline mt-1.5">Cambiar archivo</button>
                </div>

                <div className="flex flex-col items-center gap-8 w-full max-w-[280px]">
                  <div className="flex items-center gap-6">
                    <button onClick={onToggleCropping} className={cn("p-3.5 rounded-xl transition-colors border", isCropping ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground hover:text-foreground border-transparent hover:bg-muted")}>
                      <Crop className="w-5 h-5" />
                    </button>
                    <button onClick={onRotateLeft} className="p-3 text-primary hover:bg-primary/10 rounded-xl transition-colors"><RotateCcw className="w-5 h-5" /></button>
                    <button onClick={onRotateRight} className="p-3 text-primary hover:bg-primary/10 rounded-xl transition-colors"><RotateCw className="w-5 h-5" /></button>
                  </div>

                  {isCropping && (
                    <div className="flex flex-col items-center gap-2.5 w-full">
                      <div className="flex items-center w-full gap-4">
                        <button onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))} className="text-muted-foreground hover:text-foreground font-bold"><Minus className="w-4 h-4" /></button>
                        <input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={(e) => onZoomChange(parseFloat(e.target.value))} className="w-full h-1 bg-muted rounded-full cursor-pointer accent-primary" />
                        <button onClick={() => onZoomChange(Math.min(3, zoom + 0.1))} className="text-muted-foreground hover:text-foreground font-bold"><Plus className="w-4 h-4" /></button>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">ZOOM</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-border rounded-xl bg-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><FileIcon className="w-6 h-6" /></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground truncate max-w-[280px]">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</span>
                  </div>
                </div>
                <button onClick={onRemoveSelected} className="p-2.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
            )}
          </div>
        )}

        {!selectedFile && uploadedFiles.length > 0 && (
          <div className="space-y-3 mt-4">
            <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">Archivos Subidos</span>
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="border border-border rounded-xl bg-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-[84px] h-[84px] rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                    {file.url ? <img src={file.url} alt={file.name} className="w-full h-full object-cover" /> : <FileIcon className="w-10 h-10 opacity-50" />}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-foreground truncate max-w-[200px]">{file.name}</span>
                       <CheckCircle2 className="w-[18px] h-[18px] text-[#4caf50]" fill="currentColor" stroke="white" />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 mb-2">{formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#f0f9f1] text-[#4caf50] border border-[#d2edd4] text-[10px] font-bold uppercase tracking-wider">¡Éxito!</span>
                  </div>
                </div>
                <button onClick={() => onRemoveUploaded(idx)} className="p-2.5 bg-muted text-muted-foreground hover:text-destructive rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-center gap-6 pt-6 border-t border-border mt-4 pb-2">
        <div className="flex items-center justify-end w-full gap-3">
          <Button variant="outline" className="h-11 px-6 shadow-sm" onClick={onUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {isUploading ? "Subiendo..." : "Iniciar Carga"}
          </Button>
        </div>
      </div>
    </div>
  );
});

UploadTab.displayName = 'UploadTab';
