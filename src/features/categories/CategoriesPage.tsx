import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CategoryEditModal } from './components/CategoryEditModal';
import { CategoryFilterPanel, type FilterValues } from './components/CategoryFilterPanel';
import { categoryService, type Category } from '@/services/category.service';
import { alerts } from '@/utils/alerts';
import { CategoriesHeader } from './components/CategoriesHeader';
import { CategoriesFilterBar } from './components/CategoriesFilterBar';
import { CategoriesTable } from './components/CategoriesTable';
import { CategoriesMobileList } from './components/CategoriesMobileList';
import { CategoriesPagination } from './components/CategoriesPagination';



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
  const [sortBy, setSortBy] = useState<string>('');
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
      <CategoriesHeader />

      <CategoriesFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onOpenFilters={() => setIsFilterPanelOpen(true)}
      />

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <CategoriesTable
          categories={filteredCategories}
          isLoading={isLoading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={handleEditClick}
          onDelete={handleDeleteCategory}
        />

        <CategoriesMobileList
          categories={filteredCategories}
          isLoading={isLoading}
          onEdit={handleEditClick}
          onDelete={handleDeleteCategory}
        />

        <CategoriesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCategories={totalCategories}
          pageLimit={pageLimit}
          categoriesCount={filteredCategories.length}
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
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
