import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationPaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    currentItemsCount: number;
    onPageChange: (page: number | ((prev: number) => number)) => void;
}

export function NotificationPagination({
    page,
    totalPages,
    totalItems,
    currentItemsCount,
    onPageChange
}: NotificationPaginationProps) {
    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-6 bg-card/40 rounded-2xl sm:rounded-[2rem] border border-border/40 backdrop-blur-sm">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest text-center sm:text-left">
                Mostrando <span className="text-primary">{currentItemsCount}</span> de <span className="text-primary">{totalItems}</span>
            </p>

            <div className="flex items-center gap-2 sm:gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl border-border/50"
                    onClick={() => onPageChange(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <div className="flex items-center gap-1 sm:gap-2">
                    {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                            <Button
                                key={pageNum}
                                variant={page === pageNum ? "primary" : "ghost"}
                                className={cn(
                                    "h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm",
                                    page === pageNum && "shadow-lg shadow-primary/30"
                                )}
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                    {totalPages > 3 && page > 3 && (
                        <span className="text-muted-foreground">...</span>
                    )}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl border-border/50"
                    onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
            </div>
        </div>
    );
}
