import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Loader2, Building2, MapPin, Phone as PhoneIcon, Mail } from 'lucide-react';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import {
    dataTableActionButtonClassName,
    dataTableActionDestructiveClassName,
    dataTableActionIconClassName,
    dataTableActionPrimaryClassName,
    dataTableCellCodeClassName,
    dataTableCellPrimaryClassName,
    dataTableCellSecondaryClassName,
    dataTableHead,
    dataTableHeaderRowClassName,
    dataTableRow
} from '@/components/shared/dataTableStyles';
import { type BranchOffice } from '@/services/branch-office.service';
import { cn } from '@/lib/utils';

interface BranchOfficesTableProps {
    branchOffices: BranchOffice[];
    isLoading: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export function BranchOfficesTable({
    branchOffices,
    isLoading,
    sortBy,
    sortOrder,
    onSort,
    onEdit,
    onDelete
}: BranchOfficesTableProps) {
    return (
        <div className="hidden md:block">
            <Table>
                <TableHeader className={dataTableHeaderRowClassName}>
                    <TableRow className="hover:bg-transparent border-none">
                        <SortableTableHead
                            field="code"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('w-[100px] h-10')}
                        >
                            Código
                        </SortableTableHead>
                        <SortableTableHead
                            field="name"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('w-[250px] h-10')}
                        >
                            Nombre
                        </SortableTableHead>
                        <SortableTableHead
                            field="address"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('w-[300px] h-10')}
                        >
                            Dirección
                        </SortableTableHead>
                        <th className={dataTableHead('w-[150px] h-10 px-4')}>Contacto</th>
                        <SortableTableHead
                            field="isActive"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('w-[100px] h-10 text-center')}
                        >
                            Estado
                        </SortableTableHead>
                        <th className={dataTableHead('w-[100px] text-right px-4')}>Acciones</th>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Cargando sucursales...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : branchOffices.length > 0 ? (
                        branchOffices.map((branch) => (
                            <TableRow key={branch.id} className={dataTableRow()}>
                                <TableCell className={dataTableCellCodeClassName}>{branch.code}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Building2 className={cn(dataTableActionIconClassName, 'text-primary')} />
                                        </div>
                                        <div className={dataTableCellPrimaryClassName}>{branch.name}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={cn('flex items-center gap-2', dataTableCellSecondaryClassName)}>
                                        <MapPin className="h-3.5 w-3.5 shrink-0 opacity-50" />
                                        <span className="text-[11px] line-clamp-1">{branch.address || '—'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        {branch.phone && (
                                            <div className={cn('flex items-center gap-2', dataTableCellSecondaryClassName)}>
                                                <PhoneIcon className="h-3 w-3 opacity-50" />
                                                {branch.phone}
                                            </div>
                                        )}
                                        {branch.email && (
                                            <div className={cn('flex items-center gap-2', dataTableCellSecondaryClassName)}>
                                                <Mail className="h-3 w-3 opacity-50" />
                                                {branch.email}
                                            </div>
                                        )}
                                        {!branch.phone && !branch.email && <span className="text-muted-foreground/40 text-[10px]">Sin contacto</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={branch.isActive ? 'success' : 'outline'} className={`uppercase text-[9px] font-semibold tracking-[0.08em] px-2 py-0.5 rounded-md ${!branch.isActive && 'bg-muted/50 border-border text-muted-foreground'}`}>
                                        {branch.isActive ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
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
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border">
                                        <Building2 className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground mb-1">
                                        No se encontraron sucursales
                                    </h3>
                                    <p className="text-muted-foreground max-w-sm mb-6">
                                        No hay sucursales registradas o que coincidan con tu búsqueda.
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
