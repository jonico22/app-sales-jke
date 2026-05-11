import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';

vi.mock('./api.client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

import api from './api.client';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends login payload and optional turnstile header', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } });

    const result = await authService.login({ email: 'a@b.com', password: 'secret', turnstileToken: 'token' });

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'secret' }, {
      headers: { 'x-turnstile-token': 'token' },
    });
    expect(result).toEqual({ success: true });
  });

  it('delegates read and update endpoints', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { me: true } });
    vi.mocked(api.get).mockResolvedValueOnce({ data: { permissions: true } });
    vi.mocked(api.post).mockResolvedValueOnce({ data: { refreshed: true } });
    vi.mocked(api.put).mockResolvedValueOnce({ data: { updated: true } });

    await expect(authService.getMe()).resolves.toEqual({ me: true });
    await expect(authService.getPermissions()).resolves.toEqual({ permissions: true });
    await expect(authService.refreshSession()).resolves.toEqual({ refreshed: true });
    await expect(authService.updateProfile({ firstName: 'Ana' })).resolves.toEqual({ updated: true });

    expect(api.get).toHaveBeenNthCalledWith(1, '/auth/me');
    expect(api.get).toHaveBeenNthCalledWith(2, '/auth/me/permissions');
    expect(api.post).toHaveBeenNthCalledWith(1, '/auth/refresh-session');
    expect(api.put).toHaveBeenCalledWith('/users/me', { firstName: 'Ana' });
  });
});
