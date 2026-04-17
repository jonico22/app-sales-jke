import { fireEvent, render, screen, waitFor } from '@/tests/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateExternalConsignmentSaleForm } from './CreateExternalConsignmentSaleForm';
import { useSocietyStore } from '@/store/society.store';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/delivered-consignment-agreement.service', () => ({
  deliveredConsignmentAgreementService: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/services/external-consignment-sale.service', () => ({
  externalConsignmentSaleService: {
    create: vi.fn(),
  },
}));

vi.mock('@/services/outgoing-consignment-agreement.service', () => ({
  outgoingConsignmentAgreementService: {
    getById: vi.fn(),
  },
}));

vi.mock('@/services/product.service', () => ({
  productService: {
    getById: vi.fn(),
  },
}));

import { deliveredConsignmentAgreementService } from '@/services/delivered-consignment-agreement.service';
import { outgoingConsignmentAgreementService } from '@/services/outgoing-consignment-agreement.service';
import { productService } from '@/services/product.service';

describe('CreateExternalConsignmentSaleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useSocietyStore.setState({
      society: {
        id: 'soc-1',
        code: 'SOC-001',
        name: 'JKE',
      } as never,
    });

    vi.mocked(deliveredConsignmentAgreementService.getAll).mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        data: [
          {
            id: 'delivery-1',
            consignmentAgreementId: 'agreement-1',
            productId: 'product-1',
            remainingStock: 8,
            suggestedSalePrice: 120,
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

    vi.mocked(productService.getById).mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        id: 'product-1',
        name: 'Zapato Derby',
        price: '120',
      },
    } as never);

    vi.mocked(outgoingConsignmentAgreementService.getById).mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        id: 'agreement-1',
        commissionRate: 0.15,
      },
    } as never);
  });

  it('loads product, price, total sale and commission after selecting a delivery', async () => {
    render(<CreateExternalConsignmentSaleForm onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /delivery-1/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Entrega'), { target: { value: 'delivery-1' } });

    await waitFor(() => {
      expect(screen.getByText('Zapato Derby')).toBeInTheDocument();
      expect(screen.getByText('15.00%')).toBeInTheDocument();
      expect(screen.getByLabelText('Precio Unitario')).toHaveValue(120);
      expect(screen.getByLabelText('Venta Total Reportada')).toHaveValue(120);
      expect(screen.getByLabelText('Comisión Total')).toHaveValue(18);
    });
  });
});
