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
        totalStockValue: 10,
        lowStockItems: 2,
        netSales: 8,
        newProducts: 1,
      },
    });

    const { result } = renderHook(() => useDashboardStats(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      totalStockValue: 10,
      lowStockItems: 2,
      netSales: 8,
      newProducts: 1,
    });
    expect(DASHBOARD_STATS_QUERY_KEY).toEqual(['dashboard-stats']);
  });

  it('surfaces an error when service returns unsuccessful payload', async () => {
    vi.mocked(dashboardService.getStats).mockResolvedValue({
      success: false,
      message: 'nope',
      data: {
        totalStockValue: 0,
        lowStockItems: 0,
        netSales: 0,
        newProducts: 0,
      },
    });

    const { result } = renderHook(() => useDashboardStats(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('nope');
  });
});
