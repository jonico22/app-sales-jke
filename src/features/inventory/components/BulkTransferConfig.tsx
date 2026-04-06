import { ArrowRightLeft, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { type BranchOfficeSelectOption } from '@/services/branch-office.service';

interface BulkTransferConfigProps {
    branches: BranchOfficeSelectOption[];
    originBranchId: string;
    onOriginBranchChange: (id: string) => void;
    destinationBranchId: string;
    onDestinationBranchChange: (id: string) => void;
    referenceCode: string;
    onReferenceCodeChange: (code: string) => void;
    notes: string;
    onNotesChange: (notes: string) => void;
    activeTab: string;
}

export function BulkTransferConfig({
    branches,
    originBranchId,
    onOriginBranchChange,
    destinationBranchId,
    onDestinationBranchChange,
    referenceCode,
    onReferenceCodeChange,
    notes,
    onNotesChange,
    activeTab
}: BulkTransferConfigProps) {
    const getBranchName = (id: string) => {
        return branches.find(b => b.id === id)?.name || 'Seleccionar sucursal';
    };

    return (
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
                                        className={`w-full h-11 md:h-12 px-4 rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider flex items-center justify-between gap-3 transition-all ${
                                            originBranchId
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
                                            onClick={() => onOriginBranchChange(branch.id)}
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
                                        className={`w-full h-11 md:h-12 px-4 rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider flex items-center justify-between gap-3 transition-all ${
                                            destinationBranchId
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
                                            onClick={() => onDestinationBranchChange(branch.id)}
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
                                onChange={(e) => onReferenceCodeChange(e.target.value)}
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
                                    onChange={(e) => onNotesChange(e.target.value)}
                                    className="bg-muted/20 border-border rounded-xl text-[11px] font-medium resize-none focus:bg-card focus:ring-2 focus:ring-primary/20 transition-colors p-3"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
