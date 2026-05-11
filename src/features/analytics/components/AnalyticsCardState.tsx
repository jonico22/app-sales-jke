import { AlertCircle, Inbox } from 'lucide-react';

interface AnalyticsCardStateProps {
  description?: string;
  heightClass?: string;
  title: string;
  variant: 'empty' | 'error' | 'loading';
}

export function AnalyticsCardState({
  description,
  heightClass = 'h-[320px]',
  title,
  variant,
}: AnalyticsCardStateProps) {
  if (variant === 'loading') {
    return (
      <div className={`rounded-[24px] border border-border/60 bg-muted/30 p-5 ${heightClass}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-40 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-[20px] bg-muted" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-14 animate-pulse rounded-2xl bg-muted" />
              <div className="h-14 animate-pulse rounded-2xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isError = variant === 'error';
  const Icon = isError ? AlertCircle : Inbox;
  const iconToneClassName = isError
    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    : 'bg-muted text-muted-foreground';

  return (
    <div
      className={`flex items-center justify-center rounded-[24px] border border-dashed border-border bg-muted/15 px-6 text-center ${heightClass}`}
    >
      <div className="max-w-[280px]">
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${iconToneClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
