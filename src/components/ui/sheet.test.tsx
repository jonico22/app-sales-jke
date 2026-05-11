import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sheet, SheetContent, SheetHeader } from './sheet';

describe('Sheet', () => {
  it('renders content when open is true', () => {
    render(
      <Sheet open={true} onOpenChange={vi.fn()}>
        <SheetContent>
          <div>Panel Content</div>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  it('does not render content when open is false', () => {
    render(
      <Sheet open={false} onOpenChange={vi.fn()}>
        <SheetContent>
          <div>Hidden Panel</div>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.queryByText('Hidden Panel')).not.toBeInTheDocument();
  });

  it('calls onOpenChange with false when the backdrop is clicked', () => {
    const handleOpenChange = vi.fn();

    render(
      <Sheet open={true} onOpenChange={handleOpenChange}>
        <SheetContent>
          <div>Closable Panel</div>
        </SheetContent>
      </Sheet>,
    );

    const backdrop = document.querySelector('.bg-black\\/60');
    expect(backdrop).toBeTruthy();

    fireEvent.click(backdrop!);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange with false from the header close button', () => {
    const handleOpenChange = vi.fn();

    render(
      <Sheet open={true} onOpenChange={handleOpenChange}>
        <SheetContent>
          <SheetHeader>
            <span>Header Title</span>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
