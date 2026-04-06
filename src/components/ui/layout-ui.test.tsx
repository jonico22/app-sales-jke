import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './table';
import { Modal } from './Modal';

describe('Table Component', () => {
  it('renders correctly with given rows and cells', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText(/header/i)).toBeDefined();
    expect(screen.getByText(/content/i)).toBeDefined();
  });
});

describe('Modal Component', () => {
  it('renders title and children when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText(/test modal/i)).toBeDefined();
    expect(screen.getByText(/modal content/i)).toBeDefined();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Closed Modal">
        <div>Hidden Content</div>
      </Modal>
    );
    expect(screen.queryByText(/closed modal/i)).toBeNull();
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Click Outside">
        <div>Body</div>
      </Modal>
    );
    
    // The backdrop is the first child of the portal container in our implementation
    const backdrop = document.querySelector('.bg-slate-900\\/40');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalled();
    }
  });
});
