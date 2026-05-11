import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import POSPage from './POSPage';
import { usePOS } from './hooks/usePOS';

const { toastErrorMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
}));

vi.mock('./hooks/usePOS', () => ({
  usePOS: vi.fn(),
}));

const mockUseVoiceSearch = vi.fn();
vi.mock('../search/hooks/useVoiceSearch', () => ({
  useVoiceSearch: () => mockUseVoiceSearch(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: toastErrorMock,
  },
}));

vi.mock('./components/POSWelcomeHeader', () => ({
  POSWelcomeHeader: () => <div>POS Welcome Header</div>,
}));

vi.mock('./components/CashOpeningBanner', () => ({
  CashOpeningBanner: ({ isLoading, refreshShift }: { isLoading?: boolean; refreshShift?: () => void }) => (
    <div>
      <span>{isLoading ? 'Cash Opening Loading' : 'Cash Opening Banner'}</span>
      {refreshShift ? <button onClick={refreshShift}>refresh-shift</button> : null}
    </div>
  ),
}));

vi.mock('./components/CashClosingBanner', () => ({
  CashClosingBanner: ({ branchName, onCloseCash }: { branchName?: string; onCloseCash: () => void }) => (
    <div>
      <span>{`Cash Closing Banner ${branchName ?? ''}`}</span>
      <button onClick={onCloseCash}>close-cash</button>
    </div>
  ),
}));

vi.mock('./components/POSClientSelector', () => ({
  POSClientSelector: ({
    selectedClient,
    onSelectClient,
    onNewClient,
  }: {
    selectedClient: { name?: string } | null;
    onSelectClient: (client: { id: string; name: string }) => void;
    onNewClient: () => void;
  }) => (
    <div>
      <span>{selectedClient?.name ?? 'No Client'}</span>
      <button onClick={() => onSelectClient({ id: 'client-2', name: 'Cliente Nuevo' })}>select-client</button>
      <button onClick={onNewClient}>new-client</button>
    </div>
  ),
}));

vi.mock('./components/POSProductSearch', () => ({
  POSProductSearch: ({
    searchQuery,
    setSearchQuery,
    onSelectProduct,
    voiceSearch,
  }: {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    onSelectProduct: (product: { id: string; name: string }) => void;
    voiceSearch?: {
      startListening: () => void;
      stopListening: () => void;
    };
  }) => (
    <div>
      <span>{`Search: ${searchQuery}`}</span>
      <button onClick={() => setSearchQuery('teclado')}>change-search</button>
      <button onClick={() => onSelectProduct({ id: 'product-1', name: 'Producto POS' })}>select-product</button>
      <button onClick={() => voiceSearch?.startListening()}>voice-start</button>
      <button onClick={() => voiceSearch?.stopListening()}>voice-stop</button>
    </div>
  ),
}));

vi.mock('./components/POSCatalogButton', () => ({
  POSCatalogButton: ({ onClick }: { onClick: () => void }) => <button onClick={onClick}>open-catalog</button>,
}));

vi.mock('./components/POSQuickActions', () => ({
  POSQuickActions: () => <div>POS Quick Actions</div>,
}));

vi.mock('./components/POSFloatingCart', () => ({
  POSFloatingCart: ({ onClick }: { onClick: () => void }) => <button onClick={onClick}>open-cart</button>,
}));

vi.mock('./components/POSCartPanel', () => ({
  POSCartPanel: ({ onClose, onSaleSuccess }: { onClose: () => void; onSaleSuccess: () => void }) => (
    <div>
      <span>Cart Panel</span>
      <button onClick={onClose}>close-cart</button>
      <button onClick={onSaleSuccess}>sale-success</button>
    </div>
  ),
}));

vi.mock('./components/POSMobileFooter', () => ({
  POSMobileFooter: () => <div>POS Mobile Footer</div>,
}));

vi.mock('./components/POSPaymentModal', () => ({
  POSPaymentModal: ({
    onClose,
    onPaymentSuccess,
  }: {
    onClose: () => void;
    onPaymentSuccess: (method: string) => void;
  }) => (
    <div>
      <span>Payment Modal</span>
      <button onClick={onClose}>close-payment</button>
      <button onClick={() => onPaymentSuccess('cash')}>payment-success</button>
    </div>
  ),
}));

vi.mock('./components/POSSuccessModal', () => ({
  POSSuccessModal: ({
    orderCode,
    clientName,
    total,
    onClose,
  }: {
    orderCode: string;
    clientName: string;
    total: number;
    onClose: () => void;
  }) => (
    <div>
      <span>{`Success ${orderCode} ${clientName} ${total}`}</span>
      <button onClick={onClose}>close-success</button>
    </div>
  ),
}));

vi.mock('../sales/clients/components/ClientEditModal', () => ({
  ClientEditModal: ({
    onOpenChange,
    onSuccess,
  }: {
    onOpenChange: (open: boolean) => void;
    onSuccess: (client: { id: string; name: string }) => void;
  }) => (
    <div>
      <span>Client Edit Modal</span>
      <button onClick={() => onOpenChange(false)}>toggle-client-modal</button>
      <button onClick={() => onSuccess({ id: 'client-3', name: 'Cliente Guardado' })}>client-success</button>
    </div>
  ),
}));

