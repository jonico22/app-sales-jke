import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdvancedSearchPage from './AdvancedSearchPage';

const mockUseBranchStore = vi.fn();
const mockUseSocietyStore = vi.fn();
const mockUseCashShift = vi.fn();
const mockUseClients = vi.fn();
const mockUseCategories = vi.fn();
const mockUseBrands = vi.fn();
const mockUseSearchFilters = vi.fn();
const mockUseSearchCartFlow = vi.fn();
const mockUseSearchProductsInfiniteQuery = vi.fn();
const mockUseSearchFavoritesQuery = vi.fn();
const mockUseSearchMetadataQuery = vi.fn();
const mockUseBestSellersQuery = vi.fn();
const mockUseToggleFavoriteMutation = vi.fn();
const mockUseQueryClient = vi.fn();
const mockInvalidateProductRelatedCaches = vi.fn();
const mockParseBackendError = vi.fn();

vi.mock('@/store/branch.store', () => ({
  useBranchStore: () => mockUseBranchStore(),
}));

vi.mock('@/store/society.store', () => ({
  useSocietyStore: (selector: (state: { society: { mainCurrency: { symbol: string } } | null }) => unknown) =>
    selector({ society: mockUseSocietyStore() }),
}));

const mockCartStoreGetState = vi.fn();
vi.mock('@/store/cart.store', () => ({
  useCartStore: Object.assign(vi.fn(), {
    getState: () => mockCartStoreGetState(),
  }),
}));

vi.mock('@/hooks/useCashShift', () => ({
  useCashShift: () => mockUseCashShift(),
}));

vi.mock('@/hooks/useClients', () => ({
  useClients: () => mockUseClients(),
}));

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => mockUseCategories(),
}));

vi.mock('@/hooks/useBrands', () => ({
  useBrands: () => mockUseBrands(),
}));

vi.mock('./hooks/useSearchFilters', () => ({
  useSearchFilters: () => mockUseSearchFilters(),
}));

vi.mock('./hooks/useSearchCartFlow', () => ({
  useSearchCartFlow: () => mockUseSearchCartFlow(),
}));

vi.mock('./hooks/useSearchQueries', () => ({
  useSearchProductsInfiniteQuery: (args: unknown) => mockUseSearchProductsInfiniteQuery(args),
  useSearchFavoritesQuery: () => mockUseSearchFavoritesQuery(),
  useSearchMetadataQuery: () => mockUseSearchMetadataQuery(),
  useBestSellersQuery: (enabled: boolean) => mockUseBestSellersQuery(enabled),
}));

