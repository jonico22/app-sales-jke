import { beforeEach, describe, expect, it, vi } from 'vitest';
import { externalConsignmentSaleService } from './external-consignment-sale.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('externalConsignmentSaleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.put).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { ok: true } });
  });

  it('uses list and detail endpoints', async () => {
    await externalConsignmentSaleService.getAll({
      deliveredConsignmentId: 'delivery-1',
      reportedSaleDateFrom: '2026-04-01',
      reportedSaleDateTo: '2026-04-30',
      minSalePrice: 100,
      maxSalePrice: 500,
      page: 1,
      limit: 20,
      sortBy: 'reportedSaleDate',
      sortOrder: 'desc',
    });
    await externalConsignmentSaleService.getById('sale-1');

    expect(api.get).toHaveBeenNthCalledWith(1, '/sales/external-consignment-sales', {
      params: {
        deliveredConsignmentId: 'delivery-1',
        reportedSaleDateFrom: '2026-04-01',
        reportedSaleDateTo: '2026-04-30',
        minSalePrice: 100,
        maxSalePrice: 500,
        page: 1,
        limit: 20,
        sortBy: 'reportedSaleDate',
        sortOrder: 'desc',
      },
    });
    expect(api.get).toHaveBeenNthCalledWith(2, '/sales/external-consignment-sales/sale-1');
  });

  it('handles CRUD requests', async () => {
    await externalConsignmentSaleService.create({
      deliveredConsignmentId: '9c38f8b2-b67d-4f46-a6a1-51984ed93853',
      soldQuantity: 3,
      reportedSaleDate: '2026-04-05',
      reportedSalePrice: 360,
      unitSalePrice: 120,
      totalCommissionAmount: 54,
      remarks: 'Venta reportada por el consignatario',
      documentReference: 'FAC-EXT-1001',
    });
    await externalConsignmentSaleService.update('sale-1', {
      soldQuantity: 2,
      netTotal: 186,
      remarks: 'Venta corregida',
    });
    await externalConsignmentSaleService.delete('sale-1');

    expect(api.post).toHaveBeenCalledWith(
      '/sales/external-consignment-sales',
      expect.objectContaining({
        soldQuantity: 3,
        reportedSalePrice: 360,
        totalCommissionAmount: 54,
      })
    );
    expect(api.put).toHaveBeenCalledWith('/sales/external-consignment-sales/sale-1', {
      soldQuantity: 2,
      netTotal: 186,
      remarks: 'Venta corregida',
    });
    expect(api.delete).toHaveBeenCalledWith('/sales/external-consignment-sales/sale-1');
  });
});
