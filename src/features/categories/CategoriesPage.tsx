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
  }, [currentPage, debouncedSearchTerm, statusFilter]);

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
    console.log('Applying filters:', filters);
    // TODO: Implement server-side filtering when backend supports it
    setIsFilterPanelOpen(false);
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
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Listado de Categorías</h2>
          <p className="text-sm text-slate-500 mt-1">Gestione su inventario organizando productos por categorías.</p>
        </div>
        <Link to="/categories/new">
          <Button className="flex items-center gap-2 shadow-lg shadow-sky-500/20">
            <Plus className="h-4 w-4" /> Nueva Categoría
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o código..."
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full sm:w-auto gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none justify-between text-secondary border-slate-200 font-normal hover:bg-accent/10 min-w-[160px]">
                {getStatusLabel()}
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                Todos los estados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                Activo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                Inactivo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            className="flex-1 sm:flex-none text-secondary border-slate-200 font-normal gap-2 hover:bg-accent/10"
            onClick={() => setIsFilterPanelOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Más Filtros
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-700">
            <TableRow className="hover:bg-slate-700/90 border-slate-600">
              <TableHead className="w-[180px] font-bold text-xs uppercase tracking-wider text-slate-100">Código</TableHead>
              <TableHead className="w-[350px] font-bold text-xs uppercase tracking-wider text-slate-100">Nombre de la Categoría</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-100">Descripción</TableHead>
              <TableHead className="w-[140px] font-bold text-xs uppercase tracking-wider text-slate-100">Fecha Creación</TableHead>
              <TableHead className="w-[100px] font-bold text-xs uppercase tracking-wider text-slate-100">Estado</TableHead>
              <TableHead className="w-[100px] text-right font-bold text-xs uppercase tracking-wider text-slate-100">Acciones</TableHead>
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
                <TableRow key={category.id} className="hover:bg-accent/10 border-slate-100 transition-colors">
                  <TableCell className="font-semibold text-secondary">{category.code}</TableCell>
                  <TableCell className="font-bold text-secondary">{category.name}</TableCell>
                  <TableCell className="text-slate-500 max-w-[300px] truncate">{category.description || '-'}</TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {category.createdAt}
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'success' : 'destructive'} className="uppercase text-[10px] tracking-wide px-2.5 py-1">
                      {category.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-primary hover:bg-accent/20"
                        onClick={() => handleEditClick(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-destructive hover:bg-destructive/10"
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
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <Search className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                      No se encontraron categorías
                    </h3>
                    <p className="text-slate-500 max-w-sm mb-6">
                      No hay categorías que coincidan con tu búsqueda o los filtros seleccionados.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                      className="border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            Mostrando <span className="font-semibold text-secondary">{filteredCategories.length > 0 ? ((currentPage - 1) * pageLimit) + 1 : 0}-{Math.min(currentPage * pageLimit, totalCategories)}</span> de <span className="font-semibold text-secondary">{totalCategories}</span> categorías
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 disabled:opacity-50 text-slate-500 border-slate-200"
              disabled={!hasPrevPage || isLoading}
              onClick={handlePrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-slate-600 min-w-[80px] text-center">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 border-slate-200 hover:bg-accent/10 hover:text-secondary disabled:opacity-50"
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

