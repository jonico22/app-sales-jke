import { fireEvent, render, screen, waitFor } from '@/tests/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateDeliveredConsignmentForm } from './CreateDeliveredConsignmentForm';
import { useSocietyStore } from '@/store/society.store';
import { useBranchStore } from '@/store/branch.store';
import { useCartStore } from '@/store/cart.store';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/branch-office.service', () => ({
  branchOfficeService: {
    getForSelect: vi.fn(),
  },
}));

vi.mock('@/services/product.service', () => ({
  productService: {
    getForSelect: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock('@/services/outgoing-consignment-agreement.service', () => ({
  outgoingConsignmentAgreementService: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/services/delivered-consignment-agreement.service', () => ({
  deliveredConsignmentAgreementService: {
    create: vi.fn(),
  },
}));

import { branchOfficeService } from '@/services/branch-office.service';
import { deliveredConsignmentAgreementService } from '@/services/delivered-consignment-agreement.service';
import { productService } from '@/services/product.service';
import { outgoingConsignmentAgreementService } from '@/services/outgoing-consignment-agreement.service';

describe('CreateDeliveredConsignmentForm', () => {
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
      branchId: 'branch-1',
      currencyId: 'currency-pen',
    });

    vi.mocked(branchOfficeService.getForSelect).mockResolvedValue({
      success: true,
      data: [
        { id: 'branch-1', name: 'Sucursal Principal', code: 'MAIN', isActive: true },
      ],
    } as never);

    vi.mocked(outgoingConsignmentAgreementService.getAll).mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        data: [
          {
            id: 'agreement-1',
            agreementCode: 'CONS-001',
            partnerId: 'client-1',
            currencyId: 'currency-pen',
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
  });

  it('renders product options when products/select returns a plain array', async () => {
    vi.mocked(productService.getForSelect).mockResolvedValue({
      success: true,
      data: [
        { id: 'product-1', name: 'Zapato Derby' },
      ],
    } as never);

    render(<CreateDeliveredConsignmentForm onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Zapato Derby' })).toBeInTheDocument();
    });
  });

  it('fills cost and suggested price inputs after selecting a product', async () => {
    vi.mocked(productService.getForSelect).mockResolvedValue({
      success: true,
      data: [
        { id: 'product-1', name: 'Zapato Derby' },
      ],
    } as never);
    vi.mocked(productService.getById).mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        id: 'product-1',
        name: 'Zapato Derby',
        priceCost: '80',
        price: '120',
      },
    } as never);

    render(<CreateDeliveredConsignmentForm onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Zapato Derby' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Producto'), { target: { value: 'product-1' } });

    await waitFor(() => {
      expect(screen.getByLabelText('Costo Unitario')).toHaveValue(80);
      expect(screen.getByLabelText('Precio Sugerido')).toHaveValue(120);
    });
  });

  it('sends active status when saving a delivery', async () => {
    vi.mocked(productService.getForSelect).mockResolvedValue({
      success: true,
      data: [
        { id: 'product-1', name: 'Zapato Derby', priceCost: '80', price: '120' },
      ],
    } as never);
    vi.mocked(deliveredConsignmentAgreementService.create).mockResolvedValue({
      success: true,
      message: 'ok',
      data: {} as never,
    });

    render(<CreateDeliveredConsignmentForm onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Zapato Derby' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Acuerdo'), { target: { value: 'agreement-1' } });
    fireEvent.change(screen.getByLabelText('Producto'), { target: { value: 'product-1' } });
    fireEvent.click(screen.getByRole('button', { name: /registrar entrega/i }));

    await waitFor(() => {
      expect(deliveredConsignmentAgreementService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          consignmentAgreementId: 'agreement-1',
          productId: 'product-1',
          branchId: 'branch-1',
          status: 'active',
        })
      );
    });
  });
});
