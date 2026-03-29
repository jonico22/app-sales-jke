import { type ReactNode, memo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SlidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const SlidePanel = memo(({
  open,
  onOpenChange,
  title,
  children,
  footer,
}: SlidePanelProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6 bg-card">
          {children}
        </div>

        {footer && (
          <div className="p-6 pb-8 border-t border-border bg-card/95 space-y-3 shrink-0 backdrop-blur-md shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.1)] pb-safe">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
});

SlidePanel.displayName = 'SlidePanel';
