import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  leading?: ReactNode;
  topContent?: ReactNode;
  meta?: ReactNode;
  titleAs?: ElementType;
  className?: string;
  contentClassName?: string;
  headingClassName?: string;
  textBlockClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  actionsClassName?: string;
  leadingClassName?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  leading,
  topContent,
  meta,
  titleAs: TitleTag = 'h1',
  className,
  contentClassName,
  headingClassName,
  textBlockClassName,
  titleClassName,
  subtitleClassName,
  actionsClassName,
  leadingClassName,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between',
        className,
      )}
    >
      <div className={cn('min-w-0 flex-1 space-y-3', contentClassName)}>
        {topContent}

        <div className={cn('flex items-start gap-3', headingClassName)}>
          {leading ? (
            <div className={cn('shrink-0 pt-0.5', leadingClassName)}>{leading}</div>
          ) : null}

          <div className={cn('min-w-0 space-y-1.5', textBlockClassName)}>
            <TitleTag
              className={cn(
                'text-lg sm:text-xl font-black tracking-tight uppercase leading-tight text-foreground',
                titleClassName,
              )}
            >
              {title}
            </TitleTag>

            {subtitle ? (
              <p
                className={cn(
                  'text-xs sm:text-sm font-medium leading-relaxed text-muted-foreground',
                  subtitleClassName,
                )}
              >
                {subtitle}
              </p>
            ) : null}

            {meta}
          </div>
        </div>
      </div>

      {actions ? (
        <div
          className={cn(
            'flex flex-wrap items-center gap-2 sm:gap-3 shrink-0',
            actionsClassName,
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
