import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from './button';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-muted bg-card text-card-foreground shadow-lg bg-white',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export { Card };
