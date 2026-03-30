import { useState, useEffect } from 'react';
import { type Product } from '@/services/product.service';
import { alerts } from '@/utils/alerts';
import { toast } from 'sonner';

export interface SelectedItem {
    product: Product;
    quantity: number;
    notes: string;
}

export function useTransferForm() {
    const [activeTab, setActiveTab] = useState('total');
    const [originBranchId, setOriginBranchId] = useState<string>('');
    const [destinationBranchId, setDestinationBranchId] = useState<string>('');
    const [referenceCode, setReferenceCode] = useState(() => `TOTAL-MOVE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    const [notes, setNotes] = useState('');

    // Selection Mode State
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pendingQuantities, setPendingQuantities] = useState<Record<string, number>>({});

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(productSearch);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [productSearch]);

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
        if (selectedItems.length === 0) return;
        
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

    const resetForm = () => {
        setOriginBranchId('');
        setDestinationBranchId('');
        setReferenceCode(`TOTAL-MOVE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
        setNotes('');
        setSelectedItems([]);
        setProductSearch('');
        setCurrentPage(1);
        setPendingQuantities({});
    };

    return {
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
        setSelectedItems,
        productSearch,
        setProductSearch,
        debouncedSearch,
        currentPage,
        setCurrentPage,
        pendingQuantities,
        setPendingQuantities,
        handleAddItem,
        handleRemoveItem,
        handleClearSelection,
        handleUpdateQuantity,
        handleUpdateItemNote,
        handlePendingQuantityChange,
        resetForm,
    };
}
