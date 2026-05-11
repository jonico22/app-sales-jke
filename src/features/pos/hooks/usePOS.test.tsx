import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePOS } from './usePOS';

const clearCurrentOrderMock = vi.fn();
const addItemMock = vi.fn();
const setSelectedClientMock = vi.fn();
const navigateMock = vi.fn();
const replaceStateMock = vi.fn();

vi.mock('@/store/branch.store', () => ({
  useBranchStore: vi.fn((selector: (state: { selectedBranch: unknown }) => unknown) =>
    selector({ selectedBranch: { id: 'branch1' } })
  ),
}));

vi.mock('@/store/cart.store', () => ({
  useCartStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      clearCurrentOrder: clearCurrentOrderMock,
      currentOrderCode: 'ORD-1',
      currentOrderTotal: 100,
      addItem: addItemMock,
      selectedClient: { id: 'public', name: 'Cliente' },
      setSelectedClient: setSelectedClientMock,
    })
  ),
}));

vi.mock('@/hooks/useCashShift', () => ({
  useCashShift: vi.fn(() => ({
    currentShift: { id: 'shift1' },
    isShiftOpen: true,
    isLoading: false,
    refresh: vi.fn(),
  })),
}));

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(() => ({ pathname: '/pos', state: null })),
  useNavigate: vi.fn(() => navigateMock),
}));

describe('usePOS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window.history, 'replaceState').mockImplementation(replaceStateMock);
  });

  it('adds selected products to the cart and clears transient selection', () => {
    vi.useFakeTimers();
    const product = { id: 'prod1', name: 'Camisa' } as never;
    const { result } = renderHook(() => usePOS());

    act(() => {
      result.current.handleProductSelect(product);
    });

    expect(addItemMock).toHaveBeenCalledWith(product);

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.selectedProduct).toBeNull();
    vi.useRealTimers();
  });

  it('updates client, modal and payment related state through handlers', () => {
    const { result } = renderHook(() => usePOS());

    act(() => {
      result.current.handleClientSuccess({ id: 'client1', firstName: 'Ana', lastName: 'Lopez', name: '', documentNumber: '123' } as never);
      result.current.handleCartOpen();
      result.current.handleSaleSuccess();
      result.current.handlePaymentSuccess('CARD');
      result.current.handleCloseSuccessModal();
    });

    expect(setSelectedClientMock).toHaveBeenCalledWith({ id: 'client1', name: 'Ana Lopez', documentNumber: '123' });
    expect(result.current.isCartOpen).toBe(true);
    expect(result.current.isPaymentModalOpen).toBe(false);
    expect(result.current.lastPaymentMethod).toBe('CARD');
    expect(clearCurrentOrderMock).toHaveBeenCalled();
    expect(result.current.navigate).toBe(navigateMock);
  });
});
