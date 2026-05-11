import { CalendarDays, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExternalConsignmentSalesFilterBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  periodFilter: 'all' | 'today' | 'week' | 'month';
  onPeriodFilterChange: (value: 'all' | 'today' | 'week' | 'month') => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

const PERIOD_LABELS = {
  all: 'Todo el periodo',
  today: 'Hoy',
  week: 'Últimos 7 días',
  month: 'Últimos 30 días',
};

export function ExternalConsignmentSalesFilterBar({
  searchTerm,
  onSearchTermChange,
  periodFilter,
  onPeriodFilterChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: ExternalConsignmentSalesFilterBarProps) {
  return (
    <div className="bg-card p-3 rounded-2xl border border-border shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
      <div className="relative w-full xl:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          placeholder="Buscar por entrega o referencia..."
          className="pl-9 bg-muted/30 border-border h-10 text-xs focus:bg-background transition-colors"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>

      <div className="flex w-full xl:w-auto gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 xl:flex-none justify-between h-10 px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground border-border bg-card hover:bg-muted min-w-[180px] rounded-xl transition-all">
              {PERIOD_LABELS[periodFilter]}
              <ChevronDown className="h-4 w-4 ml-3 shrink-0 opacity-45" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] bg-card border-border shadow-xl rounded-xl p-1">
            {Object.entries(PERIOD_LABELS).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                className="text-[11px] font-medium py-2 rounded-lg cursor-pointer"
                onClick={() => onPeriodFilterChange(value as 'all' | 'today' | 'week' | 'month')}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1">
          <CalendarDays className="h-4 w-4 text-muted-foreground/50" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-8 bg-transparent text-[11px] text-foreground outline-none"
          />
          <span className="text-[10px] font-semibold text-muted-foreground">a</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="h-8 bg-transparent text-[11px] text-foreground outline-none"
          />
        </div>
      </div>
    </div>
  );
}
