import { type LabelHTMLAttributes, forwardRef } from 'react';
import { cn } from './button';

const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export { Label };
