import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientsPaginationProps {
    clientsLength: number;
    currentPage: number;
    pageLimit: number;
    totalClients: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    isLoading: boolean;
    onPrevPage: () => void;
    onNextPage: () => void;
}

export function ClientsPagination({
    clientsLength, currentPage, pageLimit, totalClients, totalPages,
    hasPrevPage, hasNextPage, isLoading, onPrevPage, onNextPage
}: ClientsPaginationProps) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 border-t border-border bg-card">
            <div className="text-[11px] text-muted-foreground font-medium w-full md:w-auto text-center md:text-left">
                Mostrando <span className="font-bold text-foreground">{clientsLength > 0 ? ((currentPage - 1) * pageLimit) + 1 : 0}-{Math.min(currentPage * pageLimit, totalClients)}</span> de <span className="font-bold text-foreground">{totalClients}</span> clientes registrados
            </div>
            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
                    disabled={!hasPrevPage || isLoading}
                    onClick={onPrevPage}
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
                    onClick={onNextPage}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
