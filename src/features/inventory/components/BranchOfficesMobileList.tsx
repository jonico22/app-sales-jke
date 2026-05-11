import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Loader2, Building2, MapPin, Phone as PhoneIcon, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    dataTableActionButtonClassName,
    dataTableActionDestructiveClassName,
    dataTableActionIconClassName,
    dataTableActionPrimaryClassName,
    dataTableCellCodeClassName,
    dataTableCellPrimaryClassName,
    dataTableCellSecondaryClassName
} from '@/components/shared/dataTableStyles';
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
                                    <span className={cn(dataTableCellCodeClassName, 'bg-muted px-1.5 py-0.5 rounded')}>
                                        {branch.code || 'S/C'}
                                    </span>
                                    <Badge variant={branch.isActive ? 'success' : 'secondary'} className="uppercase text-[8px] font-semibold px-1.5 py-0 h-4">
                                        {branch.isActive ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <h3 className={cn(dataTableCellPrimaryClassName, 'truncate')}>{branch.name}</h3>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName)}
                                    onClick={() => onEdit(branch.id)}
                                >
                                    <Pencil className={dataTableActionIconClassName} />
                                </Button>
                                {branch.code !== 'ALM-PRINCIPAL' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName)}
                                        onClick={() => onDelete(branch.id)}
                                    >
                                        <Trash2 className={dataTableActionIconClassName} />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-border/50">
                            <div className={cn('flex items-start gap-2', dataTableCellSecondaryClassName)}>
                                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-60" />
                                <span className="leading-relaxed">{branch.address || 'Sin dirección registrada'}</span>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {branch.phone && (
                                    <div className={cn('flex items-center gap-1.5', dataTableCellSecondaryClassName)}>
                                        <PhoneIcon className="h-3 w-3 opacity-60" />
                                        {branch.phone}
                                    </div>
                                )}
                                {branch.email && (
                                    <div className={cn('flex items-center gap-1.5', dataTableCellSecondaryClassName)}>
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
