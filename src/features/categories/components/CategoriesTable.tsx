import { Loader2, Search, Pencil, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import type { Category } from '@/services/category.service';

// Rule css-content-visibility (Priority 2)
const TABLE_BODY_STYLE = { contentVisibility: 'auto' } as React.CSSProperties;

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoriesTable({
  categories,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete
}: CategoriesTableProps) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader className="bg-muted/30 border-b border-border">
          <TableRow className="hover:bg-muted/40 border-none h-10">
            <SortableTableHead
              field="code"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="w-[150px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
            >
              Código
            </SortableTableHead>
            <SortableTableHead
              field="name"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="w-[300px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
            >
              Nombre de la Categoría
            </SortableTableHead>
            <SortableTableHead
              field="description"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
            >
              Descripción
            </SortableTableHead>
            <SortableTableHead
              field="createdAt"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="w-[130px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
            >
              Fecha Creación
            </SortableTableHead>
            <SortableTableHead
              field="isActive"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className="w-[90px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
            >
              Estado
            </SortableTableHead>
            <TableHead className="w-[90px] text-right font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody style={TABLE_BODY_STYLE}>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Cargando categorías...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <TableRow key={category.id} className="hover:bg-muted/30 border-border transition-colors h-11">
                <TableCell className="font-bold text-foreground text-[11px]">{category.code}</TableCell>
                <TableCell className="font-bold text-foreground text-xs">{category.name}</TableCell>
                <TableCell className="text-muted-foreground/80 text-[11px] max-w-[300px] truncate">{category.description || '-'}</TableCell>
                <TableCell className="text-muted-foreground/80 text-[11px]">
                  {category.createdAt}
                </TableCell>
                <TableCell>
                  <Badge variant={category.isActive ? 'success' : 'destructive'} className="uppercase text-[9px] tracking-wide px-2 py-0.5 border border-current/20">
                    {category.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => onEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4 border border-border">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    No se encontraron categorías
                  </h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    No hay categorías que coincidan con tu búsqueda o los filtros seleccionados.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
