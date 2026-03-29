import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { branchOfficeService, type BranchOfficeSelectOption } from '@/services/branch-office.service';
import { type Product } from '@/services/product.service';
import { branchOfficeProductService } from '@/services/branch-office-product.service';
import { branchMovementService } from '@/services/branch-movement.service';
import { TransferPreviewModal } from './components/TransferPreviewModal';
import { toast } from 'sonner';
import { alerts } from '@/utils/alerts';
import { BulkTransferHeader } from './components/BulkTransferHeader';
import { BulkTransferTabs } from './components/BulkTransferTabs';
import { BulkTransferConfig } from './components/BulkTransferConfig';
import { BulkTransferTotalMode } from './components/BulkTransferTotalMode';
import { BulkTransferSelectionMode } from './components/BulkTransferSelectionMode';

export default function BulkTransferPage() {
    const navigate = useNavigate();
    const [branches, setBranches] = useState<BranchOfficeSelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('total');

    // Form State
    const [originBranchId, setOriginBranchId] = useState<string>('');
    const [destinationBranchId, setDestinationBranchId] = useState<string>('');
    const [referenceCode, setReferenceCode] = useState(`TOTAL-MOVE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    const [notes, setNotes] = useState('');

    // Selection Mode State
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedItems, setSelectedItems] = useState<Array<{
        product: Product;
        quantity: number;
        notes: string;
    }>>([]);
    const [productSearch, setProductSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [pendingQuantities, setPendingQuantities] = useState<Record<string, number>>({});
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState(productSearch);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(productSearch);
        }, 300);
        return () => clearTimeout(handler);
    }, [productSearch]);

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (activeTab === 'selection' && originBranchId) {
            fetchProducts();
        } else if (activeTab === 'selection' && !originBranchId) {
            setProducts([]);
            setTotalProducts(0);
        }
    }, [activeTab, debouncedSearch, currentPage, originBranchId]);

    const fetchBranches = async () => {
        try {
            const response = await branchOfficeService.getForSelect();
            if (response.success) {
                setBranches(response.data);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            toast.error('Error al cargar las sucursales');
        }
    };

    const fetchProducts = async () => {
        if (!originBranchId) return;

        try {
            setIsSearching(true);
            const response = await branchOfficeProductService.getForSelect({
                branchOfficeId: originBranchId,
                page: currentPage,
                limit: 10,
                search: debouncedSearch || undefined
            });

            if (response.success) {
                setProducts(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalProducts(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Error al cargar catálogo de productos');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddItem = (product: Product) => {
        if (selectedItems.some(item => item.product.id === product.id)) {
            toast.info('El producto ya está en la lista');
            return;
        }
        setSelectedItems(prev => [...prev, { product, quantity: 0, notes: '' }]);
    };

    const handleRemoveItem = async (productId: string) => {
        const isConfirmed = await alerts.confirm({
            title: '¿Quitar producto?',
            text: 'El producto se eliminará de la lista de selección actual.',
            confirmButtonText: 'Sí, quitar',
            confirmButtonColor: '#ef4444'
        });

        if (isConfirmed) {
            setSelectedItems(prev => prev.filter(item => item.product.id !== productId));
        }
    };

    const handleClearSelection = async () => {
        const isConfirmed = await alerts.confirm({
            title: '¿Limpiar selección?',
            text: 'Se eliminarán todos los productos de la lista actual.',
            confirmButtonText: 'Sí, limpiar todo',
            confirmButtonColor: '#ef4444'
        });

        if (isConfirmed) {
            setSelectedItems([]);
        }
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

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        setSelectedItems(prev => prev.map(item =>
            item.product.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ));
    };

    const handleUpdateItemNote = (productId: string, notes: string) => {
        setSelectedItems(prev => prev.map(item =>
            item.product.id === productId ? { ...item, notes } : item
        ));
    };

    const handlePendingQuantityChange = (productId: string, quantity: number) => {
        setPendingQuantities(prev => ({ ...prev, [productId]: quantity }));
    };

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

        try {
            setIsLoading(true);
            const response = await branchMovementService.createBulk({
                originBranchId,
                destinationBranchId,
                referenceCode,
                items: itemsToMove.map(item => ({
                    productId: item.product.id,
                    quantityMoved: item.quantity,
                    notes: item.notes.trim() || undefined
                }))
            });

            if (response.success) {
                toast.success('Traslado en bloque iniciado correctamente');
                setIsPreviewModalOpen(false);
                navigate('/inventory/movements');
            } else {
                toast.error(response.message || 'Error al procesar el traslado');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error inesperado al procesar el traslado');
        } finally {
            setIsLoading(false);
        }
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

        try {
            setIsLoading(true);
            const response = await branchMovementService.transferAll({
                originBranchId,
                destinationBranchId,
                referenceCode,
                notes: notes.trim() || undefined
            });

            if (response.success) {
                toast.success('Traslado total iniciado correctamente');
                navigate('/inventory/movements');
            } else {
                toast.error(response.message || 'Error al procesar el traslado');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error inesperado al procesar el traslado');
        } finally {
            setIsLoading(false);
        }
    };

    const getBranchName = (id: string) => {
        return branches.find(b => b.id === id)?.name || 'Seleccionar sucursal';
    };

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
                        totalProducts={totalProducts}
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
                        totalPages={totalPages}
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
