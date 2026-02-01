import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button, Input, Label } from '@/components/ui';
import { DatePickerInput } from '@/components/shared/DatePickerInput';

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
  productCount: {
    min: string;
    max: string;
  };
  users: string[];
  updatedDate: Date | null;
}

export function CategoryFilterPanel({
  open,
  onOpenChange,
  onApplyFilters,
}: CategoryFilterPanelProps) {
  const [filters, setFilters] = useState<FilterValues>({
    dateRange: { start: null, end: null },
    productCount: { min: '', max: '' },
    users: ['Maria G.'],
    updatedDate: null,
  });

  const handleClear = () => {
    setFilters({
      dateRange: { start: null, end: null },
      productCount: { min: '', max: '' },
      users: [],
      updatedDate: null,
    });
  };

  const handleRemoveUser = (userName: string) => {
    setFilters(prev => ({
      ...prev,
      users: prev.users.filter(u => u !== userName)
    }));
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
                onChange={(date) => setFilters({...filters, dateRange: {...filters.dateRange, start: date}})}
                maxDate={filters.dateRange.end || undefined}
                placeholder="mm/dd/yyyy"
                aria-label="Fecha de inicio"
              />
              <DatePickerInput
                value={filters.dateRange.end}
                onChange={(date) => setFilters({...filters, dateRange: {...filters.dateRange, end: date}})}
                minDate={filters.dateRange.start || undefined}
                placeholder="mm/dd/yyyy"
                aria-label="Fecha de fin"
              />
            </div>
          </div>

          {/* Product Count Range */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Cantidad de Productos Asociados</Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">MIN</span>
                <Input 
                  type="number" 
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-600"
                  placeholder="0"
                  value={filters.productCount.min}
                  onChange={(e) => setFilters({...filters, productCount: {...filters.productCount, min: e.target.value}})}
                />
              </div>
              <span className="text-slate-300">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">MAX</span>
                <Input 
                  type="number" 
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-600"
                  placeholder="999"
                  value={filters.productCount.max}
                  onChange={(e) => setFilters({...filters, productCount: {...filters.productCount, max: e.target.value}})}
                />
              </div>
            </div>
          </div>

          {/* Created By (Tags) */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Creado por</Label>
            <div className="min-h-[44px] p-1.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-[#0ea5e9] focus-within:border-transparent transition-all">
              {filters.users.map(user => (
                <div key={user} className="bg-sky-100 text-sky-700 text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                  {user}
                  <button onClick={() => handleRemoveUser(user)} className="hover:text-sky-900 focus:outline-none">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <input 
                className="bg-transparent border-none outline-none text-sm text-slate-600 placeholder:text-slate-400 flex-1 min-w-[120px] px-2"
                placeholder={filters.users.length === 0 ? "Seleccionar usuarios..." : ""}
              />
            </div>
          </div>

          {/* Last Update */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Última Actualización</Label>
            <DatePickerInput
              value={filters.updatedDate}
              onChange={(date) => setFilters({...filters, updatedDate: date})}
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
