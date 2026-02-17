import { BulkUploadCard } from '@/components/shared/BulkUploadCard';
import CategoryForm from './components/CategoryForm';
import { categoryService } from '@/services/category.service';
import { BulkUploadReviewModal } from './components/BulkUploadReviewModal';
import type { FileAnalysis, AnalyzedRow } from './components/BulkUploadReviewModal';
import { BulkUploadSuccessModal } from './components/BulkUploadSuccessModal';
import { toast } from 'sonner';
import { useState } from 'react';
import * as XLSX from 'xlsx';

import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NewCategoryPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [uploadStats, setUploadStats] = useState({ processed: 0, success: 0, failed: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis>({
    totalRows: 0,
    validRows: 0,
    errorRows: 0,
    rows: [],
    originalFile: null
  });

  const handleFileAnalysis = async (file: File) => {
    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const rows: AnalyzedRow[] = jsonData.map((row: any, index: number) => {
            const errors: string[] = [];

            if (!row.CodigoCategoria) errors.push('Código obligatorio');
            if (!row.NombreCategoria) errors.push('Nombre obligatorio');

            return {
              row: index + 1,
              data: row,
              isValid: errors.length === 0,
              errors
            };
          });

          const validRows = rows.filter(r => r.isValid).length;
          const errorRows = rows.filter(r => !r.isValid).length;

          setFileAnalysis({
            totalRows: rows.length,
            validRows,
            errorRows,
            rows,
            originalFile: file
          });

          setIsModalOpen(true);
        } catch (error) {
          console.error(error);
          toast.error('Error al analizar el archivo. Verifique el formato.');
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(error);
      toast.error('Error al leer el archivo.');
    }
  };

  const handleConfirmUpload = async () => {
    if (!fileAnalysis.originalFile) return;

    setIsUploading(true);
    try {
      const response = await categoryService.bulkUpload(fileAnalysis.originalFile);

      if (response.success && response.data.details) {
        const { processed, errors } = response.data.details;
        const failed = errors.length;
        const success = processed - failed;

        // Always show success modal if at least one record was processed or if it was a total success
        if (processed > 0) {
          setUploadStats({
            processed,
            success,
            failed
          });
          setIsModalOpen(false); // Close review modal
          setIsSuccessModalOpen(true); // Open success modal
        } else {
          toast.error(response.message || 'Error al procesar el archivo');
        }
      } else {
        toast.error(response.message || 'Error al procesar el archivo');
      }
    } catch (error: any) {
      // Extract error message from different possible structures
      let errorMessage = 'Error al subir el archivo. Por favor, intenta de nuevo.';

      if (error.response?.data) {
        const errorData = error.response.data;
        // Check if errors field exists (string format from 500 errors)
        if (errorData.errors && typeof errorData.errors === 'string') {
          errorMessage = errorData.errors;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }

      toast.error(errorMessage, {
        duration: 5000
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const csvContent = 'NombreCategoria,CodigoCategoria,Descripcion\n' +
      'Electrónica,CAT-ELEC,Productos electrónicos y tecnología\n' +
      'Ropa,CAT-ROPA,Prendas de vestir y accesorios\n' +
      'Alimentos,CAT-ALIM,Productos alimenticios y bebidas';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_categorias.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Plantilla descargada exitosamente');
  };

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
          onUpload={async (file) => handleFileAnalysis(file)} // Intercept upload
          onDownloadTemplate={handleDownloadTemplate}
        />
        <CategoryForm />
      </div>

      <BulkUploadReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmUpload}
        isUploading={isUploading}
        fileAnalysis={fileAnalysis}
      />

      <BulkUploadSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onNavigate={() => navigate('/categories')}
        stats={uploadStats}
      />
    </div>
  );
}
