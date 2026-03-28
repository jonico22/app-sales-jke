import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface SalesHistoryPaginationProps {
  ordersLength: number;
  currentPage: number;
  pageSize: number;
  totalOrders: number;
  totalPages: number;
  isLoading: boolean;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPageSizeChange: (size: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function SalesHistoryPagination({
  ordersLength,
  currentPage,
  pageSize,
  totalOrders,
  totalPages,
  isLoading,
  hasPrevPage,
  hasNextPage,
  onPageSizeChange,
  onPrevPage,
  onNextPage
}: SalesHistoryPaginationProps) {
  return (
    <div className="px-6 py-5 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/10">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <div className="flex flex-col items-center sm:items-start order-2 sm:order-1">
          <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">Resultados</span>
          <span className="text-[11px] font-bold text-foreground whitespace-nowrap">
            <span className="text-primary">{ordersLength > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, totalOrders)}</span> de <span className="font-bold">{totalOrders}</span> registros
          </span>
        </div>
        <div className="relative w-full sm:w-auto order-1 sm:order-2">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40">
            <SlidersHorizontal size={10} />
          </div>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="w-full sm:w-auto pl-8 pr-8 py-2 bg-card border border-border/50 text-foreground text-[10px] rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary block font-black outline-none transition-all uppercase tracking-wider appearance-none shadow-sm"
          >
            <option value="10">10 / pág</option>
            <option value="20">20 / pág</option>
            <option value="40">40 / pág</option>
            <option value="60">60 / pág</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={10} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 w-full md:w-auto">
        <button
          disabled={!hasPrevPage || isLoading}
          onClick={onPrevPage}
          className="w-10 h-10 flex items-center justify-center border border-border/50 bg-card rounded-xl text-foreground hover:bg-muted disabled:opacity-20 shadow-sm transition-all active:scale-90"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="px-4 py-2 bg-muted/50 border border-border/50 rounded-xl min-w-[100px] text-center shadow-inner">
          <p className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-0.5">Página</p>
          <p className="text-[11px] font-black text-foreground">{currentPage} / {totalPages}</p>
        </div>
        <button
          disabled={!hasNextPage || isLoading}
          onClick={onNextPage}
          className="w-10 h-10 flex items-center justify-center border border-border/50 bg-card rounded-xl text-foreground hover:bg-muted disabled:opacity-20 shadow-sm transition-all active:scale-90"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
