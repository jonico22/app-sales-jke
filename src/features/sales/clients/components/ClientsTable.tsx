import { Loader2, Users, Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import { SortableTableHead } from '@/components/shared/SortableTableHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { Client } from '@/services/client.service';

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
        <div className="hidden lg:block overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/30 border-b border-border">
                    <TableRow className="hover:bg-muted/40 border-none h-10">
                        <SortableTableHead
                            field="documentNumber"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[140px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70 pl-6"
                        >
                            Documento
                        </SortableTableHead>
                        <SortableTableHead
                            field="name"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[250px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                        >
                            Nombre / Razón Social
                        </SortableTableHead>
                        <SortableTableHead
                            field="email"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[200px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                        >
                            Contacto
                        </SortableTableHead>
                        <SortableTableHead
                            field="address"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[250px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                        >
                            Dirección
                        </SortableTableHead>
                        <SortableTableHead
                            field="isActive"
                            currentSortBy={sortBy}
                            currentSortOrder={sortOrder}
                            onSort={onSort}
                            className="w-[100px] font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70"
                        >
                            Estado
                        </SortableTableHead>
                        <TableHead className="w-[90px] text-right font-semibold text-[10px] uppercase tracking-wider text-muted-foreground/70 pr-6">Acciones</TableHead>
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
                            <TableRow key={client.id} className="hover:bg-muted/30 border-border transition-colors group">
                                <TableCell className="pl-6">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter px-1.5 h-4 border-muted-foreground/30 text-muted-foreground/80">
                                            {client.documentType}
                                        </Badge>
                                        <span className="font-mono text-[11px] font-bold text-foreground">
                                            {client.documentNumber || 'S/N'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-bold text-foreground text-xs">{getClientDisplayName(client)}</div>
                                    <div className="text-[9px] text-muted-foreground font-medium group-hover:text-primary transition-colors">ID: {client.id.substring(0, 8)}...</div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        {client.email && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                <Mail className="h-3 w-3 text-primary/40" />
                                                {client.email}
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                <Phone className="h-3 w-3 text-primary/40" />
                                                {client.phone}
                                            </div>
                                        )}
                                        {!client.email && !client.phone && <span className="text-muted-foreground/40 text-[10px]">—</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-muted-foreground/80 text-[11px] max-w-[200px] truncate" title={client.address || ''}>
                                        {client.address || <span className="text-muted-foreground/40 italic">Sin dirección</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={client.isActive ? 'success' : 'destructive'} className="uppercase text-[9px] tracking-wide px-2 py-0.5 border border-current/20">
                                        {client.isActive ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg"
                                            onClick={() => onEdit(client)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg"
                                            onClick={() => onDelete(client.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
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
