import { Cloud } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StorageInfoBarProps {
  totalFiles: number;
  usedSpace: number;
  limitSpace: number;
  storagePercentage: number;
  formatSize: (bytes: number) => string;
}

export function StorageInfoBar({
  totalFiles,
  usedSpace,
  limitSpace,
  storagePercentage,
  formatSize
}: StorageInfoBarProps) {
  return (
    <Card className="p-4 border-border bg-muted/30">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Cloud className="w-4 h-4 text-sky-500" />
            Almacenamiento en la nube
          </div>
          <div className="text-muted-foreground">
            <span className="font-bold text-foreground">{totalFiles}</span> archivos
            <span className="mx-2 text-muted-foreground/30">|</span>
            <span className="font-bold text-foreground">{formatSize(usedSpace)}</span> de {formatSize(limitSpace)} utilizados - {storagePercentage}%
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500",
              storagePercentage > 90 ? "bg-red-500" : storagePercentage > 70 ? "bg-amber-500" : "bg-sky-500"
            )}
            style={{ width: `${storagePercentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
