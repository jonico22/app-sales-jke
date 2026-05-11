import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from './user.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the expected business user endpoints', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.post).mockResolvedValue({ data: { created: true } });
    vi.mocked(api.put).mockResolvedValue({ data: { updated: true } });
    vi.mocked(api.patch).mockResolvedValue({ data: { toggled: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { deleted: true } });

    await userService.getMe();
    await userService.getBusinessUsers({ sortBy: 'name', sortOrder: 'asc' });
    await userService.createBusinessUser({ email: 'a@b.com', firstName: 'Ana', lastName: 'Lopez', roleCode: 'ADMIN' });
    await userService.updateBusinessUser('u1', { firstName: 'Ana' });
    await userService.toggleUserStatus('u1');
    await userService.deleteBusinessUser('u1');

    expect(api.get).toHaveBeenNthCalledWith(1, '/users/me');
    expect(api.get).toHaveBeenNthCalledWith(2, '/users/business', { params: { sortBy: 'name', sortOrder: 'asc' } });
    expect(api.post).toHaveBeenCalledWith('/users/business', expect.objectContaining({ email: 'a@b.com' }));
    expect(api.put).toHaveBeenCalledWith('/users/business/u1', { firstName: 'Ana' });
    expect(api.patch).toHaveBeenCalledWith('/users/business/u1/toggle-status');
    expect(api.delete).toHaveBeenCalledWith('/users/business/u1');
  });
});
