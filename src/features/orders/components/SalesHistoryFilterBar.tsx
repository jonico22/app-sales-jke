import { Search, Banknote, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { OrderStatus } from '@/services/order.service';

interface SalesHistoryFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (range: [Date | null, Date | null]) => void;
  statusFilter: 'ALL' | 'COMPLETED' | 'CANCELLED';
  onStatusChange: (status: 'ALL' | 'COMPLETED' | 'CANCELLED') => void;
  onOpenFilters: () => void;
}

export function SalesHistoryFilterBar({
  searchTerm,
  onSearchChange,
  startDate,
  endDate,
  onDateChange,
  statusFilter,
  onStatusChange,
  onOpenFilters
}: SalesHistoryFilterBarProps) {
  return (
    <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col xl:flex-row gap-3 items-center justify-between">
      <div className="relative w-full xl:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          type="text"
          placeholder="Buscar por cliente o ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary text-xs outline-none transition-all placeholder:text-muted-foreground/60 font-medium"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={onDateChange}
        />

        <div className="relative flex-1 sm:flex-none sm:min-w-[180px]">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="w-full appearance-none pl-10 pr-10 py-2 bg-muted/50 hover:bg-muted border border-border rounded-xl text-xs text-foreground focus:outline-none cursor-pointer font-medium transition-colors"
          >
            <option value="ALL">Todos los Estados</option>
            <option value={OrderStatus.COMPLETED}>Completados</option>
            <option value={OrderStatus.CANCELLED}>Cancelados</option>
          </select>
          <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={12} />
        </div>

        <button
          onClick={onOpenFilters}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted border border-border rounded-xl text-xs text-muted-foreground hover:text-foreground transition-all font-medium active:scale-95"
        >
          <SlidersHorizontal size={14} />
          <span>Más Filtros</span>
        </button>
      </div>
    </div>
  );
}
