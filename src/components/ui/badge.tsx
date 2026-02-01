import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'secondary' | 'outline' | 'destructive';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          {
            'border-transparent bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/80': variant === 'default',
            'border-transparent bg-green-100 text-green-700': variant === 'success',
            'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'text-foreground border border-slate-200': variant === 'outline',
            'border-transparent bg-slate-100 text-slate-500': variant === 'destructive', // Using destructive for 'Inactive' style based on image if needed, or just gray
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
