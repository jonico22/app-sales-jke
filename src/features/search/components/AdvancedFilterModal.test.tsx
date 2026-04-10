import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdvancedFilterModal } from './AdvancedFilterModal';

const filters = {
  categoryId: '',
  brand: '',
  color: '',
  priceFrom: 0,
  priceTo: 1000,
  stockStatus: 'all' as const,
};

const categories = [
  { id: 'cat-1', name: 'Utiles' },
  { id: 'cat-2', name: 'Oficina' },
];

const brands = [
  { id: 'brand-1', brand: 'Faber' },
  { id: 'brand-2', brand: 'Pilot' },
];

describe('AdvancedFilterModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when closed', () => {
    const { container } = render(
      <AdvancedFilterModal
        isOpen={false}
        onClose={vi.fn()}
        filters={filters}
        categories={categories as never}
        brands={brands as never}
        onApply={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('filters categories and applies the local selection', () => {
    const onApply = vi.fn();
    const onClose = vi.fn();

    render(
      <AdvancedFilterModal
        isOpen={true}
        onClose={onClose}
        filters={filters}
        categories={categories as never}
        brands={brands as never}
        onApply={onApply}
        onReset={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/buscar categoría/i), {
      target: { value: 'ofi' },
    });

    expect(screen.queryByText('Utiles')).not.toBeInTheDocument();
    expect(screen.getByText('Oficina')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Oficina'));
    fireEvent.click(screen.getByText('Pilot'));
    fireEvent.click(screen.getByRole('button', { name: /agotado/i }));

    const rangeInputs = screen.getAllByRole('slider');
    fireEvent.change(rangeInputs[0], { target: { value: '100' } });
    fireEvent.change(rangeInputs[1], { target: { value: '700' } });

    fireEvent.click(screen.getByRole('button', { name: /aplicar filtros/i }));

    expect(onApply).toHaveBeenCalledWith({
      categoryId: 'cat-2',
      brand: 'Pilot',
      color: '',
      priceFrom: 100,
      priceTo: 700,
      stockStatus: 'out',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('resets local filters and delegates onReset', () => {
    const onReset = vi.fn();

    render(
      <AdvancedFilterModal
        isOpen={true}
        onClose={vi.fn()}
        filters={{
          categoryId: 'cat-1',
          brand: 'Faber',
          color: 'color-1',
          priceFrom: 250,
          priceTo: 800,
          stockStatus: 'available',
        }}
        categories={categories as never}
        brands={brands as never}
        onApply={vi.fn()}
        onReset={onReset}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /limpiar filtros/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/s\/ 0 - s\/ 5000\+/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^todos$/i })).toBeInTheDocument();
  });
});
