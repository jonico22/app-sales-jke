import { render, screen, fireEvent, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductCard } from './ProductCard';

const mockCartState = {
  items: [] as Array<{ product: { id: string }; quantity: number }>,
  addItem: vi.fn(),
  updateQuantity: vi.fn(),
  removeItem: vi.fn(),
};

vi.mock('@/store/society.store', () => ({
  useSocietyStore: (selector: (state: { society: { mainCurrency: { symbol: string } } }) => unknown) =>
    selector({ society: { mainCurrency: { symbol: 'S/' } } }),
}));

vi.mock('@/store/cart.store', () => ({
  useCartStore: (selector: (state: typeof mockCartState) => unknown) => selector(mockCartState),
}));

const product = {
  id: 'product-1',
  name: 'Lapiz Azul',
  code: 'LAP-001',
  price: '5.00',
  stock: 5,
  minStock: 2,
  color: 'Azul',
  category: { id: 'cat-1', name: 'Utiles' },
};

function getDesktopCard(container: HTMLElement) {
  return container.querySelector('.hidden.lg\\:flex') as HTMLElement;
}

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCartState.items = [];
  });

  it('adds a product and toggles favorite from the desktop card', () => {
    const onToggleFavorite = vi.fn();
    const { container } = render(
      <ProductCard product={product as never} isFavorite={false} onToggleFavorite={onToggleFavorite} />,
    );

    const desktopCard = getDesktopCard(container);
    const buttons = within(desktopCard).getAllByRole('button');

    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(onToggleFavorite).toHaveBeenCalledWith('product-1');
    expect(mockCartState.addItem).toHaveBeenCalledWith(product, 1);
  });

  it('updates and removes quantity when the product is already in the cart', () => {
    mockCartState.items = [{ product: { id: 'product-1' }, quantity: 2 }];
    const { container, rerender } = render(
      <ProductCard product={product as never} isFavorite={true} onToggleFavorite={vi.fn()} />,
    );

    let desktopCard = getDesktopCard(container);
    let buttons = within(desktopCard).getAllByRole('button');

    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);

    expect(mockCartState.updateQuantity).toHaveBeenCalledWith('product-1', 1);
    expect(mockCartState.updateQuantity).toHaveBeenCalledWith('product-1', 3);

    mockCartState.items = [{ product: { id: 'product-1' }, quantity: 1 }];
    rerender(<ProductCard product={product as never} isFavorite={true} onToggleFavorite={vi.fn()} />);

    desktopCard = getDesktopCard(container);
    buttons = within(desktopCard).getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(mockCartState.removeItem).toHaveBeenCalledWith('product-1');
  });

  it('blocks increment when stock is exhausted and shows stock states', () => {
    mockCartState.items = [{ product: { id: 'product-1' }, quantity: 5 }];
    const { container, rerender } = render(
      <ProductCard product={product as never} isFavorite={false} onToggleFavorite={vi.fn()} />,
    );

    let desktopCard = getDesktopCard(container);
    let buttons = within(desktopCard).getAllByRole('button');
    const plusAtLimit = buttons[2];

    expect(plusAtLimit).toBeDisabled();
    fireEvent.click(plusAtLimit);
    expect(mockCartState.updateQuantity).not.toHaveBeenCalled();

    expect(screen.getAllByText(/stock: 5/i).length).toBeGreaterThan(0);

    rerender(
      <ProductCard
        product={{ ...product, stock: 1, minStock: 2 } as never}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );
    expect(screen.getAllByText(/stock bajo: 1/i).length).toBeGreaterThan(0);

    mockCartState.items = [];
    rerender(
      <ProductCard
        product={{ ...product, stock: 0, minStock: 2 } as never}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />,
    );

    desktopCard = getDesktopCard(container);
    buttons = within(desktopCard).getAllByRole('button');
    const addDisabled = buttons[1];

    expect(screen.getAllByText(/agotado/i).length).toBeGreaterThan(0);
    expect(addDisabled).toBeDisabled();
  });
});
