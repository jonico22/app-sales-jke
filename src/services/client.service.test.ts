import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientService } from './client.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('clientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.put).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { ok: true } });
  });

  it('uses the expected CRUD and select endpoints', async () => {
    await clientService.getAll({ search: 'ana', page: 2 });
    await clientService.getForSelect();
    await clientService.getById('c1');
    await clientService.create({ documentNumber: '123' });
    await clientService.update('c1', { email: 'a@b.com' });
    await clientService.delete('c1');
    await clientService.getCreatedByUsers();

    expect(api.get).toHaveBeenNthCalledWith(1, '/sales/clients', { params: { search: 'ana', page: 2 } });
    expect(api.get).toHaveBeenNthCalledWith(2, '/sales/clients/select');
    expect(api.get).toHaveBeenNthCalledWith(3, '/sales/clients/c1');
    expect(api.get).toHaveBeenNthCalledWith(4, '/sales/clients/created-by-users');
    expect(api.post).toHaveBeenCalledWith('/sales/clients', { documentNumber: '123' });
    expect(api.put).toHaveBeenCalledWith('/sales/clients/c1', { email: 'a@b.com' });
    expect(api.delete).toHaveBeenCalledWith('/sales/clients/c1');
  });
});
