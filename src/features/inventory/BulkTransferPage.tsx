import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransferPreviewModal } from './components/TransferPreviewModal';
import { BulkTransferHeader } from './components/BulkTransferHeader';
import { BulkTransferTabs } from './components/BulkTransferTabs';
import { BulkTransferConfig } from './components/BulkTransferConfig';
import { BulkTransferTotalMode } from './components/BulkTransferTotalMode';
import { BulkTransferSelectionMode } from './components/BulkTransferSelectionMode';
import { useBranchOfficesSelect } from './hooks/useBranchOfficeQueries';
import { useBranchProductsQuery, useCreateBulkTransfer, useCreateTotalTransfer } from './hooks/useTransferQueries';
import { useTransferForm } from './hooks/useTransferForm';
import { alerts } from '@/utils/alerts';
import { toast } from 'sonner';

export default function BulkTransferPage() {
    const navigate = useNavigate();
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // Form and Logic Hook
    const {
        activeTab,
        setActiveTab,
        originBranchId,
        setOriginBranchId,
        destinationBranchId,
        setDestinationBranchId,
        referenceCode,
        setReferenceCode,
        notes,
        setNotes,
        selectedItems,
        productSearch,
        setProductSearch,
        debouncedSearch,
        currentPage,
        setCurrentPage,
        pendingQuantities,
        handleAddItem,
        handleRemoveItem,
        handleClearSelection,
        handleUpdateQuantity,
        handleUpdateItemNote,
        handlePendingQuantityChange,
    } = useTransferForm();

    // Queries and Mutations
    const { data: branches = [] } = useBranchOfficesSelect();
    const { data: productsData, isLoading: isSearching } = useBranchProductsQuery(originBranchId, {
        page: currentPage,
        limit: 10,
        search: debouncedSearch || undefined
    });

    const createBulkMutation = useCreateBulkTransfer();
    const createTotalMutation = useCreateTotalTransfer();

    const products = productsData?.data || [];
    const pagination = productsData?.pagination || { total: 0, totalPages: 1 };

    const handleConfirmBulkTransfer = async () => {
        if (!originBranchId || !destinationBranchId) {
            toast.error('Debes seleccionar las sucursales de origen y destino');
            return;
        }

        if (originBranchId === destinationBranchId) {
            toast.error('La sucursal de origen y destino no pueden ser la misma');
            return;
        }

        const itemsToMove = selectedItems.filter(item => item.quantity > 0);
        if (itemsToMove.length === 0) {
            toast.error('Debes especificar la cantidad para al menos un producto');
            return;
        }

        await createBulkMutation.mutateAsync({
            originBranchId,
            destinationBranchId,
            referenceCode,
            items: itemsToMove.map(item => ({
                productId: item.product.id,
                quantityMoved: item.quantity,
                notes: item.notes.trim() || undefined
            }))
        });

        setIsPreviewModalOpen(false);
        navigate('/inventory/movements');
    };

    const handleConfirmTotalTransfer = async () => {
        if (!originBranchId || !destinationBranchId) {
            toast.error('Debes seleccionar las sucursales de origen y destino');
            return;
        }

        if (originBranchId === destinationBranchId) {
            toast.error('La sucursal de origen y destino no pueden ser la misma');
            return;
        }

        await createTotalMutation.mutateAsync({
            originBranchId,
            destinationBranchId,
            referenceCode,
            notes: notes.trim() || undefined
        });

        navigate('/inventory/movements');
    };

    const handleDiscardChanges = async () => {
        if (selectedItems.length > 0) {
            const isConfirmed = await alerts.confirm({
                title: '¿Descartar cambios?',
                text: 'Perderás todos los productos seleccionados y la configuración actual.',
                confirmButtonText: 'Sí, descartar',
                confirmButtonColor: '#ef4444'
            });

            if (!isConfirmed) return;
        }
        navigate('/inventory/movements');
    };

    const getBranchName = (id: string) => {
        return branches.find((b: { id: string }) => b.id === id)?.name || 'Seleccionar sucursal';
    };

    const isLoading = createBulkMutation.isPending || createTotalMutation.isPending;

    return (
        <div className="min-h-full bg-background">
            <BulkTransferHeader onDiscardChanges={handleDiscardChanges} />

            <div className="max-w-7xl mx-auto md:px-6 py-4 md:py-6 space-y-4 md:space-y-6 pb-32 md:pb-8">
                <BulkTransferTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <BulkTransferConfig
                    branches={branches}
                    originBranchId={originBranchId}
                    onOriginBranchChange={setOriginBranchId}
                    destinationBranchId={destinationBranchId}
                    onDestinationBranchChange={setDestinationBranchId}
                    referenceCode={referenceCode}
                    onReferenceCodeChange={setReferenceCode}
                    notes={notes}
                    onNotesChange={setNotes}
                    activeTab={activeTab}
                />

                {activeTab === 'total' && (
                    <BulkTransferTotalMode
                        originBranchId={originBranchId}
                        destinationBranchId={destinationBranchId}
                        isLoading={isLoading}
                        onDiscardChanges={handleDiscardChanges}
                        onConfirmTotalTransfer={handleConfirmTotalTransfer}
                    />
                )}

                {activeTab === 'selection' && (
                    <BulkTransferSelectionMode
                        totalProducts={pagination.total}
                        originBranchName={getBranchName(originBranchId)}
                        productSearch={productSearch}
                        isSearching={isSearching}
                        onProductSearchChange={setProductSearch}
                        products={products}
                        selectedItems={selectedItems}
                        pendingQuantities={pendingQuantities}
                        onPendingQuantityChange={handlePendingQuantityChange}
                        onUpdateQuantity={handleUpdateQuantity}
                        onUpdateItemNote={handleUpdateItemNote}
                        onAddItem={handleAddItem}
                        onRemoveItem={handleRemoveItem}
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={setCurrentPage}
                        onClearSelection={handleClearSelection}
                        onDiscardChanges={handleDiscardChanges}
                        isLoading={isLoading}
                        originBranchId={originBranchId}
                        destinationBranchId={destinationBranchId}
                        onConfirm={() => setIsPreviewModalOpen(true)}
                    />
                )}
            </div>

            <TransferPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                onConfirm={handleConfirmBulkTransfer}
                isLoading={isLoading}
                originBranchName={getBranchName(originBranchId)}
                destinationBranchName={getBranchName(destinationBranchId)}
                items={selectedItems.filter(i => i.quantity > 0)}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
            />
        </div>
    );
}
