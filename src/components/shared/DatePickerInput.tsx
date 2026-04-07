import * as React from 'react';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css';

export interface DatePickerInputProps {
  /** The selected date value */
  value: Date | null;
  /** Callback when date changes */
  onChange: (date: Date | null) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Date format string */
  dateFormat?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional class names for the input */
  className?: string;
  /** Position of the calendar icon */
  iconPosition?: 'left' | 'right';
  /** Label for accessibility */
  'aria-label'?: string;
}

/**
 * DatePickerInput - A styled date picker component following JKE Solutions brand guidelines.
 * 
 * Uses react-datepicker under the hood with custom styling to match the design system.
 * Supports min/max date validation, custom formatting, and icon positioning.
 */
export const DatePickerInput = React.memo(React.forwardRef<HTMLDivElement, DatePickerInputProps>(
  (
    {
      value,
      onChange,
      placeholder = 'dd/mm/yyyy',
      minDate,
      maxDate,
      dateFormat = 'dd/MM/yyyy',
      disabled = false,
      className,
      iconPosition = 'right',
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="relative w-full">
        <DatePicker
          selected={value}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText={placeholder}
          dateFormat={dateFormat}
          disabled={disabled}
          aria-label={ariaLabel}
          portalId="datepicker-portal"
          popperPlacement="bottom-start"
          className={cn(
            // Base styles
            'w-full h-11 px-3 rounded-xl border text-sm font-bold transition-all duration-200',
            // Theme-aware colors
            'bg-muted/30 border-input text-foreground placeholder:text-muted-foreground/60 focus:bg-background',
            // Focus states using primary color
            'focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary',
            // Disabled states
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted/10',
            // Icon padding
            iconPosition === 'left' ? 'pl-10' : 'pr-10',
            className
          )}
          wrapperClassName="w-full"
        />
        <Calendar
          className={cn(
            'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none',
            iconPosition === 'left' ? 'left-3' : 'right-3'
          )}
        />
      </div>
    );
  }
));

DatePickerInput.displayName = 'DatePickerInput';
