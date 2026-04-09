import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoriesPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCategories: number;
  pageLimit: number;
  categoriesCount: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  isLoading: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function CategoriesPagination({
  currentPage,
  totalPages,
  totalCategories,
  pageLimit,
  categoriesCount,
  hasPrevPage,
  hasNextPage,
  isLoading,
  onPrevPage,
  onNextPage
}: CategoriesPaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 gap-4 border-t border-border bg-card">
      <div className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.08em] w-full sm:w-auto text-center sm:text-left">
        Mostrando <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded-lg">{categoriesCount > 0 ? ((currentPage - 1) * pageLimit) + 1 : 0}-{Math.min(currentPage * pageLimit, totalCategories)}</span> de <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded-lg">{totalCategories}</span> categorías
      </div>
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-xl transition-all active:scale-95 shadow-sm"
          disabled={!hasPrevPage || isLoading}
          onClick={onPrevPage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-[10px] font-semibold text-foreground uppercase tracking-[0.08em] min-w-[100px] text-center bg-muted/20 px-3 py-1.5 rounded-xl border border-border/40">
          {currentPage} / {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-xl transition-all active:scale-95 shadow-sm"
          disabled={!hasNextPage || isLoading}
          onClick={onNextPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
