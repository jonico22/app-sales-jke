import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    onChange: (dates: [Date | null, Date | null]) => void;
    placeholder?: string;
    className?: string;
}

export const DateRangePicker = ({
    startDate,
    endDate,
    onChange,
    placeholder = 'Seleccionar fechas',
    className
}: DateRangePickerProps) => {

    // Custom Input Component
    const CustomInput = forwardRef<HTMLButtonElement, any>(({ onClick }, ref) => (
        <button
            className={cn(
                "flex items-center gap-2 px-3 py-2 bg-muted/30 hover:bg-muted/50 rounded-lg text-sm text-foreground transition-colors whitespace-nowrap min-w-fit border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold",
                className
            )}
            onClick={onClick}
            ref={ref}
        >
            <Calendar size={16} className="text-primary/70" />
            <span>
                {startDate && endDate ? (
                    <>
                        {format(startDate, 'MMM dd', { locale: es })} - {format(endDate, 'MMM dd, yyyy', { locale: es })}
                    </>
                ) : startDate ? (
                    format(startDate, 'MMM dd, yyyy', { locale: es })
                ) : (
                    placeholder
                )}
            </span>
            <ChevronDown size={14} className="ml-1 opacity-50" />
            {(startDate || endDate) && (
                <div
                    role="button"
                    tabIndex={0}
                    className="ml-1 p-0.5 hover:bg-muted rounded-full cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange([null, null]);
                    }}
                >
                    <X size={12} className="text-muted-foreground" />
                </div>
            )}
        </button>
    ));

    CustomInput.displayName = 'DateRangePickerInput';

    return (
        <div className="relative">
            <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                customInput={<CustomInput />}
                portalId="datepicker-portal"
                calendarClassName="shadow-2xl border-border rounded-2xl font-sans"
                dayClassName={() => "rounded-lg hover:bg-primary/10 hover:text-primary font-medium"}
                monthClassName={() => "font-bold"}
                popperPlacement="bottom-start"
            />
            <style>{`
                .react-datepicker {
                    background-color: var(--card) !important;
                    border: 1px solid var(--border) !important;
                    color: var(--foreground) !important;
                }
                .react-datepicker__header {
                    background-color: var(--muted) !important;
                    border-bottom: 1px solid var(--border) !important;
                    border-radius: 0.75rem 0.75rem 0 0 !important;
                    padding-top: 1rem !important;
                }
                .react-datepicker__current-month,
                .react-datepicker__day-name {
                    color: var(--foreground) !important;
                }
                .react-datepicker__triangle {
                    display: none;
                }
                .react-datepicker__day {
                    color: var(--foreground) !important;
                }
                .react-datepicker__day--selected, 
                .react-datepicker__day--in-selecting-range, 
                .react-datepicker__day--in-range {
                    background-color: #0ea5e9 !important;
                    color: white !important;
                    border-radius: 0.5rem !important;
                }
                .react-datepicker__day--keyboard-selected {
                     background-color: #0ea5e920 !important;
                     color: #0ea5e9 !important;
                }
                .react-datepicker__day--outside-month {
                    color: var(--muted-foreground) !important;
                    opacity: 0.3;
                }
            `}</style>
        </div>
    );
};
