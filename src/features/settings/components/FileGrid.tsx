import { Download, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type FileMetadata } from '@/services/file.service';

interface FileGridProps {
  files: FileMetadata[];
  onFileClick: (file: FileMetadata) => void;
  onDelete: (id: string) => void;
  getFileIcon: (mimeType: string, fileName: string) => React.ReactNode;
  formatSize: (bytes: number) => string;
}

export function FileGrid({
  files,
  onFileClick,
  onDelete,
  getFileIcon,
  formatSize
}: FileGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {files.map(file => (
        <Card
          key={file.id}
          className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
          onClick={() => onFileClick(file)}
        >
          <div className="aspect-square bg-muted/30 flex items-center justify-center relative">
            {file.mimeType.includes('image') ? (
              <img src={file.path} alt={file.name} className="w-full h-full object-cover" />
            ) : (
              getFileIcon(file.mimeType, file.name)
            )}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-background/80 hover:bg-background backdrop-blur shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(file.downloadUrl || file.path, '_blank');
                }}
              >
                <Download className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          <div className="p-3">
            <p className="text-sm font-bold text-foreground truncate" title={file.name}>
              {file.name}
            </p>
            <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
              <span>{formatSize(file.size)}</span>
              <span>{file.uploadedAt || '-'}</span>
            </div>
            <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-white hover:bg-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file.id);
                }}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
