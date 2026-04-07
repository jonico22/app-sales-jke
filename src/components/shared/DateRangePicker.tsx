import { forwardRef, type MouseEventHandler } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css';

interface DateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    onChange: (dates: [Date | null, Date | null]) => void;
    placeholder?: string;
    className?: string;
}

interface DateRangePickerInputProps {
    displayText: string;
    hasSelection: boolean;
    className?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    onClear: () => void;
}

const DateRangePickerInput = forwardRef<HTMLButtonElement, DateRangePickerInputProps>(
    ({ displayText, hasSelection, className, onClick, onClear }, ref) => (
        <button
            type="button"
            className={cn(
                "flex items-center gap-2 px-3 py-2 bg-muted/30 hover:bg-muted/50 rounded-lg text-sm text-foreground transition-colors whitespace-nowrap min-w-fit border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold",
                className
            )}
            onClick={onClick}
            ref={ref}
        >
            <Calendar size={16} className="text-primary/70" />
            <span>{displayText}</span>
            <ChevronDown size={14} className="ml-1 opacity-50" />
            {hasSelection ? (
                <span
                    aria-label="Limpiar rango de fechas"
                    className="ml-1 p-0.5 hover:bg-muted rounded-full cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                >
                    <X size={12} className="text-muted-foreground" />
                </span>
            ) : null}
        </button>
    )
);

DateRangePickerInput.displayName = 'DateRangePickerInput';

export const DateRangePicker = ({
    startDate,
    endDate,
    onChange,
    placeholder = 'Seleccionar fechas',
    className
}: DateRangePickerProps) => {
    const displayText = startDate && endDate
        ? `${format(startDate, 'MMM dd', { locale: es })} - ${format(endDate, 'MMM dd, yyyy', { locale: es })}`
        : startDate
            ? format(startDate, 'MMM dd, yyyy', { locale: es })
            : placeholder;

    return (
        <div className="relative">
            <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                customInput={
                    <DateRangePickerInput
                        displayText={displayText}
                        hasSelection={!!(startDate || endDate)}
                        className={className}
                        onClear={() => onChange([null, null])}
                    />
                }
                portalId="datepicker-portal"
                calendarClassName="shadow-2xl border-border rounded-2xl font-sans"
                dayClassName={() => "rounded-lg hover:bg-primary/10 hover:text-primary font-medium"}
                monthClassName={() => "font-bold"}
                popperPlacement="bottom-start"
            />
        </div>
    );
};
