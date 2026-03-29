import { Search, Loader2, Package, Check, ChevronDown, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { type BranchOffice } from '@/services/branch-office.service';
import { type Product } from '@/services/product.service';

interface CreateMovementStep1Props {
    branches: BranchOffice[];
    originBranchId: string;
    onOriginBranchChange: (id: string) => void;
    destinationBranchId: string;
    onDestinationBranchChange: (id: string) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    searchResults: Product[];
    isSearching: boolean;
    selectedProduct: Product | null;
    onSelectProduct: (product: Product) => void;
    quantity: number;
    onQuantityChange: (qty: number) => void;
    isReserved: boolean;
    onIsReservedChange: (isReserved: boolean) => void;
    referenceCode: string;
    onReferenceCodeChange: (code: string) => void;
    notes: string;
    onNotesChange: (notes: string) => void;
    isLoading: boolean;
    isStep1Valid: boolean;
    onSubmit: () => void;
    onCancel: () => void;
    getBranchName: (id: string) => string;
}

export function CreateMovementStep1({
    branches,
    originBranchId,
    onOriginBranchChange,
    destinationBranchId,
    onDestinationBranchChange,
    searchTerm,
    onSearchTermChange,
    searchResults,
    isSearching,
    selectedProduct,
    onSelectProduct,
    quantity,
    onQuantityChange,
    isReserved,
    onIsReservedChange,
    referenceCode,
    onReferenceCodeChange,
    notes,
    onNotesChange,
    isLoading,
    isStep1Valid,
    onSubmit,
    onCancel,
    getBranchName
}: CreateMovementStep1Props) {
    return (
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
                                            onClick={() => onOriginBranchChange(branch.id)}
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
                                            onClick={() => onDestinationBranchChange(branch.id)}
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
                                onChange={(e) => onSearchTermChange(e.target.value)}
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
                                        onClick={() => onSelectProduct(product)}
                                        className="flex items-center gap-4 p-3 hover:bg-muted rounded-xl cursor-pointer transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                            {product.image ? (
                                                <img src={product.image} className="w-full h-full object-cover rounded-lg" alt={product.name} />
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
                                            <img src={selectedProduct.image} className="w-full h-full object-cover rounded-xl" alt={selectedProduct.name} />
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
                                        onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
                                        className="h-12 rounded-xl bg-card border-border focus:ring-primary/10 text-center font-black text-base shadow-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-4 px-6 h-12 rounded-xl bg-card border-2 border-primary/5 shadow-lg shadow-primary/5 transition-all hover:border-primary/20 hover:scale-[1.01] active:scale-[0.99] group/switch">
                                    <Switch
                                        checked={isReserved}
                                        onCheckedChange={onIsReservedChange}
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
                            onChange={(e) => onReferenceCodeChange(e.target.value)}
                            className="h-12 px-4 rounded-xl bg-muted/20 border-border focus:bg-card text-[11px] font-black text-primary uppercase tracking-widest transition-all"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1">Notas de Transferencia</label>
                        <Textarea
                            placeholder="Escriba aquí los detalles del traslado..."
                            value={notes}
                            onChange={(e) => onNotesChange(e.target.value)}
                            className="min-h-[80px] p-4 rounded-xl bg-muted/20 border-border focus:bg-card text-sm font-medium resize-none transition-all leading-relaxed"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 px-6 bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancelar
                    </button>
                    <Button
                        onClick={onSubmit}
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
    );
}
