import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ProgressItem {
  label: string;
  value: number;
  formattedValue?: string;
  percentage: number;
}

interface BaseProgressListProps {
  items: ProgressItem[];
  barColor?: string;
  className?: string;
}

export const BaseProgressList = memo(({
  items,
  barColor = 'bg-indigo-500',
  className
}: BaseProgressListProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-foreground">{item.label}</span>
            <span className="text-foreground">{item.formattedValue || item.value}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={cn("h-3 rounded-full transition-all duration-500", barColor)}
              style={{ width: `${Math.min(item.percentage, 100)}%` }}
            />
          </div>
          <div className="text-right text-[10px] text-muted-foreground font-medium">
            {item.percentage.toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  );
});

BaseProgressList.displayName = 'BaseProgressList';
