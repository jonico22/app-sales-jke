import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConsignmentPaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function ConsignmentPagination({
  currentPage,
  pageSize,
  total,
  totalPages,
  hasNextPage,
  hasPrevPage,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
}: ConsignmentPaginationProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 border-t border-border bg-card">
      <div className="flex items-center justify-between w-full md:w-auto gap-4">
        <div className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
          Mostrando <span className="font-bold text-foreground">{total > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, total)}</span> de <span className="font-bold text-foreground">{total}</span>
        </div>
        {onPageSizeChange ? (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-muted/30 border border-border text-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg focus:ring-primary focus:border-primary block p-1.5 h-8 transition-colors hover:bg-muted/50"
          >
            <option value="10">10 Filas</option>
            <option value="20">20 Filas</option>
            <option value="40">40 Filas</option>
          </select>
        ) : null}
      </div>
      <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
          disabled={!hasPrevPage || isLoading}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[80px] text-center">
          Página {currentPage} / {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
          disabled={!hasNextPage || isLoading}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
