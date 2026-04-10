import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchHeader } from './SearchHeader';

const mockUseMediaQuery = vi.fn();

vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) => mockUseMediaQuery(query),
}));

vi.mock('@/components/shared/Portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const colors = [
  { id: 'color-1', color: 'Azul', colorCode: '#1d4ed8' },
  { id: 'color-2', color: 'Rojo', colorCode: '#dc2626' },
];

describe('SearchHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('wires clear search and quick filter actions on desktop', () => {
    mockUseMediaQuery.mockReturnValue(false);

    const onSearchChange = vi.fn();
    const onToggleQuickFilter = vi.fn();
    const onClearFilters = vi.fn();

    render(
      <SearchHeader
        searchQuery="lapiz"
        onSearchChange={onSearchChange}
        activeQuickFilters={['all']}
        onToggleQuickFilter={onToggleQuickFilter}
        colors={colors}
        selectedColor=""
        onColorSelect={vi.fn()}
        onClearFilters={onClearFilters}
        onOpenFilters={vi.fn()}
      />,
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(screen.getByRole('button', { name: /favoritos/i }));
    fireEvent.click(screen.getByRole('button', { name: /más vendidos/i }));
    fireEvent.click(screen.getByRole('button', { name: /^limpiar$/i }));

    expect(onSearchChange).toHaveBeenCalledWith('');
    expect(onToggleQuickFilter).toHaveBeenCalledWith('favorites');
    expect(onToggleQuickFilter).toHaveBeenCalledWith('bestSellers');
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it('opens and closes the desktop color dropdown and selects a color', () => {
    mockUseMediaQuery.mockReturnValue(false);

    const onColorSelect = vi.fn();

    render(
      <SearchHeader
        searchQuery=""
        onSearchChange={vi.fn()}
        activeQuickFilters={['all']}
        onToggleQuickFilter={vi.fn()}
        colors={colors}
        selectedColor=""
        onColorSelect={onColorSelect}
        onClearFilters={vi.fn()}
        onOpenFilters={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^color$/i }));
    expect(screen.getByText(/todos los colores/i)).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText(/todos los colores/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^color$/i }));
    fireEvent.click(screen.getByRole('button', { name: /azul/i }));

    expect(onColorSelect).toHaveBeenCalledWith('color-1');
    expect(screen.queryByText(/todos los colores/i)).not.toBeInTheDocument();
  });

  it('uses the mobile portal flow for filters and color selection', () => {
    mockUseMediaQuery.mockReturnValue(true);

    const onOpenFilters = vi.fn();
    const onColorSelect = vi.fn();

    const { container } = render(
      <SearchHeader
        searchQuery=""
        onSearchChange={vi.fn()}
        activeQuickFilters={['favorites']}
        onToggleQuickFilter={vi.fn()}
        colors={colors}
        selectedColor=""
        onColorSelect={onColorSelect}
        onClearFilters={vi.fn()}
        onOpenFilters={onOpenFilters}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /filtros/i }));
    expect(onOpenFilters).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /^color$/i }));
    expect(screen.getByText(/seleccionar color/i)).toBeInTheDocument();

    const overlay = container.querySelector('.fixed.inset-0');
    expect(overlay).toBeTruthy();
    fireEvent.click(overlay!);
    expect(screen.queryByText(/seleccionar color/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^color$/i }));
    const modal = screen.getByText(/seleccionar color/i).closest('div');
    expect(modal).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /rojo/i }));

    expect(onColorSelect).toHaveBeenCalledWith('color-2');
  });
});
