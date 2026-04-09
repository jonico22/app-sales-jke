import { cn } from '@/lib/utils';

export const dataTableShellClassName =
  'overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm';

export const dataTableHeaderRowClassName =
  'bg-slate-100/90 dark:bg-slate-800/90 border-b border-border/80';

export const dataTableHeadClassName =
  'text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300';

export const dataTableRowClassName =
  'border-b border-border/70 transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/60 group';

export const dataTableCellPrimaryClassName =
  'text-[11px] font-semibold text-slate-800 dark:text-slate-100';

export const dataTableCellSecondaryClassName =
  'text-[10px] font-medium text-slate-500 dark:text-slate-400';

export const dataTableCellNumericClassName =
  'text-[11px] font-semibold tabular-nums text-slate-700 dark:text-slate-200';

export const dataTableCellMutedNumericClassName =
  'text-[11px] font-semibold tabular-nums text-slate-500 dark:text-slate-400';

export const dataTableCellCodeClassName =
  'font-mono text-[10px] font-medium tracking-[0.02em] text-slate-600 dark:text-slate-300';

export const dataTableActionButtonClassName =
  'h-8 w-8 rounded-lg p-0 text-slate-500 transition-colors dark:text-slate-300';

export const dataTableActionPrimaryClassName =
  'hover:bg-primary/10 hover:text-primary';

export const dataTableActionDestructiveClassName =
  'hover:bg-destructive/10 hover:text-destructive';

export const dataTableActionNeutralClassName =
  'hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100';

export const dataTableActionIconClassName = 'h-4 w-4';

export const dataTableFooterClassName =
  'px-6 py-4 border-t border-border/80 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/30';

export function dataTableHead(extra?: string) {
  return cn(dataTableHeadClassName, extra);
}

export function dataTableRow(extra?: string) {
  return cn(dataTableRowClassName, extra);
}
