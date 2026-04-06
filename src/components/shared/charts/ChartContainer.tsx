import React from 'react';
import { MoreVertical, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
  children: React.ReactNode;
  headerColor?: string; // e.g. 'border-primary', 'border-indigo-500'
  actions?: React.ReactNode;
}

export const ChartContainer = React.memo(({
  title,
  subtitle,
  isLoading,
  isEmpty,
  emptyIcon,
  emptyMessage = 'Sin datos disponibles',
  className,
  children,
  headerColor = 'border-primary',
  actions
}: ChartContainerProps) => {
  return (
    <div className={cn("bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col min-h-[400px]", className)}>
      <div className="flex items-center justify-between mb-8">
        <div className={cn("flex flex-col border-l-4 pl-3 h-auto", headerColor)}>
          <span className="font-bold text-foreground uppercase tracking-wide text-xs">{title}</span>
          {subtitle && <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{subtitle}</span>}
        </div>
        {actions ? actions : (
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 w-full min-w-0 min-h-[250px] relative flex flex-col">
        {isLoading ? (
          <div className="flex-1 w-full flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/20 p-8 text-center">
            {emptyIcon}
            <p className="text-xs text-muted-foreground mt-2">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
});

ChartContainer.displayName = 'ChartContainer';
