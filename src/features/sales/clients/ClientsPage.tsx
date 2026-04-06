import { useState } from 'react';
import { ClientEditModal } from './components/ClientEditModal';
import { ClientFilterPanel } from './components/ClientFilterPanel';
import { type Client } from '@/services/client.service';
import { alerts } from '@/utils/alerts';
import { ClientsHeader } from './components/ClientsHeader';
import { ClientsFilterBar } from './components/ClientsFilterBar';
import { ClientsTable } from './components/ClientsTable';
import { ClientsMobileList } from './components/ClientsMobileList';
import { ClientsPagination } from './components/ClientsPagination';
import { useClientFilters } from './hooks/useClientFilters';
import { useClientsQuery, useDeleteClientMutation } from './hooks/useClientQueries';

export default function ClientsPage() {
  // ── Logic Hooks ────────────────────────────────────────────────────────
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    sortBy,
    sortOrder,
    handleSort,
    advancedFilters,
    handleApplyAdvancedFilters,
    queryParams
  } = useClientFilters();

  const { data, isLoading } = useClientsQuery(queryParams);
  const deleteMutation = useDeleteClientMutation();

  // ── Local UI State ─────────────────────────────────────────────────────
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // ── Data Processing ────────────────────────────────────────────────────
  const clients = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedClient(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteClient = async (id: string) => {
    const isConfirmed = await alerts.confirm({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar este cliente? Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444'
    });

    if (isConfirmed) {
      deleteMutation.mutate(id);
    }
  };

  const getClientDisplayName = (client: Client) => {
    if (client.typeBP === 'LEGAL_ENTITY' && client.companyName) {
      return client.companyName;
    }
    const parts = [client.firstName, client.middleName, client.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : (client.name || 'Sin nombre');
  };

  return (
    <div className="space-y-6">
      <ClientsHeader onCreateClick={handleCreateClick} />

      <ClientsFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onOpenFilterPanel={() => setIsFilterPanelOpen(true)}
      />

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <ClientsTable
            clients={clients}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEditClick}
            onDelete={handleDeleteClient}
            getClientDisplayName={getClientDisplayName}
        />

        <ClientsMobileList
            clients={clients}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClient}
            getClientDisplayName={getClientDisplayName}
        />

        <ClientsPagination
            clientsLength={clients.length}
            currentPage={currentPage}
            pageLimit={pageSize}
            totalClients={pagination?.total ?? 0}
            totalPages={pagination?.totalPages ?? 1}
            hasPrevPage={pagination?.hasPrevPage ?? false}
            hasNextPage={pagination?.hasNextPage ?? false}
            isLoading={isLoading}
            onPrevPage={() => setCurrentPage(prev => prev - 1)}
            onNextPage={() => setCurrentPage(prev => prev + 1)}
        />
      </div>

      <ClientFilterPanel
        open={isFilterPanelOpen}
        onOpenChange={setIsFilterPanelOpen}
        onApplyFilters={handleApplyAdvancedFilters}
        currentFilters={advancedFilters}
      />

      <ClientEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        client={selectedClient}
      />
    </div>
  );
}