vi.mock('./hooks/useSearchMutations', () => ({
  useToggleFavoriteMutation: () => mockUseToggleFavoriteMutation(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockUseQueryClient(),
}));

vi.mock('@/features/inventory/hooks/useProductQueries', () => ({
  invalidateProductRelatedCaches: (queryClient: unknown) => mockInvalidateProductRelatedCaches(queryClient),
}));

vi.mock('@/utils/error.utils', () => ({
  parseBackendError: (error: unknown) => mockParseBackendError(error),
}));

vi.mock('./components/SearchCashBanners', () => ({
  SearchCashBanners: ({ branchName, refreshShift }: { branchName?: string; refreshShift: () => void }) => (
    <div>
      <span>{`Cash banner ${branchName ?? ''}`}</span>
      <button onClick={refreshShift}>refresh-shift</button>
    </div>
  ),
}));

vi.mock('./components/SearchClientHeader', () => ({
  SearchClientHeader: ({
    selectedClient,
    onChangeClient,
  }: {
    selectedClient: { name?: string } | null;
    onChangeClient: () => void;
  }) => (
    <div>
      <span>{selectedClient?.name ?? 'No Client'}</span>
      <button onClick={onChangeClient}>change-client</button>
    </div>
  ),
}));

vi.mock('./components/SearchHeader', () => ({
  SearchHeader: ({
    searchQuery,
    onSearchChange,
    onToggleQuickFilter,
    onColorSelect,
    onClearFilters,
    onOpenFilters,
  }: {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onToggleQuickFilter: (filter: string) => void;
    onColorSelect: (color: string) => void;
    onClearFilters: () => void;
    onOpenFilters: () => void;
  }) => (
    <div>
      <span>{`Search header ${searchQuery}`}</span>
      <button onClick={() => onSearchChange('lapiz')}>change-search</button>
      <button onClick={() => onToggleQuickFilter('favorites')}>toggle-favorites</button>
      <button onClick={() => onColorSelect('color-1')}>pick-color</button>
      <button onClick={onClearFilters}>clear-filters</button>
      <button onClick={onOpenFilters}>open-filters</button>
    </div>
  ),
}));

vi.mock('./components/FilterSidebar', () => ({
  FilterSidebar: ({ onClearFilters }: { onClearFilters: () => void }) => (
    <div>
      <span>Filter Sidebar</span>
      <button onClick={onClearFilters}>sidebar-clear</button>
    </div>
  ),
}));

vi.mock('./components/AdvancedFilterModal', () => ({
  AdvancedFilterModal: ({
    isOpen,
    onClose,
    onApply,
    onReset,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: { categoryId: string; brand: string; color: string }) => void;
    onReset: () => void;
  }) =>
    isOpen ? (
      <div>
        <span>Advanced Filter Modal</span>
        <button onClick={() => onApply({ categoryId: 'cat-1', brand: 'Nike', color: 'color-2' })}>apply-filters</button>
        <button onClick={onReset}>reset-filters</button>
        <button onClick={onClose}>close-filters</button>
      </div>
    ) : null,
}));

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ open, children }: { open: boolean; children: React.ReactNode }) => (open ? <div>{children}</div> : null),
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./components/SearchProductGrid', () => ({
  SearchProductGrid: ({
    products,
    onToggleFavorite,
  }: {
    products: Array<{ id: string; name: string }>;
    onToggleFavorite: (id: string) => void;
  }) => (
    <div>
      <span>{products.map(product => product.name).join(', ') || 'No Products'}</span>
      <button onClick={() => onToggleFavorite(products[0]?.id ?? 'fallback-id')}>toggle-favorite</button>
    </div>
  ),
}));

vi.mock('./components/SearchCartFooter', () => ({
  SearchCartFooter: ({
    totalItems,
    totalPrice,
    currencySymbol,
    onClearCart,
    onEditOrder,
    onPay,
  }: {
    totalItems: number;
    totalPrice: number;
    currencySymbol: string;
    onClearCart: () => void;
    onEditOrder: () => void;
    onPay: () => void;
  }) => (
    <div>
      <span>{`Footer ${totalItems} ${totalPrice} ${currencySymbol}`}</span>
      <button onClick={onClearCart}>clear-cart</button>
      <button onClick={onEditOrder}>edit-order</button>
      <button onClick={onPay}>pay-order</button>
    </div>
  ),
}));

vi.mock('../sales/clients/components/ClientEditModal', () => ({
  ClientEditModal: ({
    onOpenChange,
    onSuccess,
  }: {
    onOpenChange: (open: boolean) => void;
    onSuccess: (client: { id: string; name: string; documentNumber: string }) => void;
  }) => (
    <div>
      <span>Client Edit Modal</span>
      <button onClick={() => onOpenChange(false)}>close-client-modal</button>
      <button onClick={() => onSuccess({ id: 'client-9', name: 'Cliente Guardado', documentNumber: '123' })}>
        save-client
      </button>
    </div>
  ),
}));

vi.mock('../pos/components/SelectClientModal', () => ({
  SelectClientModal: ({
    onClose,
    onSelectClient,
    onNewClient,
  }: {
    onClose: () => void;
    onSelectClient: (client: { id: string; name: string; documentNumber: string }) => void;
    onNewClient: () => void;
  }) => (
    <div>
      <span>Select Client Modal</span>
      <button onClick={onClose}>close-select-client</button>
      <button onClick={() => onSelectClient({ id: 'client-4', name: 'Cliente Seleccionado', documentNumber: '456' })}>
        select-client
      </button>
      <button onClick={onNewClient}>new-client</button>
    </div>
  ),
}));

