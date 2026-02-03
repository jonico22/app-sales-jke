import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button, Label } from '@/components/ui';
import { DatePickerInput } from '@/components/shared/DatePickerInput';
import { TagInput, type TagOption } from '@/components/shared/TagInput';
import { categoryService } from '@/services/category.service';
import { toast } from 'sonner';

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
  const [availableUsers, setAvailableUsers] = useState<TagOption[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await categoryService.getCreatedByUsers();
        if (response.success && response.data) {
          setAvailableUsers(response.data.map(user => ({
            id: user.id,
            name: user.name
          })));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Error al cargar lista de usuarios');
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

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
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white">
        <SheetHeader>
          <SheetTitle>Filtros Avanzados</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Created By */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Creado por (UUID)</Label>
            <TagInput
              options={availableUsers}
              value={filters.createdBy ? [filters.createdBy] : []}
              onChange={(userIds) => setFilters({ ...filters, createdBy: userIds[0] })}
              placeholder="Seleccionar usuario..."
              maxTags={1}
            />
          </div>

          {/* Creation Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Rango de Fecha de Creación</Label>
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
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Rango de Fecha de Actualización</Label>
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
        <div className="p-6 border-t border-slate-100 bg-white space-y-3">
          <Button
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-6 rounded-xl text-base shadow-lg shadow-sky-500/20"
            onClick={() => {
              onApplyFilters(filters);
              onOpenChange(false);
            }}
          >
            ✓ Aplicar Filtros
          </Button>
          <Button
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-4"
            onClick={handleClear}
          >
            Limpiar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
