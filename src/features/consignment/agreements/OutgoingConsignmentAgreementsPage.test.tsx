import { render, screen } from '@/tests/test-utils';
import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import OutgoingConsignmentAgreementsPage from './OutgoingConsignmentAgreementsPage';

const mockUseOutgoingConsignmentAgreementsQuery = vi.fn();
const mockUseDeleteOutgoingConsignmentAgreement = vi.fn();
const mockConfirm = vi.fn();

vi.mock('../hooks/useConsignmentQueries', () => ({
  useOutgoingConsignmentAgreementsQuery: (...args: unknown[]) => mockUseOutgoingConsignmentAgreementsQuery(...args),
  useDeleteOutgoingConsignmentAgreement: () => mockUseDeleteOutgoingConsignmentAgreement(),
  useOutgoingConsignmentAgreement: () => ({
    isLoading: false,
    data: null,
  }),
}));

vi.mock('@/features/inventory/hooks/useBranchOfficeQueries', () => ({
  useBranchOfficesSelect: () => ({
    data: [{ id: 'branch-1', name: 'Sucursal Centro' }],
  }),
  branchOfficeKeys: {
    select: () => ['branch-offices', 'select'],
  },
}));

vi.mock('@/hooks/useClients', () => ({
  useClients: () => ({
    data: [{ id: 'partner-1', name: 'Comercial Vega' }],
  }),
  CLIENTS_QUERY_KEY: ['clients', 'select'],
}));

vi.mock('@/store/society.store', () => ({
  useSocietyStore: (selector: (state: { society: { id: string; code: string } }) => unknown) =>
    selector({ society: { id: 'soc-1', code: 'SOC-1' } }),
}));

vi.mock('./components/OutgoingConsignmentAgreementsHeader', () => ({
  OutgoingConsignmentAgreementsHeader: () => <div>header</div>,
}));

vi.mock('../components/ConsignmentPagination', () => ({
  ConsignmentPagination: () => <div>pagination</div>,
}));

vi.mock('@/utils/alerts', () => ({
  alerts: {
    confirm: (...args: unknown[]) => mockConfirm(...args),
  },
}));

describe('OutgoingConsignmentAgreementsPage', () => {
  it('renders agreements with mapped branch and partner names', () => {
    mockUseDeleteOutgoingConsignmentAgreement.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    mockUseOutgoingConsignmentAgreementsQuery.mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: 'agreement-1',
            agreementCode: 'CONS-001',
            branchId: 'branch-1',
            partnerId: 'partner-1',
            startDate: '2026-04-01',
            endDate: '2026-05-01',
            commissionRate: 0.15,
            status: 'ACTIVE',
            notes: 'Acuerdo premium',
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

    render(<OutgoingConsignmentAgreementsPage />);

    expect(screen.getAllByText('Sucursal Centro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Comercial Vega').length).toBeGreaterThan(0);
    expect(screen.getAllByText('15.00%').length).toBeGreaterThan(0);
  });

  it('deletes an agreement after confirmation', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    mockConfirm.mockResolvedValue(true);
    mockUseDeleteOutgoingConsignmentAgreement.mockReturnValue({
      isPending: false,
      mutateAsync,
    });
    mockUseOutgoingConsignmentAgreementsQuery.mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: 'agreement-1',
            agreementCode: 'CONS-001',
            branchId: 'branch-1',
            partnerId: 'partner-1',
            startDate: '2026-04-01',
            endDate: '2026-05-01',
            commissionRate: 0.15,
            status: 'ACTIVE',
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

    render(<OutgoingConsignmentAgreementsPage />);

    fireEvent.click(screen.getAllByRole('button', { name: /eliminar acuerdo/i })[0]);

    expect(mockConfirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('agreement-1');
    });
  });
});