vi.mock('../pos/components/POSCartPanel', () => ({
  POSCartPanel: ({ onClose, onSaleSuccess }: { onClose: () => void; onSaleSuccess: () => void }) => (
    <div>
      <span>POS Cart Panel</span>
      <button onClick={onClose}>close-pos-cart</button>
      <button onClick={onSaleSuccess}>sale-success</button>
    </div>
  ),
}));

vi.mock('../pos/components/POSPaymentModal', () => ({
  POSPaymentModal: ({
    onClose,
    onPaymentSuccess,
  }: {
    onClose: () => void;
    onPaymentSuccess: (paymentMethod: string) => void;
  }) => (
    <div>
      <span>Payment Modal</span>
      <button onClick={onClose}>close-payment</button>
      <button onClick={() => onPaymentSuccess('cash')}>payment-success</button>
    </div>
  ),
}));

vi.mock('../pos/components/POSSuccessModal', () => ({
  POSSuccessModal: ({
    orderCode,
    total,
    onClose,
  }: {
    orderCode: string;
    total: number;
    onClose: () => void;
  }) => (
    <div>
      <span>{`Success Modal ${orderCode} ${total}`}</span>
      <button onClick={onClose}>close-success-modal</button>
    </div>
  ),
}));

vi.mock('../pos/components/POSAlertModal', () => ({
  POSAlertModal: ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div>
      <span>{message}</span>
      <button onClick={onClose}>close-alert</button>
    </div>
  ),
}));

const createSearchFiltersState = (overrides = {}) => ({
  searchQuery: '',
  setSearchQuery: vi.fn(),
  filters: { categoryId: '', brand: '', color: '' },
  quickFilter: 'all',
  setQuickFilter: vi.fn(),
  handleFilterChange: vi.fn(),
  clearFilters: vi.fn(),
  queryParams: { search: '', categoryId: '', brand: '', color: '' },
  ...overrides,
});

const createSearchCartFlowState = (overrides = {}) => ({
  selectedClient: { id: 'public', name: 'Publico general', documentNumber: '' },
  setSelectedClient: vi.fn(),
  isCartOpen: false,
  setIsCartOpen: vi.fn(),
  isPaymentModalOpen: false,
  setIsPaymentModalOpen: vi.fn(),
  isSuccessModalOpen: false,
  setIsSuccessModalOpen: vi.fn(),
  isSelectClientModalOpen: false,
  setIsSelectClientModalOpen: vi.fn(),
  isAddClientModalOpen: false,
  setIsAddClientModalOpen: vi.fn(),
  lastPaymentMethod: 'Tarjeta',
  setLastPaymentMethod: vi.fn(),
  totalItems: 3,
  totalPrice: 75,
  isCreatingOrder: false,
  orderError: null,
  resetOrderError: vi.fn(),
  handleCreateOrder: vi.fn(),
  clearCart: vi.fn(),
  clearCurrentOrder: vi.fn(),
  ...overrides,
});

const createProductQueryState = (overrides = {}) => ({
  data: {
    pages: [
      {
        data: {
          data: [{ id: 'product-1', name: 'Lapiz Azul' }],
        },
      },
    ],
  },
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: vi.fn(),
  isLoading: false,
  refetch: vi.fn(),
  ...overrides,
});

