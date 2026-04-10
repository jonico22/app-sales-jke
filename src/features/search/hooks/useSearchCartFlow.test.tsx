import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSearchCartFlow } from './useSearchCartFlow';

const mutateMock = vi.fn();
const resetMock = vi.fn();
const setCurrentOrderMock = vi.fn();
const clearCurrentOrderMock = vi.fn();
const clearCartMock = vi.fn();
const setSelectedClientMock = vi.fn();

vi.mock('@/store/society.store', () => ({
  useSocietyStore: vi.fn((selector: (state: { society: unknown }) => unknown) =>
    selector({ society: { id: 'soc1', mainCurrency: { id: 'pen' } } })
  ),
}));

vi.mock('@/store/branch.store', () => ({
  useBranchStore: vi.fn((selector: (state: { selectedBranch: unknown }) => unknown) =>
    selector({ selectedBranch: { id: 'branch1' } })
  ),
}));

vi.mock('@/store/cart.store', async () => {
  const actual = await vi.importActual<typeof import('@/store/cart.store')>('@/store/cart.store');
  return {
    ...actual,
    useCartStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) =>
      selector({
        items: [{ quantity: 2, originalPrice: 20, product: { id: 'prod1', price: '18' } }],
        discount: 5,
        orderNotes: 'note',
        currencyId: 'usd',
        selectedClient: { id: 'client1' },
        setCurrentOrder: setCurrentOrderMock,
        clearCurrentOrder: clearCurrentOrderMock,
        clearCart: clearCartMock,
        setSelectedClient: setSelectedClientMock,
      })
    ),
    selectTotalItems: vi.fn(() => 2),
    selectTotalPrice: vi.fn(() => 36),
  };
});

vi.mock('./useSearchMutations', () => ({
  useCreateSearchOrderMutation: vi.fn(() => ({
    mutate: mutateMock,
    isPending: false,
    error: null,
    reset: resetMock,
  })),
}));

describe('useSearchCartFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens payment modal and stores current order on successful order creation', async () => {
    mutateMock.mockImplementation((_payload, options) => {
      options.onSuccess({
        success: true,
        data: { id: 'order1', orderCode: 'ORD-1' },
      });
    });

    const { result } = renderHook(() => useSearchCartFlow());

    await act(async () => {
      await result.current.handleCreateOrder();
    });

    expect(mutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        societyId: 'soc1',
        branchId: 'branch1',
        partnerId: 'client1',
        total: 31,
      }),
      expect.any(Object)
    );
    expect(setCurrentOrderMock).toHaveBeenCalledWith('order1', 'ORD-1', 31);
    expect(clearCartMock).toHaveBeenCalled();
    expect(result.current.isPaymentModalOpen).toBe(true);
  });
});
