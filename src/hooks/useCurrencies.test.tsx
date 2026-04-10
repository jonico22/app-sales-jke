import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestQueryClient } from '@/tests/test-utils';
import { useCurrencies, CURRENCIES_QUERY_KEY } from './useCurrencies';

vi.mock('@/services/currency.service', () => ({
  currencyService: {
    getForSelect: vi.fn(),
  },
}));

import { currencyService } from '@/services/currency.service';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe('useCurrencies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns currencies from the service', async () => {
    vi.mocked(currencyService.getForSelect).mockResolvedValue({
      success: true,
      message: 'ok',
      data: [{ id: 'pen', name: 'Sol', code: 'PEN', symbol: 'S/', exchangeRate: 1 }],
    });

    const { result } = renderHook(() => useCurrencies(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 'pen', name: 'Sol', code: 'PEN', symbol: 'S/', exchangeRate: 1 }]);
    expect(CURRENCIES_QUERY_KEY).toEqual(['currencies', 'select']);
  });
});
