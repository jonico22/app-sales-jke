import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './input';

describe('Input Component', () => {
  it('renders correctly with default type', () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText(/type here/i) as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.className).toContain('border-input');
  });

  it('renders different input types', () => {
    render(<Input type="password" placeholder="Password" />);
    const input = screen.getByPlaceholderText(/password/i);
    expect(input.getAttribute('type')).toBe('password');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="Update" />);
    const input = screen.getByPlaceholderText(/update/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows error state and aria-invalid', () => {
    render(<Input error placeholder="Invalid" />);
    const input = screen.getByPlaceholderText(/invalid/i);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.className).toContain('border-red-500');
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText(/disabled/i);
    expect(input.hasAttribute('disabled')).toBe(true);
    expect(input.className).toContain('disabled:opacity-50');
  });
});
