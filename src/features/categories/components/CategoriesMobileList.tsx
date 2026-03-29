import { Loader2, Search, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Category } from '@/services/category.service';

interface CategoriesMobileListProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoriesMobileList({
  categories,
  isLoading,
  onEdit,
  onDelete
}: CategoriesMobileListProps) {
  return (
    <div className="md:hidden divide-y divide-border">
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium tracking-tight uppercase">Cargando categorías...</span>
        </div>
      ) : categories.length > 0 ? (
        categories.map((category) => (
          <div key={category.id} className="p-4 bg-card active:bg-muted/10 transition-colors">
            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-lg uppercase tracking-tight">
                    {category.code || 'S/C'}
                  </span>
                  <Badge variant={category.isActive ? 'success' : 'secondary'} className="uppercase text-[8px] font-black px-1.5 py-0 h-4 border border-current/20">
                    {category.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <h3 className="text-[13px] font-black text-foreground leading-tight uppercase tracking-tight">{category.name}</h3>
                {category.description && (
                  <p className="text-[11px] text-muted-foreground font-medium mt-1.5 line-clamp-3 leading-relaxed">{category.description}</p>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                  onClick={() => onEdit(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                  onClick={() => onDelete(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t border-border/40">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-tight">
                <span className="text-muted-foreground/60">Fecha Creación</span>
                <span className="text-foreground/80 tabular-nums bg-muted/30 px-2 py-0.5 rounded-lg border border-border/50">{category.createdAt}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <Search className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron categorías</p>
        </div>
      )}
    </div>
  );
}
