import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import { Card, CardHeader, CardTitle, CardContent } from './card';

describe('Badge Component', () => {
  it('renders correctly with default variant', () => {
    render(<Badge>Test Badge</Badge>);
    const badge = screen.getByText(/test badge/i);
    expect(badge.className).toContain('bg-[#0ea5e9]');
  });

  it('renders different variants', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText(/success/i).className).toContain('bg-green-100');
    
    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText(/warning/i).className).toContain('bg-amber-100');
  });
});

describe('Checkbox Component', () => {
  it('renders correctly and handles checked state', () => {
    const handleChange = vi.fn();
    render(<Checkbox onChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalled();
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.hasAttribute('disabled')).toBe(true);
  });
});

describe('Card Component', () => {
  it('renders card with title and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Card Content</CardContent>
      </Card>
    );
    expect(screen.getByText(/card title/i)).toBeDefined();
    expect(screen.getByText(/card content/i)).toBeDefined();
  });
});
