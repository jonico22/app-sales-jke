import { fireEvent, render, screen, waitFor } from '@/tests/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateOutgoingAgreementForm } from './CreateOutgoingAgreementForm';
import { useSocietyStore } from '@/store/society.store';
import { useBranchStore } from '@/store/branch.store';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { OutgoingConsignmentAgreementStatus } from '@/services/outgoing-consignment-agreement.service';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/client.service', () => ({
  clientService: {
    getForSelect: vi.fn(),
  },
}));

vi.mock('@/services/branch-office.service', () => ({
  branchOfficeService: {
    getForSelect: vi.fn(),
  },
}));

vi.mock('@/services/currency.service', () => ({
  currencyService: {
    getForSelect: vi.fn(),
  },
}));

vi.mock('@/services/outgoing-consignment-agreement.service', () => ({
  OutgoingConsignmentAgreementStatus: {
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    TERMINATED: 'TERMINATED',
    PENDING: 'PENDING',
  },
  outgoingConsignmentAgreementService: {
    create: vi.fn(),
  },
}));

import { clientService } from '@/services/client.service';
import { branchOfficeService } from '@/services/branch-office.service';
import { currencyService } from '@/services/currency.service';
import { outgoingConsignmentAgreementService } from '@/services/outgoing-consignment-agreement.service';

describe('CreateOutgoingAgreementForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

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

    useBranchStore.setState({
      branches: [],
      selectedBranch: null,
    });

    useCartStore.setState({
      branchId: '1',
      currencyId: '1',
      selectedClient: {
        id: 'public',
        name: 'Público General',
        documentNumber: '00000000',
      },
    });

    useAuthStore.setState({
      user: {
        email: 'admin@jke.local',
      } as never,
    });

    vi.mocked(branchOfficeService.getForSelect).mockResolvedValue({
      success: true,
      data: [
        { id: 'branch-1', name: 'Sucursal Principal', code: 'MAIN', isActive: true },
      ],
    } as never);

    vi.mocked(clientService.getForSelect).mockResolvedValue({
      success: true,
      data: [
        { id: 'client-1', name: 'Cliente Uno', documentNumber: '12345678' },
      ],
    } as never);

    vi.mocked(currencyService.getForSelect).mockResolvedValue({
      success: true,
      data: [
        { id: 'currency-pen', code: 'PEN', name: 'Sol', symbol: 'S/', exchangeRate: 1 },
        { id: 'currency-usd', code: 'USD', name: 'Dollar', symbol: '$', exchangeRate: 3.8 },
      ],
    } as never);

    vi.mocked(outgoingConsignmentAgreementService.create).mockResolvedValue({
      success: true,
      message: 'ok',
      data: {} as never,
    });
  });

  it('sends status, agreementCode and a valid currency id when creating an agreement', async () => {
    render(<CreateOutgoingAgreementForm onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Sucursal Principal' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Consignatario'), { target: { value: 'client-1' } });
    fireEvent.click(screen.getByRole('button', { name: /crear acuerdo/i }));

    await waitFor(() => {
      expect(outgoingConsignmentAgreementService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          societyId: 'SOC-001',
          branchId: 'branch-1',
          partnerId: 'client-1',
          currencyId: 'currency-pen',
          status: OutgoingConsignmentAgreementStatus.ACTIVE,
          agreementCode: expect.stringMatching(/^CONS-/),
          createdBy: 'admin@jke.local',
        })
      );
    });
  });
});
