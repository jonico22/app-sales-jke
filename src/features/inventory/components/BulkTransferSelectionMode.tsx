import { PackageSearch, Loader2, LayoutGrid, ChevronLeft, ChevronRight, Truck, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Product } from '@/services/product.service';

interface BulkTransferSelectionModeProps {
    totalProducts: number;
    originBranchName: string;
    productSearch: string;
    isSearching: boolean;
    onProductSearchChange: (value: string) => void;
    products: Product[];
    selectedItems: Array<{ product: Product; quantity: number; notes: string }>;
    pendingQuantities: Record<string, number>;
    onPendingQuantityChange: (productId: string, quantity: number) => void;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onUpdateItemNote: (productId: string, notes: string) => void;
    onAddItem: (product: Product) => void;
    onRemoveItem: (productId: string) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onClearSelection: () => void;
    onDiscardChanges: () => void;
    isLoading: boolean;
    originBranchId: string;
    destinationBranchId: string;
    onConfirm: () => void;
}

export function BulkTransferSelectionMode({
    totalProducts,
    originBranchName,
    productSearch,
    isSearching,
    onProductSearchChange,
    products,
    selectedItems,
    pendingQuantities,
    onPendingQuantityChange,
    onUpdateQuantity,
    onUpdateItemNote,
    onAddItem,
    onRemoveItem,
    currentPage,
    totalPages,
    onPageChange,
    onClearSelection,
    onDiscardChanges,
    isLoading,
    originBranchId,
    destinationBranchId,
    onConfirm
}: BulkTransferSelectionModeProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <Card className="p-0 rounded-2xl border-border shadow-sm bg-card overflow-hidden">
                <div className="p-4 md:p-6 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <LayoutGrid className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-black text-xs uppercase tracking-[0.1em] text-foreground">Catálogo de Productos</h2>
                            <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">Selecciona los ítems a transferir ({totalProducts} productos en {originBranchName})</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-80">
                        <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                        <Input
                            placeholder="Buscar productos..."
                            value={productSearch}
                            onChange={(e) => onProductSearchChange(e.target.value)}
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
                                                        onUpdateQuantity(product.id, qty);
                                                    } else {
                                                        onPendingQuantityChange(product.id, qty);
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
                                                        onAddItem(product);
                                                        setTimeout(() => onUpdateItemNote(product.id, n), 0);
                                                    } else {
                                                        onUpdateItemNote(product.id, n);
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
                                                            onAddItem(product);
                                                            setTimeout(() => onUpdateQuantity(product.id, qty), 0);
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
                                                    onClick={() => onRemoveItem(product.id)}
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
                                            onClick={() => onRemoveItem(product.id)}
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
                                                    onAddItem(product);
                                                    setTimeout(() => onUpdateQuantity(product.id, qty), 0);
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
                                                    onUpdateQuantity(product.id, qty);
                                                } else {
                                                    onPendingQuantityChange(product.id, qty);
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
                                                    onAddItem(product);
                                                    setTimeout(() => onUpdateItemNote(product.id, n), 0);
                                                } else {
                                                    onUpdateItemNote(product.id, n);
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
                            onClick={() => onPageChange(currentPage - 1)}
                            className="h-8 w-8 p-0 rounded-lg border-border"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        {[...Array(totalPages)].map((_, i) => (
                            <Button
                                key={i}
                                variant={currentPage === i + 1 ? "primary" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(i + 1)}
                                className={`h-8 w-8 p-0 rounded-lg text-xs font-black ${currentPage === i + 1 ? "bg-primary text-primary-foreground" : "border-border"}`}
                            >
                                {i + 1}
                            </Button>
                        )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
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
                        onClick={onClearSelection}
                        className="text-[9px] md:text-[10px] font-black uppercase text-destructive hover:underline shrink-0"
                    >
                        Limpiar
                    </button>
                </div>

                <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                    <button
                        onClick={onDiscardChanges}
                        className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mr-2 text-nowrap"
                    >
                        Descartar
                    </button>
                    <Button
                        disabled={isLoading || selectedItems.filter(i => i.quantity > 0).length === 0 || !originBranchId || !destinationBranchId}
                        onClick={onConfirm}
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
    );
}
