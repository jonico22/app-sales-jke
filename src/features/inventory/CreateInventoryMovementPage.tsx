import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Search,
    Info,
    Check,
    ChevronDown,
    Package,
    Loader2
} from 'lucide-react';
import {
    Button,
    Input,
    Textarea,
    Badge,
    Card,
    Switch,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui';
import { branchOfficeService, type BranchOffice } from '@/services/branch-office.service';
import { branchOfficeProductService } from '@/services/branch-office-product.service';
import { branchMovementService } from '@/services/branch-movement.service';
import { type Product } from '@/services/product.service';
import { toast } from 'sonner';

export default function CreateInventoryMovementPage() {
    const navigate = useNavigate();
    const [branches, setBranches] = useState<BranchOffice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [createdMovementId, setCreatedMovementId] = useState<string | null>(null);

    // Form State
    const [originBranchId, setOriginBranchId] = useState<string>('');
    const [destinationBranchId, setDestinationBranchId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [isReserved, setIsReserved] = useState(true);
    const [referenceCode, setReferenceCode] = useState(`IND-MOVE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length >= 2 && originBranchId) {
                searchProducts();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, originBranchId]);

    const fetchBranches = async () => {
        try {
            const response = await branchOfficeService.getAll({ limit: 100, isActive: true });
            if (response.success) {
                setBranches(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            toast.error('Error al cargar sucursales');
        }
    };

    const searchProducts = async () => {
        if (!originBranchId) return;
        try {
            setIsSearching(true);
            const response = await branchOfficeProductService.getForSelect({
                branchOfficeId: originBranchId,
                search: searchTerm,
                limit: 5
            });
            if (response.success) {
                setSearchResults(response.data.data);
            }
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setSearchTerm('');
        setSearchResults([]);
        if (product.stock < quantity) {
            setQuantity(product.stock > 0 ? 1 : 0);
        }
    };

    const handleSubmit = async () => {
        if (!originBranchId || !destinationBranchId || !selectedProduct || quantity <= 0) {
            toast.error('Por favor complete todos los campos requeridos');
            return;
        }

        if (originBranchId === destinationBranchId) {
            toast.error('La sucursal de origen y destino no pueden ser la misma');
            return;
        }

        if (quantity > selectedProduct.stock) {
            toast.error('La cantidad no puede superar el stock disponible');
            return;
        }

        try {
            setIsLoading(true);
            const response = await branchMovementService.create({
                originBranchId,
                destinationBranchId,
                productId: selectedProduct.id,
                quantityMoved: quantity,
                referenceCode,
                notes
            });

            if (response.success) {
                toast.success('Movimiento registrado exitosamente');
                setCreatedMovementId(response.data.id);
                setCurrentStep(2);
            }
        } catch (error) {
            console.error('Error creating movement:', error);
            toast.error('Error al crear el movimiento');
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!createdMovementId) return;

        try {
            setIsLoading(true);
            const response = await branchMovementService.updateStatus(createdMovementId, {
                status: 'COMPLETED'
            });

            if (response.success) {
                toast.success('Traslado completado exitosamente');
                navigate('/inventory/movements');
            }
        } catch (error) {
            console.error('Error completing movement:', error);
            toast.error('Error al completar el traslado');
        } finally {
            setIsLoading(false);
        }
    };

    const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'Seleccionar sucursal';
    const getBranchAddress = (id: string) => branches.find(b => b.id === id)?.address || 'Dirección no disponible';

    const isStep1Valid = originBranchId && destinationBranchId && selectedProduct && quantity > 0 && originBranchId !== destinationBranchId;

    return (
        <div className="min-h-screen bg-background space-y-4 md:p-2">
            {/* Header section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/inventory/movements')}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Volver a Listado
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                        {currentStep === 1 ? 'Paso 1 de 2' : 'Finalizado'}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-foreground tracking-tight uppercase leading-none">
                            {currentStep === 1 ? 'Nueva Transferencia Interna' : 'Confirmar Envío'}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-2 font-medium opacity-70">
                            {currentStep === 1
                                ? 'Complete la información para reservar el stock en la sucursal de origen.'
                                : 'El movimiento ha sido registrado correctamente en el sistema.'}
                        </p>
                    </div>
                    <div>
                        <Badge className={`${currentStep === 1 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-green-500/10 text-green-600 border-green-500/20'} px-3 py-1 font-black text-[10px] uppercase tracking-widest`}>
                            {currentStep === 1 ? 'Borrador' : 'Confirmado'}
                        </Badge>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto space-y-4">
                {currentStep === 1 ? (
                    <>
                        {/* Progress Tracking */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-primary font-black text-[11px] uppercase tracking-widest">Paso 1: Reserva</span>
                                <span className="text-muted-foreground font-bold text-[11px] uppercase tracking-widest">50% completado</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full w-1/2 bg-primary rounded-full transition-all duration-500" />
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">SIGUIENTE: CONFIRMACIÓN Y ENVÍO</p>
                        </div>

                        {/* Main Form Card */}
                        <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden">
                            <div className="p-4 px-6 border-b border-border/40">
                                <h2 className="text-lg font-black text-foreground tracking-tight leading-none uppercase">Detalles</h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Source & Destination */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] ml-1">Sucursal de Origen</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between h-12 px-4 rounded-xl bg-muted/20 border-border hover:bg-muted text-[11px] font-black uppercase tracking-widest text-foreground transition-all">
                                                    {getBranchName(originBranchId)}
                                                    <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[300px] p-2 rounded-2xl bg-card border-border shadow-2xl">
                                                {branches.map(branch => (
                                                    <DropdownMenuItem
                                                        key={branch.id}
                                                        onClick={() => {
                                                            setOriginBranchId(branch.id);
                                                            setSelectedProduct(null);
                                                        }}
                                                        className="px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-muted"
                                                    >
                                                        {branch.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] ml-1">Sucursal de Destino</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between h-12 px-4 rounded-xl bg-muted/20 border-border hover:bg-muted text-[11px] font-black uppercase tracking-widest text-foreground transition-all">
                                                    {getBranchName(destinationBranchId)}
                                                    <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[300px] p-2 rounded-2xl bg-card border-border shadow-2xl">
                                                {branches.map(branch => (
                                                    <DropdownMenuItem
                                                        key={branch.id}
                                                        onClick={() => setDestinationBranchId(branch.id)}
                                                        className="px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-muted"
                                                    >
                                                        {branch.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                {/* Product Selection */}
                                <div className="space-y-3 relative">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Producto</label>
                                    <div className="relative">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                                        <Input
                                            placeholder="Buscar producto..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-12 pl-12 pr-5 rounded-xl bg-muted/20 border-border focus:bg-card focus:ring-2 focus:ring-primary/20 text-sm font-bold transition-all"
                                            disabled={!originBranchId}
                                        />
                                        {isSearching && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
                                    </div>
                                    {/* Search Results Dropdown */}
                                    {searchResults.length > 0 && !selectedProduct && (
                                        <div className="absolute z-10 top-full mt-2 w-full bg-card border border-border rounded-[1.5rem] shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                                            {searchResults.map(product => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => handleSelectProduct(product)}
                                                    className="flex items-center gap-4 p-3 hover:bg-muted rounded-xl cursor-pointer transition-colors group"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                        {product.image ? (
                                                            <img src={product.image} className="w-full h-full object-cover rounded-lg" />
                                                        ) : (
                                                            <Package className="w-5 h-5 text-muted-foreground opacity-50" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-black text-foreground uppercase leading-none mb-1">{product.name}</p>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-50">SKU-{product.code || '---'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-foreground">{product.stock}</p>
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">disponible</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Product Info Card */}
                                {selectedProduct && (
                                    <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-card shadow-sm border border-border/40 flex items-center justify-center p-1">
                                                    {selectedProduct.image ? (
                                                        <img src={selectedProduct.image} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-primary" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight leading-none">{selectedProduct.name}</h3>
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">SKU-{selectedProduct.code || '---'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Stock Disponible</p>
                                                <p className="text-sm font-black text-primary uppercase tracking-tighter leading-none">{selectedProduct.stock} unidades</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1 max-w-xs space-y-2">
                                                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-50">Cantidad a Mover</label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max={selectedProduct.stock}
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                                    className="h-12 rounded-xl bg-card border-border focus:ring-primary/10 text-center font-black text-base shadow-sm"
                                                />
                                            </div>

                                            <div className="flex items-center gap-4 px-6 h-12 rounded-xl bg-card border-2 border-primary/5 shadow-lg shadow-primary/5 transition-all hover:border-primary/20 hover:scale-[1.01] active:scale-[0.99] group/switch">
                                                <Switch
                                                    checked={isReserved}
                                                    onCheckedChange={setIsReserved}
                                                    className="scale-110"
                                                />
                                                <span className="text-[10px] font-black text-foreground uppercase tracking-[0.1em] group-hover/switch:text-primary transition-colors">Confirmar Reserva</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Reference Code */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Código de Referencia</label>
                                    <Input
                                        value={referenceCode}
                                        onChange={(e) => setReferenceCode(e.target.value)}
                                        className="h-12 px-4 rounded-xl bg-muted/20 border-border focus:bg-card text-[11px] font-black text-primary uppercase tracking-widest transition-all"
                                    />
                                </div>

                                {/* Notes */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Notas de Transferencia</label>
                                    <Textarea
                                        placeholder="Escriba aquí los detalles del traslado..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="min-h-[80px] p-4 rounded-xl bg-muted/20 border-border focus:bg-card text-sm font-medium resize-none transition-all leading-relaxed"
                                    />
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 px-6 bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <button
                                    onClick={() => navigate('/inventory/movements')}
                                    className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancelar
                                </button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !isStep1Valid}
                                    className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Continuar a Reserva
                                            <Check className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>

                        {/* Info Alert */}
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-primary transition-all hover:bg-primary/10 active:scale-[0.99]">
                            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                <Info className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-widest">Información de Disponibilidad</p>
                                <p className="text-xs font-medium leading-relaxed opacity-80">
                                    Al completar este paso, los artículos seleccionados se marcarán como "Reservados" y no estarán disponibles para la venta u otras transferencias en la sucursal de origen.
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        {/* Summary Header */}
                        <div className="bg-card border-border border shadow-sm rounded-3xl overflow-hidden">
                            <div className="p-4 px-6 border-b border-border/40 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg font-black text-foreground tracking-tight uppercase">Resumen del Traslado</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50">REF:</span>
                                    <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest py-1 border-border bg-muted/20">
                                        {referenceCode}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                                    {/* Connection Line */}
                                    <div className="hidden lg:block absolute left-[1.75rem] top-[4rem] bottom-[4rem] w-px bg-gradient-to-b from-primary/40 via-primary/20 to-primary/40 border-l border-dashed border-primary/30" />

                                    {/* Locations Column */}
                                    <div className="space-y-8">
                                        {/* Origin */}
                                        <div className="flex gap-6 relative">
                                            <div className="w-14 h-14 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center shrink-0 shadow-sm z-10">
                                                <div className="w-3 h-3 rounded-full border-[3px] border-primary/40" />
                                            </div>
                                            <div className="space-y-1 py-1">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-60">Origen</p>
                                                <h3 className="text-base font-black text-foreground uppercase tracking-tight leading-none">{getBranchName(originBranchId)}</h3>
                                                <p className="text-[11px] text-muted-foreground font-medium opacity-60">{getBranchAddress(originBranchId)}</p>
                                            </div>
                                        </div>

                                        {/* Destination */}
                                        <div className="flex gap-6 relative">
                                            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-xl shadow-primary/20 z-10">
                                                <div className="w-3 h-3 rounded-full border-[3px] border-white" />
                                            </div>
                                            <div className="space-y-1 py-1">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-60">Destino</p>
                                                <h3 className="text-base font-black text-foreground uppercase tracking-tight leading-none">{getBranchName(destinationBranchId)}</h3>
                                                <p className="text-[11px] text-muted-foreground font-medium opacity-60">{getBranchAddress(destinationBranchId)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Details Card */}
                                    <div className="lg:pl-4">
                                        <div className="bg-muted/10 border border-border/40 rounded-3xl p-6 space-y-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center p-2">
                                                    {selectedProduct?.image ? (
                                                        <img src={selectedProduct.image} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-primary/40" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">Producto a Trasladar</p>
                                                    <h4 className="text-sm font-black text-foreground uppercase tracking-tight leading-tight">{selectedProduct?.name}</h4>
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">SKU-{selectedProduct?.code || '---'}</p>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-border/40 flex items-center justify-between">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-black text-foreground tracking-tighter">{quantity}</span>
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">UNID.</span>
                                                </div>
                                                <div className="max-w-[140px] text-right">
                                                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic opacity-60">
                                                        Cantidad verificada para envío inmediato.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4">
                            <Button
                                onClick={handleComplete}
                                disabled={isLoading}
                                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Finalizar y Completar Traslado
                                        <Check className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
