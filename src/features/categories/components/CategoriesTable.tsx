import { Loader2, Search, Pencil, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import {
  dataTableActionButtonClassName,
  dataTableActionDestructiveClassName,
  dataTableActionIconClassName,
  dataTableActionPrimaryClassName,
  dataTableCellCodeClassName,
  dataTableCellPrimaryClassName,
  dataTableCellSecondaryClassName,
  dataTableHead,
  dataTableHeaderRowClassName,
  dataTableRow
} from '@/components/shared/dataTableStyles';
import type { Category } from '@/services/category.service';
import { cn } from '@/lib/utils';

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
        <TableHeader className={dataTableHeaderRowClassName}>
          <TableRow className="hover:bg-transparent border-none h-10">
            <SortableTableHead
              field="code"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('w-[150px]')}
            >
              Código
            </SortableTableHead>
            <SortableTableHead
              field="name"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('w-[300px]')}
            >
              Nombre de la Categoría
            </SortableTableHead>
            <SortableTableHead
              field="description"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead()}
            >
              Descripción
            </SortableTableHead>
            <SortableTableHead
              field="createdAt"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('w-[130px]')}
            >
              Fecha Creación
            </SortableTableHead>
            <SortableTableHead
              field="isActive"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
              className={dataTableHead('w-[90px]')}
            >
              Estado
            </SortableTableHead>
            <TableHead className={dataTableHead('w-[90px] text-right')}>Acciones</TableHead>
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
              <TableRow key={category.id} className={dataTableRow('h-11')}>
                <TableCell className={dataTableCellCodeClassName}>{category.code}</TableCell>
                <TableCell className={dataTableCellPrimaryClassName}>{category.name}</TableCell>
                <TableCell className={cn(dataTableCellSecondaryClassName, 'max-w-[300px] truncate')}>{category.description || '-'}</TableCell>
                <TableCell className={dataTableCellSecondaryClassName}>
                  {category.createdAt}
                </TableCell>
                <TableCell>
                  <Badge variant={category.isActive ? 'success' : 'destructive'} className="uppercase text-[9px] font-semibold tracking-[0.08em] px-2 py-0.5 border border-current/20">
                    {category.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName)}
                      onClick={() => onEdit(category)}
                    >
                      <Pencil className={dataTableActionIconClassName} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName)}
                      onClick={() => onDelete(category.id)}
                    >
                      <Trash2 className={dataTableActionIconClassName} />
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
