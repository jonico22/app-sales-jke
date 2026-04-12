import { useQuery } from '@tanstack/react-query';
import {
  outgoingConsignmentAgreementService,
  type GetOutgoingConsignmentAgreementsParams,
} from '@/services/outgoing-consignment-agreement.service';
import {
  deliveredConsignmentAgreementService,
  type GetDeliveredConsignmentAgreementsParams,
} from '@/services/delivered-consignment-agreement.service';
import {
  externalConsignmentSaleService,
  type GetExternalConsignmentSalesParams,
} from '@/services/external-consignment-sale.service';
import {
  receivedConsignmentSettlementService,
  type GetReceivedConsignmentSettlementsParams,
} from '@/services/received-consignment-settlement.service';

export const consignmentKeys = {
  all: ['consignment'] as const,
  agreements: () => [...consignmentKeys.all, 'agreements'] as const,
  agreementList: (params: GetOutgoingConsignmentAgreementsParams) => [...consignmentKeys.agreements(), 'list', params] as const,
  deliveries: () => [...consignmentKeys.all, 'deliveries'] as const,
  deliveryList: (params: GetDeliveredConsignmentAgreementsParams) => [...consignmentKeys.deliveries(), 'list', params] as const,
  sales: () => [...consignmentKeys.all, 'sales'] as const,
  salesList: (params: GetExternalConsignmentSalesParams) => [...consignmentKeys.sales(), 'list', params] as const,
  settlements: () => [...consignmentKeys.all, 'settlements'] as const,
  settlementsList: (params: GetReceivedConsignmentSettlementsParams) => [...consignmentKeys.settlements(), 'list', params] as const,
};

export function useOutgoingConsignmentAgreementsQuery(params: GetOutgoingConsignmentAgreementsParams) {
  return useQuery({
    queryKey: consignmentKeys.agreementList(params),
    queryFn: () => outgoingConsignmentAgreementService.getAll(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useDeliveredConsignmentAgreementsQuery(params: GetDeliveredConsignmentAgreementsParams) {
  return useQuery({
    queryKey: consignmentKeys.deliveryList(params),
    queryFn: () => deliveredConsignmentAgreementService.getAll(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useExternalConsignmentSalesQuery(params: GetExternalConsignmentSalesParams) {
  return useQuery({
    queryKey: consignmentKeys.salesList(params),
    queryFn: () => externalConsignmentSaleService.getAll(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useReceivedConsignmentSettlementsQuery(params: GetReceivedConsignmentSettlementsParams) {
  return useQuery({
    queryKey: consignmentKeys.settlementsList(params),
    queryFn: () => receivedConsignmentSettlementService.getAll(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
}
