import { Download, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type FileMetadata } from '@/services/file.service';

interface FileTableProps {
  files: FileMetadata[];
  onFileClick: (file: FileMetadata) => void;
  onDelete: (id: string) => void;
  getFileIcon: (mimeType: string, fileName: string) => React.ReactNode;
  formatSize: (bytes: number) => string;
}

export function FileTable({
  files,
  onFileClick,
  onDelete,
  getFileIcon,
  formatSize
}: FileTableProps) {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Nombre</th>
            <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Tipo</th>
            <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Tamaño</th>
            <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Fecha</th>
            <th className="px-4 py-3 font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {files.map(file => (
            <tr
              key={file.id}
              className="hover:bg-muted/30 transition-colors cursor-pointer group"
              onClick={() => onFileClick(file)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                    {file.mimeType.includes('image') ? (
                      <img src={file.path} alt="" className="w-full h-full object-cover rounded" />
                    ) : (
                      <div className="scale-75">{getFileIcon(file.mimeType, file.name)}</div>
                    )}
                  </div>
                  <span className="font-bold text-foreground text-xs truncate max-w-[200px] uppercase tracking-tight">{file.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs uppercase font-medium">{file.mimeType.split('/')[1]?.toUpperCase() || 'Archivo'}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs font-medium">{formatSize(file.size)}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs font-medium">{file.uploadedAt || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.downloadUrl || file.path, '_blank');
                    }}
                  >
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
