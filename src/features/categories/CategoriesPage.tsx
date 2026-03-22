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
  Loader2
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
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CategoryEditModal } from './components/CategoryEditModal';
import { CategoryFilterPanel, type FilterValues } from './components/CategoryFilterPanel';
import { categoryService, type Category } from '@/services/category.service';
import { alerts } from '@/utils/alerts';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
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
  const [totalCategories, setTotalCategories] = useState(0);
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

  const fetchCategories = async () => {
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

      const response = await categoryService.getAll(params);

      setCategories(response.data.data || []);
      setTotalPages(response.data.pagination.totalPages);
      setTotalCategories(response.data.pagination.total);
      setHasNextPage(response.data.pagination.hasNextPage);
      setHasPrevPage(response.data.pagination.hasPrevPage);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(error.response?.data?.message || 'Error al cargar las categorías');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, debouncedSearchTerm, statusFilter, advancedFilters, sortBy, sortOrder]);

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleSaveCategory = async () => {
    setIsEditModalOpen(false);
    await fetchCategories(); // Refresh list after save
  };

  const handleDeleteCategory = async (id: string) => {
    const isConfirmed = await alerts.confirm({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar esta categoría? Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444' // Destructive color from tokens
    });

    if (!isConfirmed) return;

    try {
      await categoryService.delete(id);
      toast.success('Categoría eliminada exitosamente');
      await fetchCategories(); // Refresh list
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar la categoría');
    }
  };

  const handleApplyFilters = (filters: FilterValues) => {
    setAdvancedFilters(filters);
    setCurrentPage(1); // Reset to first page when applying filters
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

  // We now use server-side filtering, so we don't need to filter on the client
  const filteredCategories = categories; // Alias for compatibility with existing render code

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
          <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight uppercase">Listado de Categorías</h2>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">Organice su inventario con categorías personalizadas.</p>
        </div>
        <Link to="/categories/new" className="w-full sm:w-auto">
          <Button className="h-10 sm:h-9 w-full sm:w-auto px-4 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center justify-center gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Nueva Categoría
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Buscar categorías..."
            className="pl-9 h-10 bg-muted/30 border-border focus-visible:bg-background text-xs rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full sm:w-auto gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none justify-between h-10 text-[10px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted min-w-[140px] sm:min-w-[160px] rounded-xl transition-all">
                {getStatusLabel()}
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] sm:w-[180px] bg-card border-border shadow-xl rounded-xl p-1 overflow-hidden">
              <DropdownMenuItem className="text-[11px] font-bold uppercase tracking-tight py-2.5 rounded-lg cursor-pointer" onClick={() => setStatusFilter('all')}>
                Todos los estados
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] font-bold uppercase tracking-tight py-2.5 rounded-lg cursor-pointer text-emerald-600 dark:text-emerald-400" onClick={() => setStatusFilter('active')}>
                Solo Activos
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] font-bold uppercase tracking-tight py-2.5 rounded-lg cursor-pointer text-rose-600 dark:text-rose-400" onClick={() => setStatusFilter('inactive')}>
                Solo Inactivos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
  
          <Button
            variant="outline"
            className="flex-1 sm:flex-none h-10 text-[10px] font-bold uppercase tracking-wider text-foreground border-border bg-card hover:bg-muted gap-2 rounded-xl transition-all"
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
        <div className="hidden md:block">
          <Table>
          <TableHeader className="bg-muted/30 border-b border-border">
            <TableRow className="hover:bg-muted/40 border-none h-10">
              <SortableTableHead 
                field="code" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder} 
                onSort={handleSort} 
                className="w-[150px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
              >
                Código
              </SortableTableHead>
              <SortableTableHead 
                field="name" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder} 
                onSort={handleSort} 
                className="w-[300px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
              >
                Nombre de la Categoría
              </SortableTableHead>
              <SortableTableHead 
                field="description" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder} 
                onSort={handleSort} 
                className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
              >
                Descripción
              </SortableTableHead>
              <SortableTableHead 
                field="createdAt" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder} 
                onSort={handleSort} 
                className="w-[130px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
              >
                Fecha Creación
              </SortableTableHead>
              <SortableTableHead 
                field="isActive" 
                currentSortBy={sortBy} 
                currentSortOrder={sortOrder} 
                onSort={handleSort} 
                className="w-[90px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
              >
                Estado
              </SortableTableHead>
              <TableHead className="w-[90px] text-right font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Cargando categorías...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-muted/30 border-border transition-colors h-11">
                  <TableCell className="font-bold text-foreground text-[11px]">{category.code}</TableCell>
                  <TableCell className="font-bold text-foreground text-xs">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground/80 text-[11px] max-w-[300px] truncate">{category.description || '-'}</TableCell>
                  <TableCell className="text-muted-foreground/80 text-[11px]">
                    {category.createdAt}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'success' : 'destructive'} className="uppercase text-[9px] tracking-wide px-2 py-0.5 border border-current/20">
                      {category.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleEditClick(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteCategory(category.id)}
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
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      No se encontraron categorías
                    </h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                      No hay categorías que coincidan con tu búsqueda o los filtros seleccionados.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-medium tracking-tight uppercase">Cargando categorías...</span>
            </div>
          ) : filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div key={category.id} className="p-4 bg-card active:bg-muted/10 transition-colors">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-lg uppercase tracking-tight">
                        {category.code || 'S/C'}
                      </span>
                      <Badge variant={category.isActive ? 'success' : 'secondary'} className="uppercase text-[8px] font-black px-1.5 py-0 h-4 border border-current/20">
                        {category.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <h3 className="text-[13px] font-black text-foreground leading-tight uppercase tracking-tight">{category.name}</h3>
                    {category.description && (
                      <p className="text-[11px] text-muted-foreground font-medium mt-1.5 line-clamp-3 leading-relaxed">{category.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"
                      onClick={() => handleEditClick(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-tight">
                    <span className="text-muted-foreground/60">Fecha Creación</span>
                    <span className="text-foreground/80 tabular-nums bg-muted/30 px-2 py-0.5 rounded-lg border border-border/50">{category.createdAt}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Search className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron categorías</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 gap-4 border-t border-border bg-card">
          <div className="text-[10px] sm:text-[11px] text-muted-foreground font-bold uppercase tracking-tight w-full sm:w-auto text-center sm:text-left">
            Mostrando <span className="font-black text-foreground bg-muted px-1.5 py-0.5 rounded-lg">{filteredCategories.length > 0 ? ((currentPage - 1) * pageLimit) + 1 : 0}-{Math.min(currentPage * pageLimit, totalCategories)}</span> de <span className="font-black text-foreground bg-muted px-1.5 py-0.5 rounded-lg">{totalCategories}</span> categorías
          </div>
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-xl transition-all active:scale-95 shadow-sm"
              disabled={!hasPrevPage || isLoading}
              onClick={handlePrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-[10px] font-black text-foreground uppercase tracking-widest min-w-[100px] text-center bg-muted/20 px-3 py-1.5 rounded-xl border border-border/40">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 disabled:opacity-30 text-muted-foreground border-border bg-card hover:bg-muted rounded-xl transition-all active:scale-95 shadow-sm"
              disabled={!hasNextPage || isLoading}
              onClick={handleNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CategoryFilterPanel
        open={isFilterPanelOpen}
        onOpenChange={setIsFilterPanelOpen}
        onApplyFilters={handleApplyFilters}
      />

      <CategoryEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        category={selectedCategory}
        onSave={handleSaveCategory}
      />
    </div>
  );
}

