import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePickerInput } from '@/components/shared/DatePickerInput';
import { TagInput } from '@/components/shared/TagInput';
import { useCreatedByUsersQuery } from '../hooks/useCategoryQueries';

import { type UserSelectOption } from '@/services/category.service';

interface CategoryFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterValues) => void;
}

export interface FilterValues {
  createdBy?: string;
  createdAtFrom: Date | null;
  createdAtTo: Date | null;
  updatedAtFrom: Date | null;
  updatedAtTo: Date | null;
}

export function CategoryFilterPanel({
  open,
  onOpenChange,
  onApplyFilters,
}: CategoryFilterPanelProps) {
  const [filters, setFilters] = useState<FilterValues>({
    createdBy: undefined,
    createdAtFrom: null,
    createdAtTo: null,
    updatedAtFrom: null,
    updatedAtTo: null,
  });

  const { data: usersResponse } = useCreatedByUsersQuery();
  const availableUsers = (usersResponse?.data || []).map((user: UserSelectOption) => ({
    id: user.id,
    name: user.name
  }));

  const handleClear = () => {
    const emptyFilters = {
      createdBy: undefined,
      createdAtFrom: null,
      createdAtTo: null,
      updatedAtFrom: null,
      updatedAtTo: null,
    };
    setFilters(emptyFilters);
    onApplyFilters(emptyFilters);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card border-l border-border shadow-2xl">
        <SheetHeader className="p-5 border-b border-border bg-card">
          <SheetTitle className="text-lg font-bold text-foreground uppercase tracking-tight">Filtros Avanzados</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Created By */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">Creado por</Label>
            <TagInput
              options={availableUsers}
              value={filters.createdBy ? [filters.createdBy] : []}
              onChange={(userIds) => setFilters({ ...filters, createdBy: userIds[0] })}
              placeholder="Seleccionar usuario..."
              maxTags={1}
            />
          </div>

          {/* Creation Date Range */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">Rango de Fecha de Creación</Label>
            <div className="grid grid-cols-2 gap-3">
              <DatePickerInput
                value={filters.createdAtFrom}
                onChange={(date) => setFilters({ ...filters, createdAtFrom: date })}
                maxDate={filters.createdAtTo || undefined}
                placeholder="dd/mm/aaaa"
                aria-label="Fecha inicio creación"
              />
              <DatePickerInput
                value={filters.createdAtTo}
                onChange={(date) => setFilters({ ...filters, createdAtTo: date })}
                minDate={filters.createdAtFrom || undefined}
                placeholder="dd/mm/aaaa"
                aria-label="Fecha fin creación"
              />
            </div>
          </div>

          {/* Update Date Range */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">Rango de Fecha de Actualización</Label>
            <div className="grid grid-cols-2 gap-3">
              <DatePickerInput
                value={filters.updatedAtFrom}
                onChange={(date) => setFilters({ ...filters, updatedAtFrom: date })}
                maxDate={filters.updatedAtTo || undefined}
                placeholder="dd/mm/aaaa"
                aria-label="Fecha inicio actualización"
              />
              <DatePickerInput
                value={filters.updatedAtTo}
                onChange={(date) => setFilters({ ...filters, updatedAtTo: date })}
                minDate={filters.updatedAtFrom || undefined}
                placeholder="dd/mm/aaaa"
                aria-label="Fecha fin actualización"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-border bg-muted/20 space-y-3">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 transition-all active:scale-95"
            onClick={() => {
              onApplyFilters(filters);
              onOpenChange(false);
            }}
          >
            ✓ Aplicar Filtros
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground hover:bg-muted font-bold text-[10px] uppercase tracking-wider h-9"
            onClick={handleClear}
          >
            Limpiar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
