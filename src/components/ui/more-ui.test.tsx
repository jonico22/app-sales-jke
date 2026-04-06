import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Label } from './label';
import { Textarea } from './textarea';
import { Switch } from './switch';

describe('Label Component', () => {
  it('renders correctly', () => {
    render(<Label htmlFor="test">Label Text</Label>);
    const label = screen.getByText(/label text/i);
    expect(label.getAttribute('for')).toBe('test');
    expect(label.className).toContain('text-sm');
  });
});

describe('Textarea Component', () => {
  it('renders correctly and handles input', () => {
    const handleChange = vi.fn();
    render(<Textarea placeholder="Enter text" onChange={handleChange} />);
    const textarea = screen.getByPlaceholderText(/enter text/i);
    fireEvent.change(textarea, { target: { value: 'New text' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows error state', () => {
    render(<Textarea error placeholder="Error state" />);
    const textarea = screen.getByPlaceholderText(/error state/i);
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(textarea.className).toContain('border-red-500');
  });
});

describe('Switch Component', () => {
  it('renders correctly and handles toggling', () => {
    const handleCheckedChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={handleCheckedChange} />);
    const toggle = screen.getByRole('switch') as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    
    // In our implementation, Switch uses a concealed checkbox
    fireEvent.click(toggle);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Switch disabled />);
    const toggle = screen.getByRole('switch');
    expect(toggle.hasAttribute('disabled')).toBe(true);
  });
});
