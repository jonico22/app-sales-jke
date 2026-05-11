import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  outgoingConsignmentAgreementService,
  OutgoingConsignmentAgreementStatus,
} from './outgoing-consignment-agreement.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('outgoingConsignmentAgreementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.put).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { ok: true } });
  });

  it('uses list and detail endpoints', async () => {
    await outgoingConsignmentAgreementService.getAll({
      societyId: 'SOC-001',
      status: OutgoingConsignmentAgreementStatus.ACTIVE,
      search: 'abril',
      page: 2,
      limit: 20,
      sortBy: 'startDate',
      sortOrder: 'desc',
    });
    await outgoingConsignmentAgreementService.getById('agreement-1');

    expect(api.get).toHaveBeenNthCalledWith(1, '/sales/outgoing-consignment-agreements', {
      params: {
        societyId: 'SOC-001',
        status: OutgoingConsignmentAgreementStatus.ACTIVE,
        search: 'abril',
        page: 2,
        limit: 20,
        sortBy: 'startDate',
        sortOrder: 'desc',
      },
    });
    expect(api.get).toHaveBeenNthCalledWith(2, '/sales/outgoing-consignment-agreements/agreement-1');
  });

  it('handles CRUD requests', async () => {
    await outgoingConsignmentAgreementService.create({
      societyId: 'SOC-001',
      branchId: '2a41beaa-f40b-4f0d-9005-657f0ea13f2a',
      partnerId: '5dc25791-42c2-4fd0-b331-0ec4434db9b7',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      commissionRate: 0.15,
      currencyId: '0a66065d-08bb-476d-b2b5-1d0ce17ac7f8',
      totalValue: 0,
      creditLimit: 5000,
      agreementCode: 'CONS-2026-0001',
      status: OutgoingConsignmentAgreementStatus.ACTIVE,
      notes: 'Acuerdo de abril',
      createdBy: 'admin@jke.local',
    });
    await outgoingConsignmentAgreementService.update('agreement-1', {
      status: OutgoingConsignmentAgreementStatus.TERMINATED,
      notes: 'Cierre anticipado',
    });
    await outgoingConsignmentAgreementService.delete('agreement-1');

    expect(api.post).toHaveBeenCalledWith(
      '/sales/outgoing-consignment-agreements',
      expect.objectContaining({
        agreementCode: 'CONS-2026-0001',
        commissionRate: 0.15,
      })
    );
    expect(api.put).toHaveBeenCalledWith('/sales/outgoing-consignment-agreements/agreement-1', {
      status: OutgoingConsignmentAgreementStatus.TERMINATED,
      notes: 'Cierre anticipado',
    });
    expect(api.delete).toHaveBeenCalledWith('/sales/outgoing-consignment-agreements/agreement-1');
  });
});
