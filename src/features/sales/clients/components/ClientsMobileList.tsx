import { Loader2, Users, Mail, Pencil, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Client } from '@/services/client.service';
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

interface ClientsMobileListProps {
    clients: Client[];
    isLoading: boolean;
    onEdit: (client: Client) => void;
    onDelete: (id: string) => void;
    getClientDisplayName: (client: Client) => string;
}

export function ClientsMobileList({
    clients, isLoading, onEdit, onDelete, getClientDisplayName
}: ClientsMobileListProps) {
    return (
        <div className="lg:hidden divide-y divide-border/70">
            {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs font-medium tracking-tight uppercase">Cargando clientes...</span>
                </div>
            ) : clients.length > 0 ? (
                clients.map((client) => (
                    <div key={client.id} className="p-4 bg-card active:bg-slate-50 dark:active:bg-slate-800/60 transition-colors relative">
                        {/* Left accent border based on status */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1",
                            client.isActive ? "bg-emerald-500/50" : "bg-rose-500/50"
                        )} />

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-[8px] font-semibold uppercase px-1.5 h-4 border-border/80 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        {client.documentType || 'DOC'}
                                    </Badge>
                                    <span className={cn(dataTableCellCodeClassName, 'text-[9px]')}>{client.documentNumber || 'S/N'}</span>
                                    <Badge variant={client.isActive ? 'success' : 'secondary'} className="uppercase text-[8px] font-semibold px-1.5 py-0 h-4 ml-auto lg:hidden">
                                        {client.isActive ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </div>
                                <h3 className={cn(dataTableCellPrimaryClassName, 'line-clamp-1')}>{getClientDisplayName(client)}</h3>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(dataTableActionButtonClassName, dataTableActionPrimaryClassName, 'bg-slate-100 dark:bg-slate-800')}
                                    onClick={() => onEdit(client)}
                                >
                                    <Pencil className={dataTableActionIconClassName} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(dataTableActionButtonClassName, dataTableActionDestructiveClassName, 'bg-slate-100 dark:bg-slate-800')}
                                    onClick={() => onDelete(client.id)}
                                >
                                    <Trash2 className={dataTableActionIconClassName} />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/70">
                            <div className="space-y-2">
                                <div className={cn('flex items-center gap-2 uppercase tracking-[0.08em]', dataTableCellSecondaryClassName)}>
                                    <Mail className="h-3 w-3 text-primary/60" /> Contacto
                                </div>
                                <div className="space-y-0.5">
                                    <p className={cn(dataTableCellPrimaryClassName, 'truncate')}>{client.email || '—'}</p>
                                    <p className={dataTableCellPrimaryClassName}>{client.phone || '—'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className={cn('flex items-center gap-2 uppercase tracking-[0.08em]', dataTableCellSecondaryClassName)}>
                                    <MapPin className="h-3 w-3 text-primary/60" /> Dirección
                                </div>
                                <p className={cn(dataTableCellPrimaryClassName, 'line-clamp-2 leading-relaxed')}>
                                    {client.address || <span className="opacity-40 font-medium">S/D</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <Users className="h-10 w-10 text-muted-foreground/20 mb-3" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">No se encontraron clientes</p>
                </div>
            )}
        </div>
    );
}
