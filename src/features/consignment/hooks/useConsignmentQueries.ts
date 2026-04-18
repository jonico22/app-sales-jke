import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  outgoingConsignmentAgreementService,
  type GetOutgoingConsignmentAgreementsParams,
  type UpdateOutgoingConsignmentAgreementRequest,
} from '@/services/outgoing-consignment-agreement.service';
import {
  deliveredConsignmentAgreementService,
  type GetDeliveredConsignmentAgreementsParams,
  type UpdateDeliveredConsignmentAgreementRequest,
} from '@/services/delivered-consignment-agreement.service';
import {
  externalConsignmentSaleService,
  type GetExternalConsignmentSalesParams,
  type UpdateExternalConsignmentSaleRequest,
} from '@/services/external-consignment-sale.service';
import {
  receivedConsignmentSettlementService,
  type GetReceivedConsignmentSettlementsParams,
  type UpdateReceivedConsignmentSettlementRequest,
} from '@/services/received-consignment-settlement.service';
import { CLIENTS_QUERY_KEY } from '@/hooks/useClients';
import { branchOfficeKeys } from '@/features/inventory/hooks/useBranchOfficeQueries';

export const consignmentKeys = {
  all: ['consignment'] as const,
  agreements: () => [...consignmentKeys.all, 'agreements'] as const,
  agreementList: (params: GetOutgoingConsignmentAgreementsParams) => [...consignmentKeys.agreements(), 'list', params] as const,
  agreementDetails: () => [...consignmentKeys.agreements(), 'detail'] as const,
  agreementDetail: (id: string) => [...consignmentKeys.agreementDetails(), id] as const,
  deliveries: () => [...consignmentKeys.all, 'deliveries'] as const,
  deliveryList: (params: GetDeliveredConsignmentAgreementsParams) => [...consignmentKeys.deliveries(), 'list', params] as const,
  deliveryDetails: () => [...consignmentKeys.deliveries(), 'detail'] as const,
  deliveryDetail: (id: string) => [...consignmentKeys.deliveryDetails(), id] as const,
  sales: () => [...consignmentKeys.all, 'sales'] as const,
  salesList: (params: GetExternalConsignmentSalesParams) => [...consignmentKeys.sales(), 'list', params] as const,
  salesDetails: () => [...consignmentKeys.sales(), 'detail'] as const,
  salesDetail: (id: string) => [...consignmentKeys.salesDetails(), id] as const,
  settlements: () => [...consignmentKeys.all, 'settlements'] as const,
  settlementsList: (params: GetReceivedConsignmentSettlementsParams) => [...consignmentKeys.settlements(), 'list', params] as const,
  settlementDetails: () => [...consignmentKeys.settlements(), 'detail'] as const,
  settlementDetail: (id: string) => [...consignmentKeys.settlementDetails(), id] as const,
};

export function useOutgoingConsignmentAgreementsQuery(params: GetOutgoingConsignmentAgreementsParams) {
  return useQuery({
    queryKey: consignmentKeys.agreementList(params),
    queryFn: () => outgoingConsignmentAgreementService.getAll(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useOutgoingConsignmentAgreement(id: string | null) {
  return useQuery({
    queryKey: consignmentKeys.agreementDetail(id || ''),
    queryFn: () => outgoingConsignmentAgreementService.getById(id!).then((res) => res.data),
    enabled: !!id,
  });
}

export function useUpdateOutgoingConsignmentAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOutgoingConsignmentAgreementRequest }) =>
      outgoingConsignmentAgreementService.update(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Acuerdo actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: consignmentKeys.agreementDetail(id) });
      invalidateOutgoingAgreementRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'No se pudo actualizar el acuerdo');
    },
  });
}

export function useDeleteOutgoingConsignmentAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => outgoingConsignmentAgreementService.delete(id),
    onSuccess: () => {
      toast.success('Acuerdo eliminado correctamente');
      invalidateOutgoingAgreementRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'No se pudo eliminar el acuerdo');
    },
  });
}

