import * as React from 'react';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-datepicker/dist/react-datepicker.css';

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
export const DatePickerInput = React.forwardRef<HTMLDivElement, DatePickerInputProps>(
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
);

DatePickerInput.displayName = 'DatePickerInput';

/**
 * Custom styles for the react-datepicker calendar popup.
 * These styles override the default react-datepicker styles to match JKE Solutions brand.
 */
export const DatePickerStyles = () => (
  <style>{`
    /* Portal container - must be above Sheet overlay (z-50) */
    #datepicker-portal {
      position: relative;
      z-index: 9999;
    }
    
    #datepicker-portal .react-datepicker-popper {
      z-index: 9999 !important;
    }
    
    /* Calendar container */
    .react-datepicker {
      font-family: 'Montserrat', sans-serif;
      background-color: var(--card) !important;
      border: 1px solid var(--border) !important;
      border-radius: 1rem !important;
      box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.3) !important;
      overflow: hidden;
      color: var(--foreground) !important;
    }
    
    /* Header */
    .react-datepicker__header {
      background: var(--muted) !important;
      border-bottom: 1px solid var(--border) !important;
      padding: 12px 16px !important;
      border-radius: 0 !important;
    }
    
    .react-datepicker__current-month {
      font-weight: 800 !important;
      color: var(--foreground) !important;
      font-size: 0.9375rem !important;
      margin-bottom: 8px !important;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    .react-datepicker__day-names {
      margin-top: 8px !important;
    }
    
    .react-datepicker__day-name {
      color: var(--muted-foreground) !important;
      font-weight: 700 !important;
      font-size: 0.7rem !important;
      width: 2.25rem !important;
      line-height: 2.25rem !important;
      text-transform: uppercase !important;
      opacity: 0.7;
    }
    
    /* Days */
    .react-datepicker__day {
      width: 2.25rem !important;
      line-height: 2.25rem !important;
      border-radius: 0.75rem !important;
      color: var(--foreground) !important;
      font-weight: 600 !important;
      transition: all 0.2s ease !important;
    }
    
    .react-datepicker__day:hover {
      background: #0ea5e920 !important;
      color: #0ea5e9 !important;
    }
    
    .react-datepicker__day--selected,
    .react-datepicker__day--keyboard-selected {
      background: #0ea5e9 !important;
      color: #FFFFFF !important;
      font-weight: 800 !important;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3) !important;
    }
    
    .react-datepicker__day--selected:hover {
      background: #0284c7 !important;
    }
    
    .react-datepicker__day--today {
      font-weight: 800 !important;
      color: #0ea5e9 !important;
      position: relative;
    }
    
    .react-datepicker__day--today::after {
      content: '';
      position: absolute;
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      background: #0ea5e9;
      border-radius: 50%;
    }
    
    .react-datepicker__day--today.react-datepicker__day--selected {
      color: #FFFFFF !important;
    }
    
    .react-datepicker__day--today.react-datepicker__day--selected::after {
      background: #FFFFFF;
    }
    
    .react-datepicker__day--outside-month {
      color: var(--muted-foreground) !important;
      opacity: 0.3;
    }
    
    .react-datepicker__day--disabled {
      color: var(--muted-foreground) !important;
      opacity: 0.15 !important;
      cursor: not-allowed !important;
    }
    
    /* Navigation arrows */
    .react-datepicker__navigation {
      top: 14px !important;
    }
    
    .react-datepicker__navigation-icon::before {
      border-color: var(--muted-foreground) !important;
      border-width: 2.5px 2.5px 0 0 !important;
      height: 8px !important;
      width: 8px !important;
      opacity: 0.6;
    }
    
    .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
      border-color: #0ea5e9 !important;
      opacity: 1;
    }
    
    /* Month container */
    .react-datepicker__month {
      margin: 8px 12px 12px !important;
      background-color: transparent !important;
    }
    
    /* Triangle pointer */
    .react-datepicker__triangle {
      display: none !important;
    }
    
    /* Dark mode specific overrides for inner elements if needed */
    .dark .react-datepicker {
      border-color: var(--border) !important;
    }
  `}</style>
);
