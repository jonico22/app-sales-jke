import { describe, it, expect, vi, beforeEach } from 'vitest';

const requestUse = vi.fn();
const responseUse = vi.fn();
const axiosInstance = Object.assign(vi.fn(), {
  defaults: { headers: { common: {} as Record<string, string> } },
  interceptors: {
    request: { use: requestUse },
    response: { use: responseUse },
  },
});

const createMock = vi.fn(() => axiosInstance);

vi.mock('axios', () => ({
  default: {
    create: createMock,
  },
}));

const loginMock = vi.fn();
const logoutMock = vi.fn();
const getStateMock = vi.fn();
const refreshSessionMock = vi.fn();

vi.mock('@/store/auth.store', () => ({
  useAuthStore: {
    getState: getStateMock,
  },
}));

vi.mock('@/services/auth.service', () => ({
  authService: {
    refreshSession: refreshSessionMock,
  },
}));

describe('api.client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    getStateMock.mockReturnValue({
      token: 'token-1',
      user: { id: 'user-1' },
      role: { id: 'role-1' },
      login: loginMock,
      logout: logoutMock,
    });
  });

  it('attaches auth token in request interceptor', async () => {
    await import('./api.client');
    const requestInterceptor = requestUse.mock.calls[0][0];
    const config = await requestInterceptor({ headers: {} });

    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    }));
    expect(config.headers.Authorization).toBe('Bearer token-1');
  });

  it('refreshes session on 401 responses and retries the request', async () => {
    const { default: api } = await import('./api.client');
    refreshSessionMock.mockResolvedValue({
      success: true,
      data: { token: 'token-2', expiresAt: '2099-01-01' },
    });
    const responseInterceptor = responseUse.mock.calls[0][1];
    const retriedResponse = { ok: true };
    axiosInstance.mockResolvedValue(retriedResponse);

    const result = await responseInterceptor({
      config: { url: '/sales/orders', headers: {} },
      response: { status: 401 },
    });

    expect(refreshSessionMock).toHaveBeenCalled();
    expect(loginMock).toHaveBeenCalled();
    expect(api.defaults.headers.common.Authorization).toBe('Bearer token-2');
    expect(result).toEqual(retriedResponse);
  });

  it('logs out when refresh fails', async () => {
    await import('./api.client');
    refreshSessionMock.mockRejectedValue(new Error('refresh failed'));
    const responseInterceptor = responseUse.mock.calls[0][1];

    await expect(responseInterceptor({
      config: { url: '/sales/orders', headers: {} },
      response: { status: 401 },
    })).rejects.toThrow('refresh failed');

    expect(logoutMock).toHaveBeenCalled();
  });
});
