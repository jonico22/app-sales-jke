import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Loader2, Building2, MapPin, Phone as PhoneIcon, Mail } from 'lucide-react';
import { type BranchOffice } from '@/services/branch-office.service';

interface BranchOfficesMobileListProps {
    branchOffices: BranchOffice[];
    isLoading: boolean;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export function BranchOfficesMobileList({
    branchOffices,
    isLoading,
    onEdit,
    onDelete
}: BranchOfficesMobileListProps) {
    return (
        <div className="md:hidden divide-y divide-border">
            {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs font-medium tracking-tight uppercase">Cargando sucursales...</span>
                </div>
            ) : branchOffices.length > 0 ? (
                branchOffices.map((branch) => (
                    <div key={branch.id} className="p-4 bg-card active:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {branch.code || 'S/C'}
                                    </span>
                                    <Badge variant={branch.isActive ? 'success' : 'secondary'} className="uppercase text-[8px] font-bold px-1.5 py-0 h-4">
                                        {branch.isActive ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <h3 className="text-sm font-bold text-foreground leading-tight truncate">{branch.name}</h3>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground"
                                    onClick={() => onEdit(branch.id)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                {branch.code !== 'ALM-PRINCIPAL' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => onDelete(branch.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-border/50">
                            <div className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-60" />
                                <span className="text-[10px] font-medium leading-relaxed">{branch.address || 'Sin dirección registrada'}</span>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {branch.phone && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                        <PhoneIcon className="h-3 w-3 opacity-60" />
                                        {branch.phone}
                                    </div>
                                )}
                                {branch.email && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                        <Mail className="h-3 w-3 opacity-60" />
                                        <span className="truncate max-w-[150px]">{branch.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <Building2 className="h-10 w-10 text-muted-foreground/20 mb-3" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron sucursales</p>
                </div>
            )}
        </div>
    );
}
