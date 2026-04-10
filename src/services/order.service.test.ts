import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService } from './order.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.put).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { ok: true } });
  });

  it('calls report, select and CRUD endpoints', async () => {
    await orderService.getAll({ status: 'PENDING' });
    await orderService.getReports({ partnerId: 'client1' });
    await orderService.getForSelect();
    await orderService.getById('o1');
    await orderService.create({
      partnerId: 'client1',
      branchId: 'b1',
      currencyId: 'pen',
      exchangeRate: 1,
      subtotal: 10,
      taxAmount: 1.8,
      total: 11.8,
      orderItems: [{ productId: 'p1', quantity: 1, unitPrice: 10, total: 10 }],
    });
    await orderService.update('o1', { notes: 'updated' });
    await orderService.delete('o1');
    await orderService.getCreatedByUsers();

    expect(api.get).toHaveBeenNthCalledWith(1, '/sales/orders', { params: { status: 'PENDING' } });
    expect(api.get).toHaveBeenNthCalledWith(2, '/sales/orders/reports', { params: { partnerId: 'client1' } });
    expect(api.get).toHaveBeenNthCalledWith(3, '/sales/orders/select');
    expect(api.get).toHaveBeenNthCalledWith(4, '/sales/orders/o1');
    expect(api.get).toHaveBeenNthCalledWith(5, '/sales/orders/created-by-users');
    expect(api.post).toHaveBeenCalledWith('/sales/orders', expect.objectContaining({ partnerId: 'client1' }));
    expect(api.put).toHaveBeenCalledWith('/sales/orders/o1', { notes: 'updated' });
    expect(api.delete).toHaveBeenCalledWith('/sales/orders/o1');
  });
});
