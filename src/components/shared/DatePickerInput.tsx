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
            'w-full h-11 px-3 rounded-xl border text-sm font-normal transition-all duration-200',
            // Colors following brand guidelines
            'bg-slate-50 border-slate-200 text-secondary placeholder:text-slate-400',
            // Focus states using primary color
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            // Disabled states
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100',
            // Icon padding
            iconPosition === 'left' ? 'pl-10' : 'pr-10',
            className
          )}
          wrapperClassName="w-full"
        />
        <Calendar
          className={cn(
            'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none',
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
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    /* Header */
    .react-datepicker__header {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 16px;
      border-radius: 0;
    }
    
    .react-datepicker__current-month {
      font-weight: 700;
      color: #334155;
      font-size: 0.9375rem;
      margin-bottom: 8px;
    }
    
    .react-datepicker__day-names {
      margin-top: 8px;
    }
    
    .react-datepicker__day-name {
      color: #94a3b8;
      font-weight: 600;
      font-size: 0.75rem;
      width: 2.25rem;
      line-height: 2.25rem;
      text-transform: uppercase;
    }
    
    /* Days */
    .react-datepicker__day {
      width: 2.25rem;
      line-height: 2.25rem;
      border-radius: 0.5rem;
      color: #334155;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    
    .react-datepicker__day:hover {
      background: #E0F7FF;
      color: #00BFFF;
      border-radius: 0.5rem;
    }
    
    .react-datepicker__day--selected,
    .react-datepicker__day--keyboard-selected {
      background: #00BFFF !important;
      color: #FFFFFF !important;
      font-weight: 600;
    }
    
    .react-datepicker__day--selected:hover {
      background: #0099CC !important;
    }
    
    .react-datepicker__day--today {
      font-weight: 700;
      color: #00BFFF;
    }
    
    .react-datepicker__day--today.react-datepicker__day--selected {
      color: #FFFFFF;
    }
    
    .react-datepicker__day--outside-month {
      color: #cbd5e1;
    }
    
    .react-datepicker__day--disabled {
      color: #cbd5e1 !important;
      cursor: not-allowed;
    }
    
    .react-datepicker__day--disabled:hover {
      background: transparent;
    }
    
    /* Navigation arrows */
    .react-datepicker__navigation {
      top: 14px;
    }
    
    .react-datepicker__navigation-icon::before {
      border-color: #64748b;
      border-width: 2px 2px 0 0;
      height: 8px;
      width: 8px;
    }
    
    .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
      border-color: #00BFFF;
    }
    
    /* Month container */
    .react-datepicker__month {
      margin: 8px 12px 12px;
    }
    
    /* Triangle pointer */
    .react-datepicker__triangle {
      display: none;
    }
    
    /* Time picker if needed */
    .react-datepicker__time-container {
      border-left: 1px solid #e2e8f0;
    }
    
    .react-datepicker__time-list-item {
      font-family: 'Montserrat', sans-serif;
      font-size: 0.875rem;
    }
    
    .react-datepicker__time-list-item:hover {
      background: #E0F7FF !important;
      color: #00BFFF;
    }
    
    .react-datepicker__time-list-item--selected {
      background: #00BFFF !important;
    }
  `}</style>
);
