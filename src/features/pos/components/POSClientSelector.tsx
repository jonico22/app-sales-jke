import { useState, useEffect, useRef } from 'react';
import { User, UserPlus, ChevronDown, Check, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { type ClientSelectOption } from '@/services/client.service';
import { useClients } from '@/hooks/useClients';

interface POSClientSelectorProps {
    selectedClient: ClientSelectOption | null;
    onSelectClient: (client: ClientSelectOption) => void;
    onNewClient?: () => void;
}

export function POSClientSelector({
    selectedClient,
    onSelectClient,
    onNewClient
}: POSClientSelectorProps) {

    const { data: clients = [], isLoading } = useClients();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Set default client once loaded if none selected
    useEffect(() => {
        if (!isLoading && clients.length > 0 && (!selectedClient || selectedClient.id === 'public')) {
            // Try to find "Público General" or take first
            // Only set if we don't have a valid selected client (mock 'public' is considered invalid/placeholder here for initial load)
            // But wait, if selectedClient is passed as prop, we should respect it?
            // The original logic was: "If no client is selected (or only mock default), try to find..."
            // We should maintain that behavior but be careful not to override if user selected someone else.

            // Actually, selectedClient is controlled by parent. We should only trigger this if parent passes null or 'public' AND we haven't done it yet?
            // The previous effect ran ONCE on mount.
            // We can replicate "run once when data matches"

            const defaultClient = clients.find(c => c.name === 'PÚBLICO GENERAL') || clients[0];
            if (defaultClient && selectedClient?.id === 'public') {
                onSelectClient(defaultClient);
            }
        }
    }, [clients, isLoading]);
    // Note: removed selectedClient from deps to avoid loop if onSelectClient changes ID but we check against 'public'

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const filteredClients = clients.filter(client =>
        (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.documentNumber || '').includes(searchTerm)
    );

    const handleSelect = (client: ClientSelectOption) => {
        onSelectClient(client);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div ref={dropdownRef} className="relative w-full">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">
                Cliente
            </label>
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        <User className="h-5 w-5 text-primary" />
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-full h-12 pl-10 pr-10 text-left bg-background border rounded-xl font-medium transition-all flex items-center justify-between
                            ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-input hover:border-border'}
                        `}
                    >
                        <span className="text-foreground truncate">
                            {isLoading ? 'Cargando clientes...' : (selectedClient ? selectedClient.name : 'Seleccionar cliente...')}
                        </span>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        )}
                    </button>

                    {/* Dropdown Content */}
                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">

                            {/* Search Input */}
                            <div className="p-3 border-b border-border bg-muted/50">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                                        placeholder="Buscar cliente..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Options List */}
                            <div className="max-h-60 overflow-y-auto overflow-x-hidden p-1.5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                {filteredClients.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        {searchTerm ? 'No se encontraron resultados' : 'No hay clientes disponibles'}
                                    </div>
                                ) : (
                                    filteredClients.map((client) => (
                                        <button
                                            key={client.id}
                                            onClick={() => handleSelect(client)}
                                            className={`w-full px-3 py-2.5 flex items-start gap-3 rounded-lg text-left transition-colors group mb-0.5
                                                ${selectedClient?.id === client.id ? 'bg-primary/10' : 'hover:bg-muted'}
                                            `}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`text-sm font-semibold truncate ${selectedClient?.id === client.id ? 'text-primary' : 'text-foreground'}`}>
                                                        {client.name}
                                                    </span>
                                                    {selectedClient?.id === client.id && (
                                                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] uppercase font-medium text-muted-foreground group-hover:text-foreground">
                                                    DOCUMENTO - {client.documentNumber}
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Footer Action */}
                            <div className="p-2 border-t border-border bg-muted/50">
                                <button
                                    onClick={onNewClient}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Agregar cliente
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    variant="primary"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    title="Nuevo Cliente"
                    onClick={onNewClient}
                >
                    <UserPlus className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
