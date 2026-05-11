import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestQueryClient } from '@/tests/test-utils';
import { useClients, CLIENTS_QUERY_KEY } from './useClients';

vi.mock('@/services/client.service', () => ({
  clientService: {
    getForSelect: vi.fn(),
  },
}));

import { clientService } from '@/services/client.service';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe('useClients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns client options from the service', async () => {
    vi.mocked(clientService.getForSelect).mockResolvedValue({
      success: true,
      message: 'ok',
      data: [{ id: 'c1', name: 'Ana', documentNumber: '123' }],
    });

    const { result } = renderHook(() => useClients(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 'c1', name: 'Ana', documentNumber: '123' }]);
    expect(clientService.getForSelect).toHaveBeenCalled();
    expect(CLIENTS_QUERY_KEY).toEqual(['clients', 'select']);
  });

  it('falls back to an empty list when service data is missing', async () => {
    vi.mocked(clientService.getForSelect).mockResolvedValue({ success: true, message: 'ok', data: undefined as never });

    const { result } = renderHook(() => useClients(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