const createUsePOSState = (overrides = {}) => ({
  selectedBranch: { id: 'branch-1', name: 'Sucursal Centro' },
  selectedClient: { id: 'client-1', name: 'Publico General' },
  setSelectedClient: vi.fn(),
  searchQuery: '',
  setSearchQuery: vi.fn(),
  selectedProduct: null,
  isAddClientModalOpen: false,
  setIsAddClientModalOpen: vi.fn(),
  isCartOpen: false,
  currentOrderCode: 'PED-001',
  currentOrderTotal: 150,
  lastPaymentMethod: 'Yape',
  currentShift: { id: 'shift-1' },
  isShiftOpen: false,
  isShiftLoading: false,
  isPaymentModalOpen: false,
  isSuccessModalOpen: false,
  refreshShift: vi.fn(),
  handleClientSuccess: vi.fn(),
  handleProductSelect: vi.fn(),
  handleCartOpen: vi.fn(),
  handleSaleSuccess: vi.fn(),
  handlePaymentSuccess: vi.fn(),
  handleCloseSuccessModal: vi.fn(),
  openAddClientModal: vi.fn(),
  closeCart: vi.fn(),
  closePaymentModal: vi.fn(),
  navigate: vi.fn(),
  ...overrides,
});

const createVoiceSearchState = (overrides = {}) => ({
  isSupported: true,
  isListening: false,
  transcript: '',
  error: null,
  status: 'idle',
  startListening: vi.fn(),
  stopListening: vi.fn(),
  ...overrides,
});

describe('POSPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseVoiceSearch.mockReturnValue(createVoiceSearchState());
  });

  it('shows the loading banner while the cash shift is loading', () => {
    (usePOS as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      createUsePOSState({ isShiftLoading: true }),
    );

    render(<POSPage />);

    expect(screen.getByText('Cash Opening Loading')).toBeInTheDocument();
  });

  it('navigates to cash closing when the shift is open', () => {
    const state = createUsePOSState({ isShiftOpen: true });
    (usePOS as unknown as ReturnType<typeof vi.fn>).mockReturnValue(state);

    render(<POSPage />);

    fireEvent.click(screen.getByText('close-cash'));

    expect(state.navigate).toHaveBeenCalledWith('/pos/cash-closing/shift-1');
  });

  it('wires main user actions through the hook handlers', () => {
    const state = createUsePOSState();
    const voiceSearchState = createVoiceSearchState();
    (usePOS as unknown as ReturnType<typeof vi.fn>).mockReturnValue(state);
    mockUseVoiceSearch.mockReturnValue(voiceSearchState);

    render(<POSPage />);

    fireEvent.click(screen.getByText('select-client'));
    fireEvent.click(screen.getByText('new-client'));
    fireEvent.click(screen.getByText('change-search'));
    fireEvent.click(screen.getByText('select-product'));
    fireEvent.click(screen.getByText('voice-start'));
    fireEvent.click(screen.getByText('voice-stop'));
    fireEvent.click(screen.getByText('open-catalog'));
    fireEvent.click(screen.getByText('open-cart'));

    expect(state.setSelectedClient).toHaveBeenCalledWith({ id: 'client-2', name: 'Cliente Nuevo' });
    expect(state.openAddClientModal).toHaveBeenCalledTimes(1);
    expect(state.setSearchQuery).toHaveBeenCalledWith('teclado');
    expect(state.handleProductSelect).toHaveBeenCalledWith({ id: 'product-1', name: 'Producto POS' });
    expect(voiceSearchState.startListening).toHaveBeenCalledTimes(1);
    expect(voiceSearchState.stopListening).toHaveBeenCalledTimes(1);
    expect(state.navigate).toHaveBeenCalledWith('/pos/search');
    expect(state.handleCartOpen).toHaveBeenCalledTimes(1);
  });

  it('renders the modal flow and delegates each callback correctly', () => {
    const state = createUsePOSState({
      isCartOpen: true,
      isPaymentModalOpen: true,
      isSuccessModalOpen: true,
      isAddClientModalOpen: true,
    });
    (usePOS as unknown as ReturnType<typeof vi.fn>).mockReturnValue(state);

    render(<POSPage />);

    fireEvent.click(screen.getByText('sale-success'));
    fireEvent.click(screen.getByText('close-cart'));
    fireEvent.click(screen.getByText('payment-success'));
    fireEvent.click(screen.getByText('close-payment'));
    fireEvent.click(screen.getByText('close-success'));
    fireEvent.click(screen.getByText('toggle-client-modal'));
    fireEvent.click(screen.getByText('client-success'));

    expect(state.handleSaleSuccess).toHaveBeenCalledTimes(1);
    expect(state.closeCart).toHaveBeenCalledTimes(1);
    expect(state.handlePaymentSuccess).toHaveBeenCalledWith('cash');
    expect(state.closePaymentModal).toHaveBeenCalledTimes(1);
    expect(state.handleCloseSuccessModal).toHaveBeenCalledTimes(1);
    expect(state.setIsAddClientModalOpen).toHaveBeenCalledWith(false);
    expect(state.handleClientSuccess).toHaveBeenCalledWith({ id: 'client-3', name: 'Cliente Guardado' });
  });

  it('shows a toast when voice search reports an error', () => {
    (usePOS as unknown as ReturnType<typeof vi.fn>).mockReturnValue(createUsePOSState());
    mockUseVoiceSearch.mockReturnValue(
      createVoiceSearchState({
        error: 'No detectamos voz. Intenta nuevamente.',
        status: 'error',
      }),
    );

    render(<POSPage />);

    expect(toastErrorMock).toHaveBeenCalledWith('No detectamos voz. Intenta nuevamente.');
  });
});
