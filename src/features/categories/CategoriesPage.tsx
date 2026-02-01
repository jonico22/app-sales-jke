import { useState } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
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
import { CategoryEditModal } from './components/CategoryEditModal';
import { CategoryFilterPanel, type FilterValues } from './components/CategoryFilterPanel';

// Mock Data
const MOCK_CATEGORIES = [
  { id: 1, code: 'CAT-001', name: 'Electrónica', description: 'Dispositivos electrónicos, gadgets y accesorios.', products: 142, status: 'active' },
  { id: 2, code: 'CAT-002', name: 'Hogar y Muebles', description: 'Mobiliario para interiores y decoración de hogar.', products: 85, status: 'active' },
  { id: 3, code: 'CAT-003', name: 'Juguetería', description: 'Juguetes para todas las edades y juegos de mesa.', products: 0, status: 'inactive' },
  { id: 4, code: 'CAT-004', name: 'Ropa y Moda', description: 'Vestimenta, calzado y accesorios de temporada.', products: 320, status: 'active' },
  { id: 5, code: 'CAT-005', name: 'Alimentos', description: 'Productos alimenticios no perecederos y bebidas.', products: 512, status: 'active' },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof MOCK_CATEGORIES[0] | null>(null);

  const handleEditClick = (category: typeof MOCK_CATEGORIES[0]) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveCategory = (data: any) => {
    console.log('Saved data:', data);
    // Here you would typically call an API to update the category
    setIsEditModalOpen(false);
  };

  const handleApplyFilters = (filters: FilterValues) => {
    console.log('Applying filters:', filters);
    // In a real app, you would fetch data or filter MOCK_CATEGORIES based on these values
    setIsFilterPanelOpen(false);
  };

  const filteredCategories = MOCK_CATEGORIES.filter(category => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      category.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = () => {
    switch(statusFilter) {
      case 'active': return 'Activos';
      case 'inactive': return 'Inactivos';
      default: return 'Todos los estados';
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
          <TableHeader className="bg-accent/40">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider text-secondary">Código</TableHead>
              <TableHead className="w-[200px] font-bold text-xs uppercase tracking-wider text-secondary">Nombre de la Categoría</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-secondary">Descripción</TableHead>
              <TableHead className="w-[150px] text-center font-bold text-xs uppercase tracking-wider text-secondary">Productos Asociados</TableHead>
              <TableHead className="w-[100px] font-bold text-xs uppercase tracking-wider text-secondary">Estado</TableHead>
              <TableHead className="w-[100px] text-right font-bold text-xs uppercase tracking-wider text-secondary">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-accent/10 border-slate-100 transition-colors">
                  <TableCell className="font-semibold text-secondary">{category.code}</TableCell>
                  <TableCell className="font-bold text-secondary">{category.name}</TableCell>
                  <TableCell className="text-slate-500 max-w-[300px] truncate">{category.description}</TableCell>
                  <TableCell className="text-center font-semibold text-secondary">{category.products}</TableCell>
                  <TableCell>
                    <Badge variant={category.status === 'active' ? 'success' : 'destructive'} className="uppercase text-[10px] tracking-wide px-2.5 py-1">
                      {category.status === 'active' ? 'Activo' : 'Inactivo'}
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            Mostrando <span className="font-semibold text-secondary">{filteredCategories.length > 0 ? 1 : 0}-{filteredCategories.length}</span> de <span className="font-semibold text-secondary">{MOCK_CATEGORIES.length}</span> categorías
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 disabled:opacity-50 text-slate-500 border-slate-200" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-slate-500 border-slate-200 hover:bg-accent/10 hover:text-secondary">
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
