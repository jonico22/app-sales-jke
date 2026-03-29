import { useState } from 'react';
import { CategoryEditModal } from './components/CategoryEditModal';
import { CategoryFilterPanel, type FilterValues } from './components/CategoryFilterPanel';
import { type Category } from '@/services/category.service';
import { alerts } from '@/utils/alerts';
import { CategoriesHeader } from './components/CategoriesHeader';
import { CategoriesFilterBar } from './components/CategoriesFilterBar';
import { CategoriesTable } from './components/CategoriesTable';
import { CategoriesMobileList } from './components/CategoriesMobileList';
import { CategoriesPagination } from './components/CategoriesPagination';
import { useCategoriesQuery, useDeleteCategoryMutation } from './hooks/useCategoryQueries';
import { useCategoriesFilters } from './hooks/useCategoriesFilters';

export default function CategoriesPage() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    sortBy,
    sortOrder,
    handleSort,
    setAdvancedFilters,
    queryParams,
  } = useCategoriesFilters();

  const { data: response, isLoading } = useCategoriesQuery(queryParams);
  const deleteMutation = useDeleteCategoryMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const categories = response?.data?.data || [];
  const pagination = response?.data?.pagination;

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const isConfirmed = await alerts.confirm({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar esta categoría? Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#ef4444' // Destructive color
    });

    if (isConfirmed) {
      deleteMutation.mutate(id);
    }
  };

  const handleApplyFilters = (filters: FilterValues) => {
    setAdvancedFilters(filters);
    setIsFilterPanelOpen(false);
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination?.hasPrevPage) {
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
          categories={categories}
          isLoading={isLoading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={handleEditClick}
          onDelete={handleDeleteCategory}
        />

        <CategoriesMobileList
          categories={categories}
          isLoading={isLoading}
          onEdit={handleEditClick}
          onDelete={handleDeleteCategory}
        />

        <CategoriesPagination
          currentPage={currentPage}
          totalPages={pagination?.totalPages || 1}
          totalCategories={pagination?.total || 0}
          pageLimit={10}
          categoriesCount={categories.length}
          hasPrevPage={pagination?.hasPrevPage || false}
          hasNextPage={pagination?.hasNextPage || false}
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
        onSave={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
