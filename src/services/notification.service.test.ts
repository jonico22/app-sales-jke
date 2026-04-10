import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationService } from './notification.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.patch).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { ok: true } });
  });

  it('uses list, unread count and mutation endpoints', async () => {
    await notificationService.getAll({ page: 3, type: 'INFO' });
    await notificationService.getUnreadCount();
    await notificationService.markAsRead('n1');
    await notificationService.markAllAsRead();
    await notificationService.delete('n1');

    expect(api.get).toHaveBeenNthCalledWith(1, '/notifications', { params: { page: 3, type: 'INFO' } });
    expect(api.get).toHaveBeenNthCalledWith(2, '/notifications/unread-count');
    expect(api.patch).toHaveBeenNthCalledWith(1, '/notifications/n1/read');
    expect(api.patch).toHaveBeenNthCalledWith(2, '/notifications/mark-all-read');
    expect(api.delete).toHaveBeenCalledWith('/notifications/n1');
  });
});
