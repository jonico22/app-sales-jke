import { fireEvent, render, screen, waitFor } from '@/tests/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateReceivedConsignmentSettlementForm } from './CreateReceivedConsignmentSettlementForm';
import { useSocietyStore } from '@/store/society.store';
import { useCartStore } from '@/store/cart.store';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/outgoing-consignment-agreement.service', () => ({
  outgoingConsignmentAgreementService: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/services/currency.service', () => ({
  currencyService: {
    getForSelect: vi.fn(),
  },
}));

vi.mock('@/services/received-consignment-settlement.service', () => ({
  ReceivedConsignmentSettlementStatus: {
    PENDING: 'PENDING',
    PAID: 'PAID',
  },
  receivedConsignmentSettlementService: {
    create: vi.fn(),
  },
}));

import { outgoingConsignmentAgreementService } from '@/services/outgoing-consignment-agreement.service';
import { currencyService } from '@/services/currency.service';

describe('CreateReceivedConsignmentSettlementForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useSocietyStore.setState({
      society: {
        id: 'soc-1',
        code: 'SOC-001',
        name: 'JKE',
        mainCurrency: {
          id: 'currency-pen',
          code: 'PEN',
          symbol: 'S/',
          name: 'Sol',
        },
      } as never,
    });

    useCartStore.setState({
      currencyId: 'currency-usd',
    });

    vi.mocked(outgoingConsignmentAgreementService.getAll).mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        data: [
          {
            id: 'agreement-1',
            agreementCode: 'CONS-001',
            currencyId: 'currency-pen',
            commissionRate: 0.15,
            status: 'ACTIVE',
          },
        ],
        pagination: {
          page: 1,
          limit: 100,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    } as never);

    vi.mocked(currencyService.getForSelect).mockResolvedValue({
      success: true,
      message: 'ok',
      data: [
        { id: 'currency-pen', code: 'PEN', name: 'Sol', symbol: 'S/', exchangeRate: 1 },
        { id: 'currency-usd', code: 'USD', name: 'Dollar', symbol: '$', exchangeRate: 3.8 },
      ],
    } as never);
  });

  it('hydrates settlement details after selecting an agreement', async () => {
    render(<CreateReceivedConsignmentSettlementForm onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'CONS-001' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Acuerdo'), { target: { value: 'agreement-1' } });
    fireEvent.change(screen.getByLabelText('Ventas Reportadas'), { target: { value: '200' } });

    await waitFor(() => {
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('15.00%')).toBeInTheDocument();
      expect(screen.getByLabelText('Moneda')).toHaveValue('currency-pen');
      expect(screen.getByLabelText('Comisión Consignatario')).toHaveValue(30);
      expect(screen.getByLabelText('Total Recibido')).toHaveValue(170);
    });
  });
});
