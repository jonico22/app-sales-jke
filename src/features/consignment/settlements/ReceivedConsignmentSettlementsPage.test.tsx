import { render, screen } from '@/tests/test-utils';
import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ReceivedConsignmentSettlementsPage from './ReceivedConsignmentSettlementsPage';

const mockUseReceivedConsignmentSettlementsQuery = vi.fn();
const mockUseOutgoingConsignmentAgreementsQuery = vi.fn();
const mockUseDeleteReceivedConsignmentSettlement = vi.fn();
const mockConfirm = vi.fn();

vi.mock('../hooks/useConsignmentQueries', () => ({
  useReceivedConsignmentSettlementsQuery: (...args: unknown[]) => mockUseReceivedConsignmentSettlementsQuery(...args),
  useOutgoingConsignmentAgreementsQuery: (...args: unknown[]) => mockUseOutgoingConsignmentAgreementsQuery(...args),
  useDeleteReceivedConsignmentSettlement: () => mockUseDeleteReceivedConsignmentSettlement(),
  useReceivedConsignmentSettlement: () => ({
    isLoading: false,
    data: null,
  }),
}));

vi.mock('@/store/society.store', () => ({
  useSocietyStore: (selector: (state: { society: { id: string; code: string } }) => unknown) =>
    selector({ society: { id: 'soc-1', code: 'SOC-1' } }),
}));

vi.mock('./components/ReceivedConsignmentSettlementsHeader', () => ({
  ReceivedConsignmentSettlementsHeader: () => <div>header</div>,
}));

vi.mock('../components/ConsignmentPagination', () => ({
  ConsignmentPagination: () => <div>pagination</div>,
}));

vi.mock('@/utils/alerts', () => ({
  alerts: {
    confirm: (...args: unknown[]) => mockConfirm(...args),
  },
}));

describe('ReceivedConsignmentSettlementsPage', () => {
  it('renders settlements with mapped agreement labels', () => {
    mockUseDeleteReceivedConsignmentSettlement.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    mockUseOutgoingConsignmentAgreementsQuery.mockReturnValue({
      data: {
        data: [{ id: 'agreement-1', agreementCode: 'CONS-001' }],
      },
    });
    mockUseReceivedConsignmentSettlementsQuery.mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: 'settlement-1',
            outgoingAgreementId: 'agreement-1',
            settlementDate: '2026-04-16',
            totalReportedSalesAmount: 540,
            consigneeCommissionAmount: 81,
            totalReceivedAmount: 459,
            status: 'PAID',
            receiptReference: 'LIQ-001',
            settlementNotes: 'Liquidación final',
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

    render(<ReceivedConsignmentSettlementsPage />);

    expect(screen.getAllByText('CONS-001').length).toBeGreaterThan(0);
    expect(screen.getAllByText('459.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('540.00').length).toBeGreaterThan(0);
  });

  it('deletes a settlement after confirmation', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    mockConfirm.mockResolvedValue(true);
    mockUseDeleteReceivedConsignmentSettlement.mockReturnValue({
      isPending: false,
      mutateAsync,
    });
    mockUseOutgoingConsignmentAgreementsQuery.mockReturnValue({
      data: {
        data: [{ id: 'agreement-1', agreementCode: 'CONS-001' }],
      },
    });
    mockUseReceivedConsignmentSettlementsQuery.mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: 'settlement-1',
            outgoingAgreementId: 'agreement-1',
            settlementDate: '2026-04-16',
            totalReportedSalesAmount: 540,
            consigneeCommissionAmount: 81,
            totalReceivedAmount: 459,
            status: 'PAID',
            receiptReference: 'LIQ-001',
            settlementNotes: null,
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

    render(<ReceivedConsignmentSettlementsPage />);

    fireEvent.click(screen.getAllByRole('button', { name: /eliminar liquidación/i })[0]);

    expect(mockConfirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('settlement-1');
    });
  });
});
