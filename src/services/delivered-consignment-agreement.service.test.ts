import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deliveredConsignmentAgreementService } from './delivered-consignment-agreement.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('deliveredConsignmentAgreementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.put).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { ok: true } });
  });

  it('uses list and detail endpoints', async () => {
    await deliveredConsignmentAgreementService.getAll({
      societyId: 'SOC-001',
      consignmentAgreementId: 'agreement-1',
      productId: 'product-1',
      branchId: 'branch-1',
      status: 'active',
      deliveryDateFrom: '2026-04-01',
      deliveryDateTo: '2026-04-30',
      page: 1,
      limit: 25,
      sortBy: 'deliveryDate',
      sortOrder: 'desc',
    });
    await deliveredConsignmentAgreementService.getById('delivery-1');

    expect(api.get).toHaveBeenNthCalledWith(1, '/sales/delivered-consignment-agreements', {
      params: {
        societyId: 'SOC-001',
        consignmentAgreementId: 'agreement-1',
        productId: 'product-1',
        branchId: 'branch-1',
        status: 'active',
        deliveryDateFrom: '2026-04-01',
        deliveryDateTo: '2026-04-30',
        page: 1,
        limit: 25,
        sortBy: 'deliveryDate',
        sortOrder: 'desc',
      },
    });
    expect(api.get).toHaveBeenNthCalledWith(2, '/sales/delivered-consignment-agreements/delivery-1');
  });

  it('handles CRUD requests', async () => {
    await deliveredConsignmentAgreementService.create({
      consignmentAgreementId: '0f97b6c1-0b8e-4b67-a9cf-f2321f873cb1',
      productId: '98664aa0-a5f5-469e-8ff7-061864c6b1e8',
      branchId: '2a41beaa-f40b-4f0d-9005-657f0ea13f2a',
      deliveredStock: 12,
      costPrice: 80,
      suggestedSalePrice: 120,
      taxAmount: 0,
      deliveryDate: '2026-04-02',
      status: 'active',
      notes: 'Primera entrega',
    });
    await deliveredConsignmentAgreementService.update('delivery-1', {
      remainingStock: 8,
      totalCost: 960,
      totalValue: 1440,
      notes: 'Actualizacion de stock',
    });
    await deliveredConsignmentAgreementService.delete('delivery-1');

    expect(api.post).toHaveBeenCalledWith(
      '/sales/delivered-consignment-agreements',
      expect.objectContaining({
        deliveredStock: 12,
        costPrice: 80,
        suggestedSalePrice: 120,
      })
    );
    expect(api.put).toHaveBeenCalledWith('/sales/delivered-consignment-agreements/delivery-1', {
      remainingStock: 8,
      totalCost: 960,
      totalValue: 1440,
      notes: 'Actualizacion de stock',
    });
    expect(api.delete).toHaveBeenCalledWith('/sales/delivered-consignment-agreements/delivery-1');
  });
});
