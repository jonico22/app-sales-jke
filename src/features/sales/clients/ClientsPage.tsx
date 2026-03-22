import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import {
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui';
import { toast } from 'sonner';
import { ClientEditModal } from './components/ClientEditModal';
import { ClientFilterPanel, type FilterValues } from './components/ClientFilterPanel';
import { clientService, type Client } from '@/services/client.service';
import { alerts } from '@/utils/alerts';
import { cn } from '@/lib/utils';

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
  const [sortBy, setSortBy] = useState<string>('createdAt');
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

  const getStatusLabel = () => {
    switch (statusFilter) {
      case 'active': return 'Activos';
      case 'inactive': return 'Inactivos';
      default: return 'Todos los estados';
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight uppercase">Gestión de Clientes</h2>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Administre la información y contacto de sus clientes habituales.</p>
        </div>
        <Button 
          onClick={handleCreateClick}
          className="h-9 px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o documento..."
            className="pl-9 bg-background border-input focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full sm:w-auto gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none justify-between h-10 text-[11px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted min-w-[160px] rounded-xl transition-all">
                {getStatusLabel()}
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] bg-card border-border shadow-xl rounded-xl p-1">
              <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('all')}>
                Todos los estados
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('active')}>
                Solo Activos
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] font-medium py-2 rounded-lg cursor-pointer" onClick={() => setStatusFilter('inactive')}>
                Solo Inactivos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
  
          <Button
            variant="outline"
            className="flex-1 sm:flex-none h-10 text-[11px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted gap-2 rounded-xl transition-all"
            onClick={() => setIsFilterPanelOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Data Table / Cards View */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Desktop/Tablet Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
          <TableHeader className="bg-muted/30 border-b border-border">
            <TableRow className="hover:bg-muted/40 border-none h-10">
              <SortableTableHead 
                field="documentNumber" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder} 
                onSort={handleSort}
                className="w-[140px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70 pl-6"
              >
                Documento
              </SortableTableHead>
              <SortableTableHead 
                field="name" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder} 
                onSort={handleSort}
                className="w-[250px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
              >
                Nombre / Razón Social
              </SortableTableHead>
              <SortableTableHead 
                field="email" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder} 
                onSort={handleSort}
                className="w-[200px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
              >
                Contacto
              </SortableTableHead>
              <SortableTableHead 
                field="address" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder} 
                onSort={handleSort}
                className="w-[250px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
              >
                Dirección
              </SortableTableHead>
              <SortableTableHead 
                field="isActive" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder} 
                onSort={handleSort}
                className="w-[100px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
              >
                Estado
              </SortableTableHead>
              <TableHead className="w-[90px] text-right font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70 pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Cargando clientes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/30 border-border transition-colors group">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter px-1.5 h-4 border-muted-foreground/30 text-muted-foreground/80">
                        {client.documentType}
                      </Badge>
                      <span className="font-mono text-[11px] font-bold text-foreground">
                        {client.documentNumber || 'S/N'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-foreground text-xs">{getClientDisplayName(client)}</div>
                    <div className="text-[9px] text-muted-foreground font-medium group-hover:text-primary transition-colors">ID: {client.id.substring(0, 8)}...</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                          <Mail className="h-3 w-3 text-primary/40" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                          <Phone className="h-3 w-3 text-primary/40" />
                          {client.phone}
                        </div>
                      )}
                      {!client.email && !client.phone && <span className="text-muted-foreground/40 text-[10px]">—</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground/80 text-[11px] max-w-[200px] truncate" title={client.address || ''}>
                      {client.address || <span className="text-muted-foreground/40 italic">Sin dirección</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.isActive ? 'success' : 'destructive'} className="uppercase text-[9px] tracking-wide px-2 py-0.5 border border-current/20">
                      {client.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg"
                        onClick={() => handleEditClick(client)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4 border border-border">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      No se encontraron clientes
                    </h3>
                    <p className="text-muted-foreground max-w-sm mb-6 font-medium text-xs">
                      No hay clientes que coincidan con tu búsqueda o los filtros seleccionados.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>

        {/* Mobile / Small Screens Card View */}
        <div className="lg:hidden divide-y divide-border">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-medium tracking-tight uppercase">Cargando clientes...</span>
            </div>
          ) : clients.length > 0 ? (
            clients.map((client) => (
              <div key={client.id} className="p-4 bg-card active:bg-muted/50 transition-colors relative">
                {/* Left accent border based on status */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  client.isActive ? "bg-emerald-500/50" : "bg-rose-500/50"
                )} />

                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 h-4 border-muted-foreground/20">
                        {client.documentType || 'DOC'}
                      </Badge>
                      <span className="font-mono text-[9px] text-muted-foreground font-bold">{client.documentNumber || 'S/N'}</span>
                      <Badge variant={client.isActive ? 'success' : 'secondary'} className="uppercase text-[8px] font-black px-1.5 py-0 h-4 ml-auto lg:hidden">
                        {client.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-1">{getClientDisplayName(client)}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground bg-muted/30 rounded-lg"
                      onClick={() => handleEditClick(client)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive bg-muted/30 rounded-lg"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      <Mail className="h-3 w-3 text-primary/50" /> Contacto
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-foreground truncate">{client.email || '—'}</p>
                      <p className="text-[11px] font-bold text-foreground">{client.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      <MapPin className="h-3 w-3 text-primary/50" /> Dirección
                    </div>
                    <p className="text-[11px] font-bold text-foreground line-clamp-2 leading-relaxed">
                      {client.address || <span className="opacity-40 font-medium">S/D</span>}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Users className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron clientes</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 border-t border-border bg-card">
          <div className="text-[11px] text-muted-foreground font-medium w-full md:w-auto text-center md:text-left">
            Mostrando <span className="font-bold text-foreground">{clients.length > 0 ? ((currentPage - 1) * pageLimit) + 1 : 0}-{Math.min(currentPage * pageLimit, totalClients)}</span> de <span className="font-bold text-foreground">{totalClients}</span> clientes registrados
          </div>
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
              disabled={!hasPrevPage || isLoading}
              onClick={handlePrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider min-w-[80px] text-center">
              Página {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-lg transition-all active:scale-95"
              disabled={!hasNextPage || isLoading}
              onClick={handleNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
