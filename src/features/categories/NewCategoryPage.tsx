import { BulkUploadCard } from '@/components/shared/BulkUploadCard';
import CategoryForm from './components/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Categorías</h2>
        <p className="text-sm text-slate-500 mt-1">Administre y organice las categorías de productos del sistema.</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <BulkUploadCard 
          description="Importación rápida de categorias desde archivo." // default title is fine
          dragDropText="Cargar categorías (.xlsx, .csv)"
          downloadText="Descargar plantilla de categorías"
        />
        <CategoryForm />
      </div>
    </div>
  );
}
