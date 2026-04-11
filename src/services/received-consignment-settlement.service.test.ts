import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  receivedConsignmentSettlementService,
  ReceivedConsignmentSettlementStatus,
} from './received-consignment-settlement.service';

vi.mock('./api.client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api.client';

describe('receivedConsignmentSettlementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.post).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.put).mockResolvedValue({ data: { ok: true } });
    vi.mocked(api.delete).mockResolvedValue({ data: { ok: true } });
  });

  it('uses list and detail endpoints', async () => {
    await receivedConsignmentSettlementService.getAll({
      societyId: 'SOC-001',
      outgoingAgreementId: 'agreement-1',
      status: ReceivedConsignmentSettlementStatus.PENDING,
      settlementDateFrom: '2026-04-01',
      settlementDateTo: '2026-04-30',
      page: 1,
      limit: 20,
      sortBy: 'settlementDate',
      sortOrder: 'desc',
    });
    await receivedConsignmentSettlementService.getById('settlement-1');

    expect(api.get).toHaveBeenNthCalledWith(1, '/sales/received-consignment-settlements', {
      params: {
        societyId: 'SOC-001',
        outgoingAgreementId: 'agreement-1',
        status: ReceivedConsignmentSettlementStatus.PENDING,
        settlementDateFrom: '2026-04-01',
        settlementDateTo: '2026-04-30',
        page: 1,
        limit: 20,
        sortBy: 'settlementDate',
        sortOrder: 'desc',
      },
    });
    expect(api.get).toHaveBeenNthCalledWith(2, '/sales/received-consignment-settlements/settlement-1');
  });

  it('handles CRUD requests', async () => {
    await receivedConsignmentSettlementService.create({
      outgoingAgreementId: '0f97b6c1-0b8e-4b67-a9cf-f2321f873cb1',
      orderPaymentId: 'c8f94ea3-2dfa-4c2a-a5b7-4d82578e9e80',
      settlementDate: '2026-04-08',
      totalReportedSalesAmount: 360,
      consigneeCommissionAmount: 54,
      totalReceivedAmount: 306,
      status: ReceivedConsignmentSettlementStatus.PENDING,
      receiptReference: 'LIQ-00045',
      settlementNotes: 'Primera liquidacion',
      currencyId: '0a66065d-08bb-476d-b2b5-1d0ce17ac7f8',
      createdBy: 'admin@jke.local',
    });
    await receivedConsignmentSettlementService.update('settlement-1', {
      status: ReceivedConsignmentSettlementStatus.PAID,
      totalReceivedAmount: 306,
      settlementNotes: 'Liquidacion pagada',
    });
    await receivedConsignmentSettlementService.delete('settlement-1');

    expect(api.post).toHaveBeenCalledWith(
      '/sales/received-consignment-settlements',
      expect.objectContaining({
        totalReportedSalesAmount: 360,
        consigneeCommissionAmount: 54,
        totalReceivedAmount: 306,
      })
    );
    expect(api.put).toHaveBeenCalledWith('/sales/received-consignment-settlements/settlement-1', {
      status: ReceivedConsignmentSettlementStatus.PAID,
      totalReceivedAmount: 306,
      settlementNotes: 'Liquidacion pagada',
    });
    expect(api.delete).toHaveBeenCalledWith('/sales/received-consignment-settlements/settlement-1');
  });
});
