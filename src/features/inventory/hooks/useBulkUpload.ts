import { useState } from 'react';
import { toast } from 'sonner';
import { useBulkUploadProduct } from './useProductQueries';
import type { FileAnalysis, AnalyzedRow } from '../components/BulkUploadReviewModal';

interface BulkUploadRow {
  NombreProducto?: string;
  CodigoInterno?: string;
  CodigoCategoria?: string;
  PrecioVenta?: number | string;
  PrecioCosto?: number | string;
  StockInicial?: number | string;
  StockMinimo?: number | string;
  [key: string]: string | number | boolean | undefined;
}

export function useBulkUpload() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [uploadStats, setUploadStats] = useState({ processed: 0, success: 0, failed: 0 });
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis>({
    totalRows: 0,
    validRows: 0,
    errorRows: 0,
    rows: [],
    originalFile: null
  });

  const uploadMutation = useBulkUploadProduct();

  const handleFileAnalysis = async (file: File) => {
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<BulkUploadRow>(worksheet);

          const rows: AnalyzedRow[] = jsonData.map((row, index) => {
            const errors: string[] = [];

            if (!row.NombreProducto) errors.push('Nombre obligatorio');
            if (!row.CodigoInterno) errors.push('Código obligatorio');
            if (!row.CodigoCategoria) errors.push('Categoría obligatoria');
            if (!row.PrecioVenta) errors.push('Precio Venta obligatorio');
            if (row.StockInicial === undefined || row.StockInicial === null) errors.push('Stock inicial obligatorio');

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

    try {
      const response = await uploadMutation.mutateAsync(fileAnalysis.originalFile);

      if (response.success && response.data.details) {
        const { processed, errors } = response.data.details;
        const failed = errors.length;
        const success = processed;
        const totalProcessed = success + failed;

        if (totalProcessed > 0 || success > 0) {
          setUploadStats({
            processed: totalProcessed,
            success,
            failed
          });
          setUploadErrors(errors);
          setIsModalOpen(false);
          setIsSuccessModalOpen(true);
        } else {
          toast.error(response.message || 'Error al procesar el archivo');
        }
      } else {
        toast.error(response.message || 'Error al procesar el archivo');
      }
    } catch (error) {
      let errorMessage = 'Error al subir el archivo. Por favor, intenta de nuevo.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { errors?: string; message?: string } } };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          if (errorData.errors && typeof errorData.errors === 'string') {
            errorMessage = errorData.errors;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
      }

      toast.error(errorMessage, {
        duration: 5000
      });
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'NombreProducto,CodigoInterno,CodigoCategoria,PrecioVenta,PrecioCosto,StockInicial,StockMinimo,CodigoBarras(Opcional),Marca(Opcional),Descripcion(Opcional),Color(Opcional),ColorCode(Opcional)\n' +
      'Laptop Gamer HP,LPT-HP-001,CAT-LAPTOPS,3500.00,2800.00,10,2,1234567890123,HP,Laptop con RTX 3060,,\n' +
      'Mouse Inalámbrico,PER-MOU-002,CAT-ACCESORIOS,45.50,25.00,50,10,9876543210987,Logitech,Mouse ergonómico,Azul,#0000FF';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_productos.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Plantilla descargada exitosamente');
  };

  return {
    isModalOpen,
    setIsModalOpen,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    uploadStats,
    uploadErrors,
    fileAnalysis,
    isUploading: uploadMutation.isPending,
    handleFileAnalysis,
    handleConfirmUpload,
    handleDownloadTemplate
  };
}
