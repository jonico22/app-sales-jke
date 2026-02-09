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
                "flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-600 transition-colors whitespace-nowrap min-w-fit border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none",
                className
            )}
            onClick={onClick}
            ref={ref}
        >
            <Calendar size={16} className="text-gray-500" />
            <span className="font-medium">
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
                    className="ml-1 p-0.5 hover:bg-gray-200 rounded-full cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange([null, null]);
                    }}
                >
                    <X size={12} className="text-gray-400" />
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
                calendarClassName="shadow-xl border-gray-100 rounded-xl font-sans"
                dayClassName={(date) => "rounded-lg hover:bg-blue-50 hover:text-blue-600"}
                monthClassName={() => "font-medium"}
                popperPlacement="bottom-start"
            />
            <style>{`
                .react-datepicker__header {
                    background-color: white;
                    border-bottom: 1px solid #f3f4f6;
                    border-radius: 0.75rem 0.75rem 0 0;
                    padding-top: 1rem;
                }
                .react-datepicker__triangle {
                    display: none;
                }
                .react-datepicker__day--selected, 
                .react-datepicker__day--in-selecting-range, 
                .react-datepicker__day--in-range {
                    background-color: #2563eb !important;
                    color: white !important;
                    border-radius: 0.5rem;
                }
                .react-datepicker__day--keyboard-selected {
                     background-color: #dbeafe !important;
                     color: #1e40af !important;
                }
            `}</style>
        </div>
    );
};
