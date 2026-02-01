import { BulkUploadCard } from '@/components/shared/BulkUploadCard';
import CategoryForm from './components/CategoryForm';

import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/categories">
          <Button variant="outline" className="h-10 w-10 p-0 flex items-center justify-center border-slate-200 shadow-sm transition-transform active:scale-95">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Categorías</h2>
          <p className="text-sm text-slate-500 mt-1">Administre y organice las categorías de productos del sistema.</p>
        </div>
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
