import { describe, it, expect, vi, beforeEach } from 'vitest';
import { currencyService } from './currency.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('currencyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.put).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { ok: true } });
  });

  it('uses the expected list, select and CRUD endpoints', async () => {
    await currencyService.getAll({ search: 'sol' });
    await currencyService.getForSelect();
    await currencyService.getById('cur1');
    await currencyService.create({ code: 'PEN', name: 'Sol', symbol: 'S/', exchangeRate: 1 });
    await currencyService.update('cur1', { name: 'Nuevo Sol' });
    await currencyService.delete('cur1');
    await currencyService.getCreatedByUsers();

    expect(api.get).toHaveBeenNthCalledWith(1, '/sales/currencies', { params: { search: 'sol' } });
    expect(api.get).toHaveBeenNthCalledWith(2, '/sales/currencies/select');
    expect(api.get).toHaveBeenNthCalledWith(3, '/sales/currencies/cur1');
    expect(api.get).toHaveBeenNthCalledWith(4, '/sales/currencies/created-by-users');
    expect(api.post).toHaveBeenCalledWith('/sales/currencies', expect.objectContaining({ code: 'PEN' }));
    expect(api.put).toHaveBeenCalledWith('/sales/currencies/cur1', { name: 'Nuevo Sol' });
    expect(api.delete).toHaveBeenCalledWith('/sales/currencies/cur1');
  });
});
