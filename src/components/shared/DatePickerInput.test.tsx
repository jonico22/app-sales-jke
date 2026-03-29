import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DatePickerInput } from './DatePickerInput';

// Mock react-datepicker to simplify testing in JSDOM
vi.mock('react-datepicker', () => ({
  default: ({ onChange, placeholderText, selected, disabled }: any) => (
    <input 
      data-testid="mock-datepicker"
      placeholder={placeholderText}
      disabled={disabled}
      value={selected ? selected.toISOString() : ''}
      onChange={(e) => onChange(new Date(e.target.value))}
    />
  )
}));

describe('DatePickerInput Component', () => {
  it('renders correctly with placeholder', () => {
    render(<DatePickerInput value={null} onChange={() => {}} placeholder="Select Date" />);
    expect(screen.getByPlaceholderText(/select date/i)).toBeDefined();
  });

  it('calls onChange when date is selected', () => {
    const handleChange = vi.fn();
    render(<DatePickerInput value={null} onChange={handleChange} />);
    const input = screen.getByTestId('mock-datepicker');
    
    fireEvent.change(input, { target: { value: '2024-03-29' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when the disabled prop is true', () => {
    render(<DatePickerInput value={null} onChange={() => {}} disabled />);
    const input = screen.getByTestId('mock-datepicker');
    expect(input.hasAttribute('disabled')).toBe(true);
  });
});
