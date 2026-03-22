import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    ArrowRightLeft,
    FileText,
    Info,
    Truck,
    LayoutGrid,
    ChevronDown,
    Loader2,
    PackageSearch,
    Trash2
} from 'lucide-react';
import {
    Button,
    Input,
    Textarea,
    Badge,
    Card,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from '@/components/ui';
import { branchOfficeService, type BranchOfficeSelectOption } from '@/services/branch-office.service';
import { type Product } from '@/services/product.service';
import { branchOfficeProductService } from '@/services/branch-office-product.service';
import { branchMovementService } from '@/services/branch-movement.service';
import { TransferPreviewModal } from './components/TransferPreviewModal';
import { toast } from 'sonner';
import { alerts } from '@/utils/alerts';

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
            {/* Hero Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-5 space-y-2 md:space-y-4">
                    <button
                        onClick={handleDiscardChanges}
                        className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors group"
                    >
                        <ChevronLeft className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Volver
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <Truck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-[15px] md:text-2xl font-black text-foreground tracking-tight leading-none">Nueva Operación de Traslado</h1>
                                <p className="text-muted-foreground text-[10px] md:text-sm mt-1 font-medium leading-tight">
                                    Configura los parámetros para el envío de stock entre sucursales.
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 px-2.5 py-1 font-black text-[9px] uppercase tracking-widest w-fit shrink-0">
                            ● Borrador
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto md:px-6 py-4 md:py-6 space-y-4 md:space-y-6 pb-32 md:pb-8">
                {/* Main Tabs */}
                <div className="flex justify-center">
                    <div className="bg-muted/40 p-1 rounded-2xl border border-border/60 flex gap-1">
                        <button
                            onClick={() => setActiveTab('total')}
                            className={`flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${activeTab === 'total'
                                    ? 'bg-card shadow-md text-primary border border-border'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                }`}
                        >
                            <LayoutGrid className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="truncate">Completo</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('selection')}
                            className={`flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${activeTab === 'selection'
                                    ? 'bg-card shadow-md text-primary border border-border'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                }`}
                        >
                            <PackageSearch className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="truncate">Selección</span>
                        </button>
                    </div>
                </div>

                {/* Configuration Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
                    {/* Origin/Destination Selection Card */}
                    <Card className="p-3.5 md:p-6 rounded-2xl border-border shadow-sm bg-card hover:shadow-md transition-shadow">
                        <div className="space-y-4 md:space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                                    <ArrowRightLeft className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-black text-[11px] md:text-xs uppercase tracking-[0.1em] text-foreground">Configuración de Ruta</h2>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Define origen y destino</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                        Origen
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full h-11 md:h-12 px-4 rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider flex items-center justify-between gap-3 transition-all ${originBranchId
                                                        ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10'
                                                        : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/60'
                                                    }`}
                                            >
                                                <span className="truncate">{getBranchName(originBranchId)}</span>
                                                <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[240px] bg-card border-border shadow-2xl rounded-xl p-1.5 max-h-[300px] overflow-y-auto z-50">
                                            {branches.map(branch => (
                                                <DropdownMenuItem
                                                    key={branch.id}
                                                    className="py-2.5 md:py-3 px-3 rounded-lg text-[10px] md:text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-muted data-[highlighted]:bg-primary/5 data-[highlighted]:text-primary"
                                                    onClick={() => setOriginBranchId(branch.id)}
                                                >
                                                    {branch.name}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
                                        Destino
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full h-11 md:h-12 px-4 rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider flex items-center justify-between gap-3 transition-all ${destinationBranchId
                                                        ? 'bg-sky-500/5 border-sky-500/30 text-sky-700 hover:bg-sky-500/10'
                                                        : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/60'
                                                    }`}
                                            >
                                                <span className="truncate">{getBranchName(destinationBranchId)}</span>
                                                <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[240px] bg-card border-border shadow-2xl rounded-xl p-1.5 max-h-[300px] overflow-y-auto z-50">
                                            {branches.map(branch => (
                                                <DropdownMenuItem
                                                    key={branch.id}
                                                    className="py-2.5 md:py-3 px-3 rounded-lg text-[10px] md:text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-muted data-[highlighted]:bg-primary/5 data-[highlighted]:text-primary"
                                                    onClick={() => setDestinationBranchId(branch.id)}
                                                >
                                                    {branch.name}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Identification & Options Card */}
                    <Card className="p-3.5 md:p-6 rounded-2xl border-border shadow-sm bg-card hover:shadow-md transition-shadow">
                        <div className="space-y-4 md:space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                                    <FileText className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-black text-[11px] md:text-xs uppercase tracking-[0.1em] text-foreground">Identificación</h2>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Detalles adicionales</p>
                                </div>
                            </div>

                            <div className="space-y-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Estado del Movimiento</label>
                                    <div className="h-10 md:h-11 flex items-center px-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600">
                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[9px] font-black uppercase tracking-widest py-0.5 h-6">
                                            Borrador
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Código de Referencia</label>
                                    <Input
                                        value={referenceCode}
                                        onChange={(e) => setReferenceCode(e.target.value)}
                                        className="h-10 md:h-11 bg-muted/20 border-border rounded-xl text-[11px] font-black text-primary uppercase tracking-widest focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                {activeTab === 'total' && (
                                    <div className="space-y-1.5 animate-in fade-in duration-300">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Notas Generales (Opcional)</label>
                                        <Textarea
                                            placeholder="Escribe el motivo..."
                                            rows={2}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="bg-muted/20 border-border rounded-xl text-[11px] font-medium resize-none focus:bg-card focus:ring-2 focus:ring-primary/20 transition-colors p-3"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {activeTab === 'total' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Info Banner */}
                        <div className="relative overflow-hidden bg-sky-500/5 border border-sky-500/15 p-5 rounded-2xl flex items-start gap-4">
                            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-sky-500/5 to-transparent" />
                            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center shrink-0">
                                <Info className="w-5 h-5 text-sky-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sky-700 font-black text-xs uppercase tracking-wider">Información de Traslado Total</h3>
                                <p className="text-sky-600/80 text-[11px] font-medium leading-relaxed">
                                    Esta operación moverá{' '}
                                    <span className="font-black text-sky-700">TODO el stock disponible</span>{' '}
                                    de la sucursal de origen a la sucursal de destino en una sola transacción.
                                </p>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-6 pt-4 border-t border-border/40">
                            <button
                                onClick={handleDiscardChanges}
                                className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Descartar Cambios
                            </button>
                            <Button
                                disabled={isLoading || !originBranchId || !destinationBranchId}
                                onClick={handleConfirmTotalTransfer}
                                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Confirmar Traslado Total
                                        <Truck className="w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'selection' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <Card className="p-0 rounded-2xl border-border shadow-sm bg-card overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <LayoutGrid className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-xs uppercase tracking-[0.1em] text-foreground">Catálogo de Productos</h2>
                                        <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Selecciona los ítems a transferir ({totalProducts} productos en {getBranchName(originBranchId)})</p>
                                    </div>
                                </div>
                                <div className="relative w-full md:w-80">
                                    <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                                    <Input
                                        placeholder="Buscar productos..."
                                        value={productSearch}
                                        onChange={(e) => {
                                            setProductSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="pl-10 h-10 bg-muted/20 border-border rounded-xl text-[11px] font-bold"
                                    />
                                    {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-primary" />}
                                </div>
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-muted/30">
                                            <th className="px-6 py-4 text-[9px] font-black uppercase text-muted-foreground tracking-widest">Producto / SKU</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center">Stock Disp.</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center w-32">Cant. a Mover</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase text-muted-foreground tracking-widest">Notas</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase text-muted-foreground tracking-widest text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {products.map((product) => {
                                            const selectedItem = selectedItems.find(item => item.product.id === product.id);
                                            return (
                                                <tr key={product.id} className="hover:bg-muted/20 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black uppercase text-foreground">{product.name}</span>
                                                            <span className="text-[9px] font-bold text-muted-foreground opacity-50">SKU-{product.code}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Badge variant="secondary" className="bg-muted/40 text-[10px] font-bold px-3">
                                                            {product.stock}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={selectedItem ? selectedItem.quantity : (pendingQuantities[product.id] || 0)}
                                                            onChange={(e) => {
                                                                const qty = parseInt(e.target.value) || 0;
                                                                if (selectedItem) {
                                                                    handleUpdateQuantity(product.id, qty);
                                                                } else {
                                                                    setPendingQuantities(prev => ({ ...prev, [product.id]: qty }));
                                                                }
                                                            }}
                                                            className="h-10 text-center font-black text-xs rounded-xl bg-muted/20 border-border"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Input
                                                            placeholder="Observaciones..."
                                                            value={selectedItem?.notes || ''}
                                                            onChange={(e) => {
                                                                const n = e.target.value;
                                                                if (!selectedItem) {
                                                                    handleAddItem(product);
                                                                    setTimeout(() => handleUpdateItemNote(product.id, n), 0);
                                                                } else {
                                                                    handleUpdateItemNote(product.id, n);
                                                                }
                                                            }}
                                                            className="h-10 text-[10px] font-medium rounded-xl bg-muted/20 border-border"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {!selectedItem ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={(pendingQuantities[product.id] || 0) < 1}
                                                                onClick={() => {
                                                                    const qty = pendingQuantities[product.id] || 0;
                                                                    if (qty >= 1) {
                                                                        handleAddItem(product);
                                                                        setTimeout(() => handleUpdateQuantity(product.id, qty), 0);
                                                                    }
                                                                }}
                                                                className="rounded-xl h-9 text-[9px] font-black uppercase tracking-widest border-border text-primary hover:bg-primary/5 px-4 disabled:opacity-30 disabled:grayscale transition-all"
                                                            >
                                                                Agregar
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveItem(product.id)}
                                                                className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-xl"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards View */}
                            <div className="md:hidden divide-y divide-border/40">
                                {products.map((product) => {
                                    const selectedItem = selectedItems.find(item => item.product.id === product.id);
                                    return (
                                        <div key={product.id} className="p-4 space-y-4 hover:bg-muted/10 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h4 className="text-[11px] font-black uppercase text-foreground leading-tight">{product.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-bold text-muted-foreground opacity-50">SKU-{product.code}</span>
                                                        <Badge variant="secondary" className="bg-muted/40 text-[9px] font-bold h-5 px-2">
                                                            Stock: {product.stock}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {selectedItem ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveItem(product.id)}
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={(pendingQuantities[product.id] || 0) < 1}
                                                        onClick={() => {
                                                            const qty = pendingQuantities[product.id] || 0;
                                                            if (qty >= 1) {
                                                                handleAddItem(product);
                                                                setTimeout(() => handleUpdateQuantity(product.id, qty), 0);
                                                            }
                                                        }}
                                                        className="rounded-lg h-8 text-[9px] font-black uppercase tracking-widest border-border text-primary shrink-0 px-3"
                                                    >
                                                        Agregar
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-1">Cantidad</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={selectedItem ? selectedItem.quantity : (pendingQuantities[product.id] || 0)}
                                                        onChange={(e) => {
                                                            const qty = parseInt(e.target.value) || 0;
                                                            if (selectedItem) {
                                                                handleUpdateQuantity(product.id, qty);
                                                            } else {
                                                                setPendingQuantities(prev => ({ ...prev, [product.id]: qty }));
                                                            }
                                                        }}
                                                        className="h-9 text-center font-black text-xs rounded-xl bg-muted/20 border-border"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-1">Notas</label>
                                                    <Input
                                                        placeholder="Opcional..."
                                                        value={selectedItem?.notes || ''}
                                                        onChange={(e) => {
                                                            const n = e.target.value;
                                                            if (!selectedItem) {
                                                                handleAddItem(product);
                                                                setTimeout(() => handleUpdateItemNote(product.id, n), 0);
                                                            } else {
                                                                handleUpdateItemNote(product.id, n);
                                                            }
                                                        }}
                                                        className="h-9 text-[9px] font-medium rounded-xl bg-muted/20 border-border"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Area */}
                            <div className="p-4 md:p-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">
                                    {products.length > 0 ? (currentPage - 1) * 10 + 1 : 0}-{Math.min(currentPage * 10, totalProducts)} de {totalProducts}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="h-8 w-8 p-0 rounded-lg border-border"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <Button
                                            key={i}
                                            variant={currentPage === i + 1 ? "primary" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`h-8 w-8 p-0 rounded-lg text-xs font-black ${currentPage === i + 1 ? "bg-primary text-primary-foreground" : "border-border"}`}
                                        >
                                            {i + 1}
                                        </Button>
                                    )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="h-8 w-8 p-0 rounded-lg border-border"
                                    >
                                        <ChevronRight className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Footer Actions for Selection Mode */}
                        <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 bg-card border-t border-border p-3 md:p-4 z-40 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
                            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black text-[9px] md:text-[10px] uppercase tracking-widest shrink-0">
                                    {selectedItems.filter(i => i.quantity > 0).length} Seleccionados
                                </Badge>
                                <button
                                    onClick={handleClearSelection}
                                    className="text-[9px] md:text-[10px] font-black uppercase text-destructive hover:underline shrink-0"
                                >
                                    Limpiar
                                </button>
                            </div>

                            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                                <button
                                    onClick={handleDiscardChanges}
                                    className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mr-2 text-nowrap"
                                >
                                    Descartar
                                </button>
                                <Button
                                    disabled={isLoading || selectedItems.filter(i => i.quantity > 0).length === 0 || !originBranchId || !destinationBranchId}
                                    onClick={() => setIsPreviewModalOpen(true)}
                                    className="h-11 md:h-14 w-full sm:w-auto px-6 md:px-8 rounded-xl md:rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg md:shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 md:gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Continuar
                                            <Truck className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
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
