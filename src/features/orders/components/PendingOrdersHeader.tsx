import { Clock, Search } from 'lucide-react';

interface PendingOrdersHeaderProps {
  ordersCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export function PendingOrdersHeader({ ordersCount, searchQuery, onSearchChange }: PendingOrdersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Pedidos Pendientes</h1>
        <div className="h-5 w-px bg-border hidden md:block"></div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
          <Clock className="w-4 h-4" />
          <span>{ordersCount} órdenes en espera</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-full md:w-64">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar orden..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>
    </div>
  );
}
