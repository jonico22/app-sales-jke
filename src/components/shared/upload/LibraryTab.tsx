import React from 'react';
import { Search, File as FileIcon, Loader2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type FileMetadata } from '@/services/file.service';

interface LibraryTabProps {
  libraryFiles: FileMetadata[];
  librarySearch: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  libraryPage: number;
  libraryTotalPages: number;
  onPageChange: (page: number | ((p: number) => number)) => void;
  selectedLibraryFile: FileMetadata | null;
  onSelectFile: (file: FileMetadata) => void;
  onConfirm: () => void;
}

export const LibraryTab = React.memo(({
  libraryFiles,
  librarySearch,
  onSearchChange,
  isLoading,
  libraryPage,
  libraryTotalPages,
  onPageChange,
  selectedLibraryFile,
  onSelectFile,
  onConfirm,
}: LibraryTabProps) => {

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="relative shrink-0 mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre de archivo..."
          value={librarySearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background border-input"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 min-h-[260px]">
        {isLoading ? (
          <div className="flex flex-col flex-1 h-[260px] items-center justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-sm">Cargando biblioteca...</span>
          </div>
        ) : libraryFiles.length === 0 ? (
          <div className="flex flex-col flex-1 h-[260px] items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <FileIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">No se encontraron archivos</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {libraryFiles.map(file => (
              <div
                key={file.id}
                onClick={() => onSelectFile(file)}
                className={cn(
                  "relative aspect-square border rounded-xl cursor-pointer overflow-hidden transition-all bg-muted/30 group",
                  selectedLibraryFile?.id === file.id
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                {file.mimeType && file.mimeType.startsWith('image/') ? (
                  <img src={file.path || file.downloadUrl} alt={file.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
                    <FileIcon className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[10px] uppercase truncate w-full text-center px-1">{file.mimeType ? file.mimeType.split('/')[1] : 'FILE'}</span>
                  </div>
                )}
                {selectedLibraryFile?.id === file.id && (
                  <div className="absolute top-1.5 right-1.5 bg-primary rounded-full text-primary-foreground shadow-sm z-10 w-4 h-4 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {libraryTotalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between pt-2 border-t border-border mt-4">
          <span className="text-xs text-muted-foreground font-medium">Página {libraryPage} de {libraryTotalPages}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" type="button" onClick={() => onPageChange(p => Math.max(1, p - 1))} disabled={libraryPage === 1 || isLoading} className="h-8 px-2">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" type="button" onClick={() => onPageChange(p => Math.min(libraryTotalPages, p + 1))} disabled={libraryPage === libraryTotalPages || isLoading} className="h-8 px-2">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="shrink-0 flex items-center justify-end w-full gap-3 pt-6 border-t border-border mt-4">
        <Button variant="primary" className="bg-[#56a3e2] hover:bg-[#4a8ec5] text-white font-bold h-11 px-8" onClick={onConfirm} disabled={!selectedLibraryFile}>
          Seleccionar Archivo
        </Button>
      </div>
    </div>
  );
});

LibraryTab.displayName = 'LibraryTab';
