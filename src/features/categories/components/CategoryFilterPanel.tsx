import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button, Input, Label } from '@/components/ui';
import { DatePickerInput } from '@/components/shared/DatePickerInput';
import { TagInput, type TagOption } from '@/components/shared/TagInput';

interface CategoryFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterValues) => void;
}

export interface FilterValues {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  userIds: string[];
  updatedDate: Date | null;
}

// Mock users data - in a real app, this would come from an API
const AVAILABLE_USERS: TagOption[] = [
  { id: '1', name: 'Maria G.' },
  { id: '2', name: 'Carlos R.' },
  { id: '3', name: 'Ana P.' },
  { id: '4', name: 'Luis M.' },
  { id: '5', name: 'Sofia T.' },
  { id: '6', name: 'Pedro H.' },
  { id: '7', name: 'Laura V.' },
];

export function CategoryFilterPanel({
  open,
  onOpenChange,
  onApplyFilters,
}: CategoryFilterPanelProps) {
  const [filters, setFilters] = useState<FilterValues>({
    dateRange: { start: null, end: null },
    userIds: ['1'], // Default to Maria G.
    updatedDate: null,
  });

  const handleClear = () => {
    setFilters({
      dateRange: { start: null, end: null },
      userIds: [],
      updatedDate: null,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white">
        <SheetHeader>
          <SheetTitle>Filtros Avanzados</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Rango de Fecha de Creación</Label>
            <div className="grid grid-cols-2 gap-3">
              <DatePickerInput
                value={filters.dateRange.start}
                onChange={(date) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: date } })}
                maxDate={filters.dateRange.end || undefined}
                placeholder="mm/dd/yyyy"
                aria-label="Fecha de inicio"
              />
              <DatePickerInput
                value={filters.dateRange.end}
                onChange={(date) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: date } })}
                minDate={filters.dateRange.start || undefined}
                placeholder="mm/dd/yyyy"
                aria-label="Fecha de fin"
              />
            </div>
          </div>

          {/* Created By (Tags) */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Creado por</Label>
            <TagInput
              options={AVAILABLE_USERS}
              value={filters.userIds}
              onChange={(userIds) => setFilters({ ...filters, userIds })}
              placeholder="Seleccionar usuarios..."
            />
          </div>

          {/* Last Update */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Última Actualización</Label>
            <DatePickerInput
              value={filters.updatedDate}
              onChange={(date) => setFilters({ ...filters, updatedDate: date })}
              maxDate={new Date()}
              placeholder="mm/dd/yyyy"
              iconPosition="left"
              aria-label="Última actualización"
            />
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
