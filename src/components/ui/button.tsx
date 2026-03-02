import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer hover:shadow-md active:scale-[0.98]',
          {
            // Variants
            'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] border border-transparent': variant === 'primary',
            'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-secondary-hover)] border border-[var(--color-secondary-border)]': variant === 'secondary',
            'bg-[var(--color-danger)] text-[var(--color-danger-foreground)] hover:bg-[var(--color-danger-hover)] border border-transparent': variant === 'danger',
            'bg-transparent hover:bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--color-secondary-border)]': variant === 'outline',
            'bg-transparent hover:bg-[var(--color-muted)] text-[var(--color-foreground)] border border-transparent': variant === 'ghost',
            // Sizes
            'h-9 px-4 text-sm rounded-lg': size === 'sm',
            'h-10 px-5 text-sm': size === 'md',
            'h-12 px-8 text-base': size === 'lg',
            'h-10 w-10 shrink-0 p-0 rounded-xl': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
