import { Search, Grid, List } from 'lucide-react';
import { compactNativeSelectClassName } from '@/components/shared/formFieldStyles';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FileManagerToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function FileManagerToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange
}: FileManagerToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre de archivo..."
          className="pl-10 bg-background border-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <select className={compactNativeSelectClassName}>
          <option>Todos los tipos</option>
          <option>Imágenes</option>
          <option>Documentos</option>
          <option>Hojas de cálculo</option>
        </select>
        <select className={compactNativeSelectClassName}>
          <option>Más recientes</option>
          <option>Nombre (A-Z)</option>
          <option>Tamaño</option>
        </select>
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
