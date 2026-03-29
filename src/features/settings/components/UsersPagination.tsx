import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UsersPaginationProps {
  currentPage: number;
  usersPerPage: number;
  totalFilteredUsers: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function UsersPagination({
  currentPage,
  usersPerPage,
  totalFilteredUsers,
  totalPages,
  onPageChange
}: UsersPaginationProps) {
  if (totalFilteredUsers === 0) return null;

  return (
    <div className="p-4 sm:p-3 border-t border-border bg-muted/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
      <div className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-tight w-full sm:w-auto text-center sm:text-left">
        Mostrando <span className="font-black text-foreground bg-muted px-1.5 py-0.5 rounded-lg">{(currentPage - 1) * usersPerPage + 1}-{Math.min(currentPage * usersPerPage, totalFilteredUsers)}</span> de <span className="font-black text-foreground bg-muted px-1.5 py-0.5 rounded-lg">{totalFilteredUsers}</span>
      </div>
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center border border-border text-muted-foreground hover:bg-muted bg-card rounded-xl sm:rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 px-2 bg-muted/20 py-1 rounded-xl border border-border/40">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-7 h-7 flex items-center justify-center text-[10px] font-black rounded-lg transition-all active:scale-95 ${currentPage === page
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center border border-border text-muted-foreground hover:bg-muted bg-card rounded-xl sm:rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
        >
          <ChevronRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
}
