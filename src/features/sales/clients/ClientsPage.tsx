import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ClientEditModal } from './components/ClientEditModal';
import { ClientFilterPanel, type FilterValues } from './components/ClientFilterPanel';
import { clientService, type Client } from '@/services/client.service';
import { alerts } from '@/utils/alerts';
import { ClientsHeader } from './components/ClientsHeader';
import { ClientsFilterBar } from './components/ClientsFilterBar';
import { ClientsTable } from './components/ClientsTable';
import { ClientsMobileList } from './components/ClientsMobileList';
import { ClientsPagination } from './components/ClientsPagination';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({
    createdBy: undefined,
    createdAtFrom: null,
    createdAtTo: null,
    updatedAtFrom: null,
    updatedAtTo: null,
  });

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const pageLimit = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: pageLimit,
      };

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active';
      }

      // Add advanced filters
      if (advancedFilters.createdBy) {
        params.createdBy = advancedFilters.createdBy;
      }
      if (advancedFilters.createdAtFrom) {
        const date = advancedFilters.createdAtFrom;
        params.createdAtFrom = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      if (advancedFilters.createdAtTo) {
        const date = advancedFilters.createdAtTo;
        params.createdAtTo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      if (advancedFilters.updatedAtFrom) {
        const date = advancedFilters.updatedAtFrom;
        params.updatedAtFrom = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
      if (advancedFilters.updatedAtTo) {
        const date = advancedFilters.updatedAtTo;
        params.updatedAtTo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }

      params.sortBy = sortBy;
      params.sortOrder = sortOrder;

      const response = await clientService.getAll(params);

      setClients(response.data.data || []);
      setTotalPages(response.data.pagination.totalPages);
      setTotalClients(response.data.pagination.total);
      setHasNextPage(response.data.pagination.hasNextPage);
      setHasPrevPage(response.data.pagination.hasPrevPage);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast.error(error.response?.data?.message || 'Error al cargar los clientes');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentPage, debouncedSearchTerm, statusFilter, advancedFilters, sortBy, sortOrder]);

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedClient(null);
    setIsEditModalOpen(true);
  };

  const handleSaveClient = () => {
    fetchClients(); // Refresh list after save
  };

  const handleDeleteClient = async (id: string) => {
    const isConfirmed = await alerts.confirm({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar este cliente? Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444'
    });

    if (!isConfirmed) return;

    try {
      await clientService.delete(id);
      toast.success('Cliente eliminado exitosamente');
      await fetchClients(); // Refresh list
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el cliente');
    }
  };

  const handleApplyFilters = (filters: FilterValues) => {
    setAdvancedFilters(filters);
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getClientDisplayName = (client: Client) => {
    if (client.typeBP === 'LEGAL_ENTITY' && client.companyName) {
      return client.companyName;
    }
    const parts = [client.firstName, client.middleName, client.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : (client.name || 'Sin nombre');
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
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
            pageLimit={pageLimit}
            totalClients={totalClients}
            totalPages={totalPages}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
        />
      </div>

      <ClientFilterPanel
        open={isFilterPanelOpen}
        onOpenChange={setIsFilterPanelOpen}
        onApplyFilters={handleApplyFilters}
      />

      <ClientEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        client={selectedClient}
        onSave={handleSaveClient}
      />
    </div>
  );
}
