import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestQueryClient } from '@/tests/test-utils';
import { useNotificationsQuery, NOTIFICATIONS_QUERY_KEY } from './useNotificationsQuery';

vi.mock('@/services/notification.service', () => ({
  notificationService: {
    getAll: vi.fn(),
  },
}));

import { notificationService } from '@/services/notification.service';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe('useNotificationsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forwards params to the notifications service', async () => {
    const response = {
      success: true,
      message: 'ok',
      data: { items: [], total: 0, page: 2, totalPages: 1 },
    };
    vi.mocked(notificationService.getAll).mockResolvedValue(response);

    const { result } = renderHook(() => useNotificationsQuery({ page: 2, type: 'INFO' }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(response);
    expect(notificationService.getAll).toHaveBeenCalledWith({ page: 2, type: 'INFO' });
    expect(NOTIFICATIONS_QUERY_KEY).toEqual(['notifications', 'list']);
  });
});
