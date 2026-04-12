import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestQueryClient } from '@/tests/test-utils';
import { useDashboardStats, DASHBOARD_STATS_QUERY_KEY } from './useDashboardStats';

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getStats: vi.fn(),
  },
}));

import { dashboardService } from '@/services/dashboard.service';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns dashboard data when service succeeds', async () => {
    vi.mocked(dashboardService.getStats).mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        salesToday: 10,
        salesThisWeek: 20,
        salesThisMonth: 30,
        completedOrdersToday: 1,
        completedOrdersThisWeek: 2,
        completedOrdersThisMonth: 3,
        averageTicketToday: 4,
        averageTicketThisWeek: 5,
        averageTicketThisMonth: 6,
      },
    });

    const { result } = renderHook(() => useDashboardStats(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      salesToday: 10,
      salesThisWeek: 20,
      salesThisMonth: 30,
      completedOrdersToday: 1,
      completedOrdersThisWeek: 2,
      completedOrdersThisMonth: 3,
      averageTicketToday: 4,
      averageTicketThisWeek: 5,
      averageTicketThisMonth: 6,
    });
    expect(DASHBOARD_STATS_QUERY_KEY).toEqual(['dashboard-stats']);
    expect(dashboardService.getStats).toHaveBeenCalledWith(undefined);
  });

  it('surfaces an error when service returns unsuccessful payload', async () => {
    vi.mocked(dashboardService.getStats).mockResolvedValue({
      success: false,
      message: 'nope',
      data: {
        salesToday: 0,
        salesThisWeek: 0,
        salesThisMonth: 0,
        completedOrdersToday: 0,
        completedOrdersThisWeek: 0,
        completedOrdersThisMonth: 0,
        averageTicketToday: 0,
        averageTicketThisWeek: 0,
        averageTicketThisMonth: 0,
      },
    });

    const { result } = renderHook(() => useDashboardStats(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('nope');
  });
});
