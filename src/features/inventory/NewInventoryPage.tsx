import { BulkUploadCard } from '@/components/shared/BulkUploadCard';
import ProductForm from './components/ProductForm';
import { useNavigate } from 'react-router-dom';
import { useBulkUpload } from './hooks/useBulkUpload';
import { BulkUploadReviewModal } from './components/BulkUploadReviewModal';
import { BulkUploadSuccessModal } from './components/BulkUploadSuccessModal';
import { NewInventoryHeader } from './components/NewInventoryHeader';

export default function NewInventoryPage() {
  const navigate = useNavigate();
  const {
    isModalOpen,
    setIsModalOpen,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    uploadStats,
    uploadErrors,
    fileAnalysis,
    isUploading,
    handleFileAnalysis,
    handleConfirmUpload,
    handleDownloadTemplate
  } = useBulkUpload();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <NewInventoryHeader />

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
