import { type ReactNode } from 'react';
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

export function SlidePanel({
  open,
  onOpenChange,
  title,
  children,
  footer,
}: SlidePanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t border-slate-100 bg-white space-y-3">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
