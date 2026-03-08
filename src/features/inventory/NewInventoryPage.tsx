import { BulkUploadCard } from '@/components/shared/BulkUploadCard';
import ProductForm from './components/ProductForm';
import { Button } from '@/components/ui';
import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { productService } from '@/services/product.service';
import { BulkUploadReviewModal, type FileAnalysis, type AnalyzedRow } from './components/BulkUploadReviewModal';
import { BulkUploadSuccessModal } from './components/BulkUploadSuccessModal';

export default function NewInventoryPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [uploadStats, setUploadStats] = useState({ processed: 0, success: 0, failed: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
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

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rows: AnalyzedRow[] = jsonData.map((row: any, index: number) => {
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

    setIsUploading(true);
    setUploadErrors([]);

    try {
      const response = await productService.bulkUpload(fileAnalysis.originalFile);

      if (response.success && response.data.details) {
        const { processed, errors } = response.data.details;
        const failed = errors.length;
        // Interpret 'processed' as the count of successful validations/insertions from backend
        // Total rows processed is success + failure
        const success = processed;
        const totalProcessed = success + failed;

        if (totalProcessed > 0 || success > 0) {
          setUploadStats({
            processed: totalProcessed,
            success,
            failed
          });
          setUploadErrors(errors);
          setIsModalOpen(false); // Close review modal
          setIsSuccessModalOpen(true); // Open success modal
        } else {
          toast.error(response.message || 'Error al procesar el archivo');
        }
      } else {
        toast.error(response.message || 'Error al procesar el archivo');
      }
    } catch (error: any) {
      let errorMessage = 'Error al subir el archivo. Por favor, intenta de nuevo.';

      if (error.response?.data) {
        const errorData = error.response.data;
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
    // CSV content matching the template
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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-2">
        <Link to="/inventory">
          <Button variant="outline" className="h-9 w-9 p-0 flex items-center justify-center border-border bg-card shadow-sm hover:bg-muted transition-all active:scale-90 rounded-lg shrink-0">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight uppercase">Alta de Inventario</h2>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Seleccione el método de ingreso para actualizar el catálogo de productos.</p>
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
            onUpload={async (file) => handleFileAnalysis(file)}
            onDownloadTemplate={handleDownloadTemplate}
          />
        </div>

        {/* Right Column: Manual Entry Form */}
        <div>
          <ProductForm />
        </div>

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
        onNavigate={() => navigate('/inventory')}
        stats={uploadStats}
        errors={uploadErrors}
      />
    </div>
  );
}
