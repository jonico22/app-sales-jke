import { Loader2, Users, Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
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
import type { Client } from '@/services/client.service';
import { cn } from '@/lib/utils';

const TABLE_BODY_STYLE = { contentVisibility: 'auto' } as React.CSSProperties;

export interface ClientsTableProps {
    clients: Client[];
    isLoading: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
    onEdit: (client: Client) => void;
    onDelete: (id: string) => void;
    getClientDisplayName: (client: Client) => string;
}

export function ClientsTable({
    clients, isLoading, sortBy, sortOrder, onSort, onEdit, onDelete, getClientDisplayName
}: ClientsTableProps) {
    return (
        <div className="hidden lg:block">
            <Table>
                <TableHeader className={dataTableHeaderRowClassName}>
                    <TableRow className="hover:bg-transparent border-none h-10">
                        <SortableTableHead
                            field="documentNumber"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('w-[140px] pl-6')}
                        >
                            Documento
                        </SortableTableHead>
                        <SortableTableHead
                            field="name"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('w-[250px]')}
                        >
                            Nombre / Razón Social
                        </SortableTableHead>
                        <SortableTableHead
                            field="email"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('w-[200px]')}
                        >
                            Contacto
                        </SortableTableHead>
                        <SortableTableHead
                            field="address"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('w-[250px]')}
                        >
                            Dirección
                        </SortableTableHead>
                        <SortableTableHead
                            field="isActive"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className={dataTableHead('w-[100px]')}
                        >
                            Estado
                        </SortableTableHead>
                        <TableHead className={dataTableHead('w-[90px] text-right pr-6')}>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody style={TABLE_BODY_STYLE}>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Cargando clientes...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : clients.length > 0 ? (
                        clients.map((client) => (
                            <TableRow key={client.id} className={dataTableRow()}>
                                <TableCell className="pl-6">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[9px] font-semibold uppercase tracking-[0.08em] px-1.5 h-4 border-border/80 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">
                                            {client.documentType}
                                        </Badge>
                                        <span className={cn(dataTableCellCodeClassName, 'text-slate-800 dark:text-slate-100')}>
                                            {client.documentNumber || 'S/N'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={dataTableCellPrimaryClassName}>{getClientDisplayName(client)}</div>
                                    <div className={cn(dataTableCellSecondaryClassName, 'text-[9px] transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-300')}>ID: {client.id.substring(0, 8)}...</div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        {client.email && (
                                            <div className={cn('flex items-center gap-1.5', dataTableCellSecondaryClassName)}>
                                                <Mail className="h-3 w-3 text-primary/60" />
                                                {client.email}
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className={cn('flex items-center gap-1.5', dataTableCellSecondaryClassName)}>
                                                <Phone className="h-3 w-3 text-primary/60" />
                                                {client.phone}
                                            </div>
                                        )}
                                        {!client.email && !client.phone && <span className="text-muted-foreground/40 text-[10px]">—</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={cn(dataTableCellSecondaryClassName, 'max-w-[200px] truncate')} title={client.address || ''}>
                                        {client.address || <span className="text-slate-400 dark:text-slate-500 italic">Sin dirección</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={client.isActive ? 'success' : 'destructive'} className="uppercase text-[9px] font-semibold tracking-[0.08em] px-2 py-0.5 border border-current/20">
                                        {client.isActive ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName)}
                                            onClick={() => onEdit(client)}
                                        >
                                            <Pencil className={dataTableActionIconClassName} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName)}
                                            onClick={() => onDelete(client.id)}
                                        >
                                            <Trash2 className={dataTableActionIconClassName} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
                                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4 border border-border">
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-1">
                                        No se encontraron clientes
                                    </h3>
                                    <p className="text-muted-foreground max-w-sm mb-6 font-medium text-xs">
                                        No hay clientes que coincidan con tu búsqueda o los filtros seleccionados.
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
