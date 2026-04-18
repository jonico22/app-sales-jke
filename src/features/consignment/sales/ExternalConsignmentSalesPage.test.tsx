import { render, screen } from '@/tests/test-utils';
import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ExternalConsignmentSalesPage from './ExternalConsignmentSalesPage';

const mockUseExternalConsignmentSalesQuery = vi.fn();
const mockUseDeleteExternalConsignmentSale = vi.fn();
const mockConfirm = vi.fn();

vi.mock('../hooks/useConsignmentQueries', () => ({
  useExternalConsignmentSalesQuery: (...args: unknown[]) => mockUseExternalConsignmentSalesQuery(...args),
  useDeleteExternalConsignmentSale: () => mockUseDeleteExternalConsignmentSale(),
  useExternalConsignmentSale: () => ({
    isLoading: false,
    data: null,
  }),
}));

vi.mock('./components/ExternalConsignmentSalesHeader', () => ({
  ExternalConsignmentSalesHeader: () => <div>header</div>,
}));

vi.mock('../components/ConsignmentPagination', () => ({
  ConsignmentPagination: () => <div>pagination</div>,
}));

vi.mock('@/utils/alerts', () => ({
  alerts: {
    confirm: (...args: unknown[]) => mockConfirm(...args),
  },
}));

describe('ExternalConsignmentSalesPage', () => {
  it('formats sale amounts when the API returns strings', () => {
    mockUseDeleteExternalConsignmentSale.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    mockUseExternalConsignmentSalesQuery.mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: 'sale-1',
            deliveredConsignmentId: 'delivery-1',
            soldQuantity: 2,
            reportedSaleDate: '2026-04-16',
            reportedSalePrice: '360.5',
            totalCommissionAmount: '54',
            netTotal: '306.5',
            unitSalePrice: '180.25',
            documentReference: 'FAC-001',
            remarks: 'Venta inicial',
          },
        ],
        pagination: {
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    });

    render(<ExternalConsignmentSalesPage />);

    expect(screen.getAllByText('360.50').length).toBeGreaterThan(0);
    expect(screen.getAllByText('54.00').length).toBeGreaterThan(0);
  });

  it('deletes a sale after confirmation', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    mockConfirm.mockResolvedValue(true);
    mockUseDeleteExternalConsignmentSale.mockReturnValue({
      isPending: false,
      mutateAsync,
    });
    mockUseExternalConsignmentSalesQuery.mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: 'sale-1',
            deliveredConsignmentId: 'delivery-1',
            soldQuantity: 2,
            reportedSaleDate: '2026-04-16',
            reportedSalePrice: '360.5',
            totalCommissionAmount: '54',
            netTotal: '306.5',
            unitSalePrice: '180.25',
            documentReference: 'FAC-001',
            remarks: null,
          },
        ],
        pagination: {
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    });

    render(<ExternalConsignmentSalesPage />);

    fireEvent.click(screen.getAllByRole('button', { name: /eliminar venta/i })[0]);

    expect(mockConfirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('sale-1');
    });
  });
});
