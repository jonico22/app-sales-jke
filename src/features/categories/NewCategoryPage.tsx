import { BulkUploadCard } from '@/components/shared/BulkUploadCard';
import CategoryForm from './components/CategoryForm';
import { BulkUploadReviewModal } from './components/BulkUploadReviewModal';
import type { FileAnalysis, AnalyzedRow } from './components/BulkUploadReviewModal';
import { BulkUploadSuccessModal } from './components/BulkUploadSuccessModal';
import { toast } from 'sonner';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { PageHeader } from '@/components/shared/PageHeader';

import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBulkUploadMutation } from './hooks/useCategoryQueries';
import { isAxiosError } from 'axios';

interface CategoryExcelRow {
  CodigoCategoria?: string;
  NombreCategoria?: string;
  [key: string]: unknown;
}

export default function NewCategoryPage() {
  const navigate = useNavigate();
  const bulkUploadMutation = useBulkUploadMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [uploadStats, setUploadStats] = useState({ processed: 0, success: 0, failed: 0 });
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
          const jsonData = XLSX.utils.sheet_to_json<CategoryExcelRow>(worksheet);

          const rows: AnalyzedRow[] = jsonData.map((row, index: number) => {
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

    bulkUploadMutation.mutate(fileAnalysis.originalFile, {
      onSuccess: (response) => {
        if (response.success && response.data.details) {
          const { processed } = response.data.details;
          const errors = response.data.details.errors || [];
          const failed = errors.length;
          const success = processed - failed;

          if (processed > 0) {
            setUploadStats({ processed, success, failed });
            setIsModalOpen(false);
            setIsSuccessModalOpen(true);
          } else {
            toast.error(response.message || 'Error al procesar el archivo');
          }
        } else {
          toast.error(response.message || 'Error al procesar el archivo');
        }
      },
      onError: (error: unknown) => {
        let errorMessage = 'Error al subir el archivo. Por favor, intenta de nuevo.';
        if (isAxiosError(error) && error.response?.data) {
          const errorData = error.response.data as { errors?: string | Record<string, unknown>; message?: string };
          if (errorData.errors && typeof errorData.errors === 'string') {
            errorMessage = errorData.errors;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
        toast.error(errorMessage, { duration: 5000 });
      }
    });
  };

  const handleDownloadTemplate = () => {
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
      <PageHeader
        title="Categorías"
        subtitle="Administre y organice las categorías de productos del sistema."
        leading={(
          <Link to="/categories">
            <Button variant="outline" className="h-9 w-9 p-0 flex items-center justify-center border-border shadow-sm transition-transform active:scale-95 text-muted-foreground hover:text-foreground hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <BulkUploadCard
          description="Importación rápida de categorías desde archivo."
          dragDropText="Cargar categorías (.xlsx, .csv)"
          downloadText="Descargar plantilla de categorías"
          onUpload={async (file) => handleFileAnalysis(file)}
          onDownloadTemplate={handleDownloadTemplate}
        />
        <CategoryForm />
      </div>

      <BulkUploadReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmUpload}
        isUploading={bulkUploadMutation.isPending}
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
