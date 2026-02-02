import { BulkUploadCard } from '@/components/shared/BulkUploadCard';
import ProductForm from './components/ProductForm';
import { Button } from '@/components/ui';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewInventoryPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <Link to="/inventory/products">
          <Button variant="outline" className="h-10 w-10 p-0 flex items-center justify-center border-slate-200 shadow-sm transition-transform active:scale-95">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Alta de Inventario</h2>
          <p className="text-sm text-slate-500 mt-1">Seleccione el método de ingreso para actualizar el catálogo de productos.</p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left Column: Bulk Upload */}
        <div className="h-full">
          <BulkUploadCard
            title="Carga Masiva"
            description="Ideal para grandes volúmenes de datos."
            dragDropText="Cargar archivo Excel (.xlsx, .csv)"
          />
        </div>

        {/* Right Column: Manual Entry Form */}
        <div>
          <ProductForm />
        </div>

      </div>
    </div>
  );
}
