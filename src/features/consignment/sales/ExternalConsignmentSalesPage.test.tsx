import { render, screen } from '@/tests/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ExternalConsignmentSalesPage from './ExternalConsignmentSalesPage';

vi.mock('../hooks/useConsignmentQueries', () => ({
  useExternalConsignmentSalesQuery: vi.fn(() => ({
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
          documentReference: 'FAC-001',
        },
      ],
      pagination: {
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    },
  })),
}));

vi.mock('./components/ExternalConsignmentSalesHeader', () => ({
  ExternalConsignmentSalesHeader: () => <div>header</div>,
}));

vi.mock('../components/ConsignmentPagination', () => ({
  ConsignmentPagination: () => <div>pagination</div>,
}));

describe('ExternalConsignmentSalesPage', () => {
  it('formats sale amounts when the API returns strings', () => {
    render(<ExternalConsignmentSalesPage />);

    expect(screen.getAllByText('360.50').length).toBeGreaterThan(0);
    expect(screen.getByText('54.00')).toBeInTheDocument();
  });
});
