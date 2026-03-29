import * as React from "react";
import { cn } from "@/lib/utils";
import { TableHead } from "@/components/ui/table";
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";

interface SortableTableHeadProps {
  field: string;
  currentSortBy?: string;
  currentSortOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SortableTableHead = React.memo(({
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  children,
  className,
  disabled
}: SortableTableHeadProps) => {
  const isActive = currentSortBy === field;
  
  // Determine alignment based on className
  const isRight = className?.includes('text-right');
  const isCenter = className?.includes('text-center');
  const justifyClass = isRight ? 'justify-end' : isCenter ? 'justify-center' : 'justify-start';

  if (disabled) {
    return (
      <TableHead className={className}>
        <div className={cn("flex items-center gap-1.5", justifyClass)}>
          {children}
        </div>
      </TableHead>
    );
  }

  const sortOrder = isActive ? (currentSortOrder === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <TableHead
      aria-sort={sortOrder as any}
      className={cn(
        "cursor-pointer hover:bg-muted/50 select-none transition-colors group", 
        className
      )}
      onClick={() => onSort(field)}
    >
      <div className={cn("flex items-center gap-1.5", justifyClass)}>
        {children}
        <div className="flex flex-col text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
          {isActive ? (
            currentSortOrder === 'asc' ? 
              <ChevronUp className="h-3.5 w-3.5 text-primary" /> : 
              <ChevronDown className="h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowUpDown className="h-3 w-3" />
          )}
        </div>
      </div>
    </TableHead>
  );
});

SortableTableHead.displayName = 'SortableTableHead';