export function useDeliveredConsignmentAgreementsQuery(params: GetDeliveredConsignmentAgreementsParams) {
  return useQuery({
    queryKey: consignmentKeys.deliveryList(params),
    queryFn: () => deliveredConsignmentAgreementService.getAll(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useDeliveredConsignmentAgreement(id: string | null) {
  return useQuery({
    queryKey: consignmentKeys.deliveryDetail(id || ''),
    queryFn: () => deliveredConsignmentAgreementService.getById(id!).then((res) => res.data),
    enabled: !!id,
  });
}

export function useUpdateDeliveredConsignmentAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeliveredConsignmentAgreementRequest }) =>
      deliveredConsignmentAgreementService.update(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Entrega actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: consignmentKeys.deliveryDetail(id) });
      invalidateDeliveredAgreementRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'No se pudo actualizar la entrega');
    },
  });
}

export function useDeleteDeliveredConsignmentAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deliveredConsignmentAgreementService.delete(id),
    onSuccess: () => {
      toast.success('Entrega eliminada correctamente');
      invalidateDeliveredAgreementRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'No se pudo eliminar la entrega');
    },
  });
}

export function useExternalConsignmentSalesQuery(params: GetExternalConsignmentSalesParams) {
  return useQuery({
    queryKey: consignmentKeys.salesList(params),
    queryFn: () => externalConsignmentSaleService.getAll(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useExternalConsignmentSale(id: string | null) {
  return useQuery({
    queryKey: consignmentKeys.salesDetail(id || ''),
    queryFn: () => externalConsignmentSaleService.getById(id!).then((res) => res.data),
    enabled: !!id,
  });
}

export function useUpdateExternalConsignmentSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExternalConsignmentSaleRequest }) =>
      externalConsignmentSaleService.update(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Venta externa actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: consignmentKeys.salesDetail(id) });
      invalidateExternalSaleRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'No se pudo actualizar la venta externa');
    },
  });
}

export function useDeleteExternalConsignmentSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => externalConsignmentSaleService.delete(id),
    onSuccess: () => {
      toast.success('Venta externa eliminada correctamente');
      invalidateExternalSaleRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'No se pudo eliminar la venta externa');
    },
  });
}

export function useReceivedConsignmentSettlementsQuery(params: GetReceivedConsignmentSettlementsParams) {
  return useQuery({
    queryKey: consignmentKeys.settlementsList(params),
    queryFn: () => receivedConsignmentSettlementService.getAll(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useReceivedConsignmentSettlement(id: string | null) {
  return useQuery({
    queryKey: consignmentKeys.settlementDetail(id || ''),
    queryFn: () => receivedConsignmentSettlementService.getById(id!).then((res) => res.data),
    enabled: !!id,
  });
}

export function useUpdateReceivedConsignmentSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReceivedConsignmentSettlementRequest }) =>
      receivedConsignmentSettlementService.update(id, data),
    onSuccess: (_, { id }) => {
      toast.success('Liquidación actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: consignmentKeys.settlementDetail(id) });
      invalidateSettlementRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'No se pudo actualizar la liquidación');
    },
  });
}

export function useDeleteReceivedConsignmentSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => receivedConsignmentSettlementService.delete(id),
    onSuccess: () => {
      toast.success('Liquidación eliminada correctamente');
      invalidateSettlementRelatedCaches(queryClient);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'No se pudo eliminar la liquidación');
    },
  });
}

function invalidateOutgoingAgreementRelatedCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: consignmentKeys.agreements() });
  queryClient.invalidateQueries({ queryKey: branchOfficeKeys.select() });
  queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
}

function invalidateDeliveredAgreementRelatedCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: consignmentKeys.deliveries() });
  queryClient.invalidateQueries({ queryKey: consignmentKeys.agreements() });
  queryClient.invalidateQueries({ queryKey: branchOfficeKeys.select() });
}

function invalidateExternalSaleRelatedCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: consignmentKeys.sales() });
  queryClient.invalidateQueries({ queryKey: consignmentKeys.deliveries() });
  queryClient.invalidateQueries({ queryKey: consignmentKeys.agreements() });
}

function invalidateSettlementRelatedCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: consignmentKeys.settlements() });
  queryClient.invalidateQueries({ queryKey: consignmentKeys.agreements() });
}