describe('AdvancedSearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseBranchStore.mockReturnValue({ selectedBranch: { id: 'branch-1', name: 'Sucursal Centro' } });
    mockUseSocietyStore.mockReturnValue({ mainCurrency: { symbol: 'S/' } });
    mockUseCashShift.mockReturnValue({
      currentShift: { id: 'shift-1' },
      isShiftOpen: true,
      isLoading: false,
      refresh: vi.fn(),
    });
    mockUseClients.mockReturnValue({ data: [], isLoading: false });
    mockUseCategories.mockReturnValue({ data: [{ id: 'cat-1', name: 'Utiles' }] });
    mockUseBrands.mockReturnValue({ data: [{ id: 'brand-1', name: 'Nike' }] });
    mockUseSearchFilters.mockReturnValue(createSearchFiltersState());
    mockUseSearchCartFlow.mockReturnValue(createSearchCartFlowState());
    mockUseSearchProductsInfiniteQuery.mockReturnValue(createProductQueryState());
    mockUseSearchFavoritesQuery.mockReturnValue({ data: { data: [] }, isLoading: false, refetch: vi.fn() });
    mockUseSearchMetadataQuery.mockReturnValue({ data: { colors: [{ id: 'color-1', color: 'Rojo' }] } });
    mockUseBestSellersQuery.mockReturnValue({ data: { data: [] }, isLoading: false });
    mockUseToggleFavoriteMutation.mockReturnValue({ mutate: vi.fn() });
    mockUseQueryClient.mockReturnValue({ queryKey: 'client' });
    mockParseBackendError.mockReturnValue('Backend Error');
    mockCartStoreGetState.mockReturnValue({ currentOrderCode: 'PED-001', currentOrderTotal: 99 });
  });

  it('auto-selects the real public client when clients are loaded', () => {
    const cartFlowState = createSearchCartFlowState({
      selectedClient: { id: 'public', name: 'Publico general', documentNumber: '' },
    });
    mockUseSearchCartFlow.mockReturnValue(cartFlowState);
    mockUseClients.mockReturnValue({
      data: [
        { id: 'client-10', name: 'Público General', documentNumber: '000' },
        { id: 'client-11', name: 'Cliente Alterno', documentNumber: '111' },
      ],
      isLoading: false,
    });

    render(<AdvancedSearchPage />);

    expect(cartFlowState.setSelectedClient).toHaveBeenCalledWith({
      id: 'client-10',
      name: 'Público General',
      documentNumber: '000',
    });
  });

  it('uses favorites data when the active quick filter is favorites', () => {
    mockUseSearchFilters.mockReturnValue(
      createSearchFiltersState({
        quickFilter: 'favorites',
        filters: { categoryId: 'cat-1', brand: 'Nike', color: '' },
        queryParams: { search: 'lapiz', categoryId: 'cat-1', brand: 'Nike', color: '' },
      }),
    );
    mockUseSearchFavoritesQuery.mockReturnValue({
      data: {
        data: [
          { id: 'fav-1', name: 'Lapiz Rojo', categoryId: 'cat-1', brand: 'Nike' },
          { id: 'fav-2', name: 'Borrador', categoryId: 'cat-1', brand: 'Nike' },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<AdvancedSearchPage />);

    expect(screen.getByText('Lapiz Rojo')).toBeInTheDocument();
    expect(screen.queryByText('Borrador')).not.toBeInTheDocument();
  });

  it('wires header and footer actions to the search state handlers', () => {
    const filtersState = createSearchFiltersState();
    const cartFlowState = createSearchCartFlowState();
    mockUseSearchFilters.mockReturnValue(filtersState);
    mockUseSearchCartFlow.mockReturnValue(cartFlowState);

    render(<AdvancedSearchPage />);

    fireEvent.click(screen.getByText('change-search'));
    fireEvent.click(screen.getByText('toggle-favorites'));
    fireEvent.click(screen.getByText('pick-color'));
    fireEvent.click(screen.getByText('clear-filters'));
    fireEvent.click(screen.getByText('sidebar-clear'));
    fireEvent.click(screen.getByText('change-client'));
    fireEvent.click(screen.getByText('clear-cart'));
    fireEvent.click(screen.getByText('edit-order'));
    fireEvent.click(screen.getByText('pay-order'));

    expect(filtersState.setSearchQuery).toHaveBeenCalledWith('lapiz');
    expect(filtersState.setQuickFilter).toHaveBeenCalledWith('favorites');
    expect(filtersState.handleFilterChange).toHaveBeenCalledWith('color', 'color-1');
    expect(filtersState.clearFilters).toHaveBeenCalledTimes(2);
    expect(cartFlowState.setIsSelectClientModalOpen).toHaveBeenCalledWith(true);
    expect(cartFlowState.clearCart).toHaveBeenCalledTimes(1);
    expect(cartFlowState.setIsCartOpen).toHaveBeenCalledWith(true);
    expect(cartFlowState.handleCreateOrder).toHaveBeenCalledTimes(1);
  });

  it('applies filters from the advanced filter modal', () => {
    const filtersState = createSearchFiltersState();
    mockUseSearchFilters.mockReturnValue(filtersState);

    render(<AdvancedSearchPage />);

    fireEvent.click(screen.getByText('open-filters'));
    fireEvent.click(screen.getByText('apply-filters'));

    expect(filtersState.handleFilterChange).toHaveBeenCalledWith('categoryId', 'cat-1');
    expect(filtersState.handleFilterChange).toHaveBeenCalledWith('brand', 'Nike');
    expect(filtersState.handleFilterChange).toHaveBeenCalledWith('color', 'color-2');
  });

  it('delegates client, cart, payment, success and error modal actions', () => {
    const productQuery = createProductQueryState();
    const favoritesQuery = { data: { data: [] }, isLoading: false, refetch: vi.fn() };
    const cartFlowState = createSearchCartFlowState({
      isCartOpen: true,
      isPaymentModalOpen: true,
      isSuccessModalOpen: true,
      isSelectClientModalOpen: true,
      isAddClientModalOpen: true,
      orderError: new Error('failure'),
    });
    mockUseSearchCartFlow.mockReturnValue(cartFlowState);
    mockUseSearchProductsInfiniteQuery.mockReturnValue(productQuery);
    mockUseSearchFavoritesQuery.mockReturnValue(favoritesQuery);
    mockUseToggleFavoriteMutation.mockReturnValue({ mutate: vi.fn() });

    render(<AdvancedSearchPage />);

    fireEvent.click(screen.getByText('select-client'));
    fireEvent.click(screen.getByText('new-client'));
    fireEvent.click(screen.getByText('close-select-client'));
    fireEvent.click(screen.getByText('close-client-modal'));
    fireEvent.click(screen.getByText('save-client'));
    fireEvent.click(screen.getByText('close-pos-cart'));
    fireEvent.click(screen.getByText('sale-success'));
    fireEvent.click(screen.getByText('close-payment'));
    fireEvent.click(screen.getByText('payment-success'));
    fireEvent.click(screen.getByText('close-success-modal'));
    fireEvent.click(screen.getByText('close-alert'));

    expect(cartFlowState.setSelectedClient).toHaveBeenCalledWith({
      id: 'client-4',
      name: 'Cliente Seleccionado',
      documentNumber: '456',
    });
    expect(cartFlowState.setIsAddClientModalOpen).toHaveBeenCalledWith(true);
    expect(cartFlowState.setIsSelectClientModalOpen).toHaveBeenCalledWith(false);
    expect(cartFlowState.setIsAddClientModalOpen).toHaveBeenCalledWith(false);
    expect(cartFlowState.setSelectedClient).toHaveBeenCalledWith({
      id: 'client-9',
      name: 'Cliente Guardado',
      documentNumber: '123',
    });
    expect(cartFlowState.setIsCartOpen).toHaveBeenCalledWith(false);
    expect(cartFlowState.setIsPaymentModalOpen).toHaveBeenCalledWith(true);
    expect(productQuery.refetch).toHaveBeenCalledTimes(2);
    expect(favoritesQuery.refetch).toHaveBeenCalledTimes(2);
    expect(mockInvalidateProductRelatedCaches).toHaveBeenCalledTimes(2);
    expect(cartFlowState.setIsPaymentModalOpen).toHaveBeenCalledWith(false);
    expect(cartFlowState.setLastPaymentMethod).toHaveBeenCalledWith('cash');
    expect(cartFlowState.setIsSuccessModalOpen).toHaveBeenCalledWith(true);
    expect(cartFlowState.clearCurrentOrder).toHaveBeenCalledTimes(1);
    expect(cartFlowState.resetOrderError).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Backend Error')).toBeInTheDocument();
  });
});
