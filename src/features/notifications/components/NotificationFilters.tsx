import { Search, Filter, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { DatePickerInput } from '@/components/shared/DatePickerInput';
import { NotificationType } from '@/services/notification.service';
import { cn } from '@/lib/utils';

interface NotificationFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    typeFilter: NotificationType | 'all';
    onTypeFilterChange: (value: NotificationType | 'all') => void;
    startDate: Date | null;
    onStartDateChange: (date: Date | null) => void;
    endDate: Date | null;
    onEndDateChange: (date: Date | null) => void;
}

const types = [
    { label: 'Todas las categorías', value: 'all' },
    { label: 'Ventas', value: NotificationType.SALES },
    { label: 'Información', value: NotificationType.INFO },
    { label: 'Éxito', value: NotificationType.SUCCESS },
    { label: 'Advertencia', value: NotificationType.WARNING },
    { label: 'Error', value: NotificationType.ERROR },
    { label: 'Sistema', value: NotificationType.SYSTEM },
];

export function NotificationFilters({
    search,
    onSearchChange,
    typeFilter,
    onTypeFilterChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange
}: NotificationFiltersProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 bg-card/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-border/50 shadow-xl shadow-slate-200/20 dark:shadow-none">
            <div className="lg:col-span-4 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Buscar..."
                    className="pl-12 bg-muted/50 border-transparent h-10 sm:h-12 text-sm rounded-xl sm:rounded-2xl focus:bg-background transition-all"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="lg:col-span-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full h-10 sm:h-12 justify-between bg-muted/50 border-transparent rounded-xl sm:rounded-2xl px-5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all">
                            <div className="flex items-center gap-3">
                                <Filter className="h-4 w-4 text-primary/60" />
                                <span className="truncate max-w-[120px]">{types.find(t => t.value === typeFilter)?.label}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 rotate-90" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 rounded-xl p-2 shadow-2xl border-border/50 backdrop-blur-xl">
                        {types.map((type) => (
                            <DropdownMenuItem
                                key={type.value}
                                onClick={() => onTypeFilterChange(type.value as any)}
                                className={cn(
                                    "rounded-lg py-2 px-4 text-sm mb-1 transition-colors",
                                    typeFilter === type.value
                                        ? "bg-primary text-primary-foreground font-bold"
                                        : "hover:bg-primary/10 text-muted-foreground"
                                )}
                            >
                                {type.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-2 sm:gap-3">
                <DatePickerInput
                    value={startDate}
                    onChange={onStartDateChange}
                    placeholder="Desde"
                    className="h-10 sm:h-12 bg-muted/50 border-transparent rounded-xl sm:rounded-2xl text-xs sm:text-sm"
                />
                <DatePickerInput
                    value={endDate}
                    onChange={onEndDateChange}
                    placeholder="Hasta"
                    className="h-10 sm:h-12 bg-muted/50 border-transparent rounded-xl sm:rounded-2xl text-xs sm:text-sm"
                />
            </div>
        </div>
    );
}
