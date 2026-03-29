import { SlidersHorizontal } from 'lucide-react';

interface PendingOrdersFilterBarProps {
  sortBy: string;
  onSortChange: (val: string) => void;
}

export function PendingOrdersFilterBar({ sortBy, onSortChange }: PendingOrdersFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/20 p-2 rounded-xl border border-border">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/50 transition-colors shadow-sm">
          <SlidersHorizontal className="w-4 h-4" />
          Filtrar
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        <span>Ordenar por:</span>
        <select
          className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer text-xs"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="createdAt">Tiempo de espera</option>
          <option value="totalAmount">Monto total</option>
        </select>
      </div>
    </div>
  );
}
