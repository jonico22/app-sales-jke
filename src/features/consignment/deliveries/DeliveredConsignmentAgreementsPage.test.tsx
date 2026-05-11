import { render, screen } from '@/tests/test-utils';
import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DeliveredConsignmentAgreementsPage from './DeliveredConsignmentAgreementsPage';

const mockUseDeliveredConsignmentAgreementsQuery = vi.fn();
const mockUseOutgoingConsignmentAgreementsQuery = vi.fn();
const mockUseDeleteDeliveredConsignmentAgreement = vi.fn();
const mockConfirm = vi.fn();

vi.mock('../hooks/useConsignmentQueries', () => ({
  useDeliveredConsignmentAgreementsQuery: (...args: unknown[]) => mockUseDeliveredConsignmentAgreementsQuery(...args),
  useOutgoingConsignmentAgreementsQuery: (...args: unknown[]) => mockUseOutgoingConsignmentAgreementsQuery(...args),
  useDeleteDeliveredConsignmentAgreement: () => mockUseDeleteDeliveredConsignmentAgreement(),
  useDeliveredConsignmentAgreement: () => ({
    isLoading: false,
    data: null,
  }),
}));

vi.mock('@/features/inventory/hooks/useBranchOfficeQueries', () => ({
  useBranchOfficesSelect: () => ({
    data: [{ id: 'branch-1', name: 'Sucursal Centro' }],
  }),
}));

vi.mock('@/store/society.store', () => ({
  useSocietyStore: (selector: (state: { society: { id: string; code: string } }) => unknown) =>
    selector({ society: { id: 'soc-1', code: 'SOC-1' } }),
}));

vi.mock('./components/DeliveredConsignmentAgreementsHeader', () => ({
  DeliveredConsignmentAgreementsHeader: () => <div>header</div>,
}));

vi.mock('../components/ConsignmentPagination', () => ({
  ConsignmentPagination: () => <div>pagination</div>,
}));

vi.mock('@/utils/alerts', () => ({
  alerts: {
    confirm: (...args: unknown[]) => mockConfirm(...args),
  },
}));

describe('DeliveredConsignmentAgreementsPage', () => {
  it('renders deliveries with mapped branch and agreement labels', () => {
    mockUseDeleteDeliveredConsignmentAgreement.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    mockUseOutgoingConsignmentAgreementsQuery.mockReturnValue({
      data: {
        data: [{ id: 'agreement-1', agreementCode: 'CONS-001' }],
      },
    });
    mockUseDeliveredConsignmentAgreementsQuery.mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: 'delivery-1',
            consignmentAgreementId: 'agreement-1',
            productId: 'product-1',
            branchId: 'branch-1',
            deliveredStock: 10,
            remainingStock: 6,
            deliveryDate: '2026-04-10',
            status: 'active',
            notes: 'Entrega inicial',
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

    render(<DeliveredConsignmentAgreementsPage />);

    expect(screen.getAllByText('Sucursal Centro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CONS-001').length).toBeGreaterThan(0);
    expect(screen.getAllByText('6/10').length).toBeGreaterThan(0);
  });

  it('deletes a delivery after confirmation', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    mockConfirm.mockResolvedValue(true);
    mockUseDeleteDeliveredConsignmentAgreement.mockReturnValue({
      isPending: false,
      mutateAsync,
    });
    mockUseOutgoingConsignmentAgreementsQuery.mockReturnValue({
      data: {
        data: [{ id: 'agreement-1', agreementCode: 'CONS-001' }],
      },
    });
    mockUseDeliveredConsignmentAgreementsQuery.mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: 'delivery-1',
            consignmentAgreementId: 'agreement-1',
            productId: 'product-1',
            branchId: 'branch-1',
            deliveredStock: 10,
            remainingStock: 6,
            deliveryDate: '2026-04-10',
            status: 'active',
            notes: null,
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

    render(<DeliveredConsignmentAgreementsPage />);

    fireEvent.click(screen.getAllByRole('button', { name: /eliminar entrega/i })[0]);

    expect(mockConfirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('delivery-1');
    });
  });
});
