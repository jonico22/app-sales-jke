import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KardexPaginationProps {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    isLoading: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    displayedCount: number;
}

export function KardexPagination({
    currentPage,
    totalPages,
    totalRecords,
    pageSize,
    hasNextPage,
    hasPrevPage,
    isLoading,
    onPageChange,
    onPageSizeChange,
    displayedCount
}: KardexPaginationProps) {
    return (
        <div className="px-6 py-5 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/10">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex flex-col order-2 sm:order-1">
                    <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">Resultados</span>
                    <span className="text-[11px] font-bold text-foreground whitespace-nowrap">
                        <span className="text-primary">{displayedCount > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-{Math.min(currentPage * pageSize, totalRecords)}</span> de <span className="font-bold">{totalRecords}</span> registros
                    </span>
                </div>
                <div className="relative order-1 sm:order-2">
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="pl-3 pr-8 py-2 bg-card border border-border/50 text-foreground text-[10px] rounded-xl focus:ring-4 focus:ring-primary/10 block font-black outline-none tracking-wider appearance-none shadow-sm cursor-pointer"
                    >
                        <option value="20">20 / PÁG</option>
                        <option value="40">40 / PÁG</option>
                        <option value="60">60 / PÁG</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" size={10} />
                </div>
            </div>
            <div className="flex items-center justify-center gap-2 w-full md:w-auto">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={!hasPrevPage || isLoading}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="w-10 h-10 rounded-xl border-border/50 bg-card hover:bg-muted disabled:opacity-20 active:scale-90 transition-all"
                >
                    <ChevronLeft size={16} />
                </Button>
                <div className="px-5 py-2 bg-card border border-border/50 rounded-xl min-w-[100px] text-center shadow-sm">
                    <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-0.5">Página</p>
                    <p className="text-[11px] font-black text-foreground leading-tight">{currentPage} / {totalPages}</p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    disabled={!hasNextPage || isLoading}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="w-10 h-10 rounded-xl border-border/50 bg-card hover:bg-muted disabled:opacity-20 active:scale-90 transition-all"
                >
                    <ChevronRight size={16} />
                </Button>
            </div>
        </div>
    );
}
