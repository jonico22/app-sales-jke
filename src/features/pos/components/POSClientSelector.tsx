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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                Cliente
            </label>
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        <User className="h-5 w-5 text-sky-500" />
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-full h-12 pl-10 pr-10 text-left bg-white border rounded-xl font-medium transition-all flex items-center justify-between
                            ${isOpen ? 'border-sky-500 ring-2 ring-sky-100' : 'border-slate-200 hover:border-slate-300'}
                        `}
                    >
                        <span className="text-slate-700 truncate">
                            {isLoading ? 'Cargando clientes...' : (selectedClient ? selectedClient.name : 'Seleccionar cliente...')}
                        </span>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        ) : (
                            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        )}
                    </button>

                    {/* Dropdown Content */}
                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">

                            {/* Search Input */}
                            <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-400"
                                        placeholder="Buscar cliente..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Options List */}
                            <div className="max-h-60 overflow-y-auto overflow-x-hidden p-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {filteredClients.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                                        {searchTerm ? 'No se encontraron resultados' : 'No hay clientes disponibles'}
                                    </div>
                                ) : (
                                    filteredClients.map((client) => (
                                        <button
                                            key={client.id}
                                            onClick={() => handleSelect(client)}
                                            className={`w-full px-3 py-2.5 flex items-start gap-3 rounded-lg text-left transition-colors group mb-0.5
                                                ${selectedClient?.id === client.id ? 'bg-sky-50' : 'hover:bg-slate-50'}
                                            `}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`text-sm font-semibold truncate ${selectedClient?.id === client.id ? 'text-sky-700' : 'text-slate-700'}`}>
                                                        {client.name}
                                                    </span>
                                                    {selectedClient?.id === client.id && (
                                                        <Check className="h-4 w-4 text-sky-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] uppercase font-medium text-slate-400 group-hover:text-slate-500">
                                                    DOCUMENTO - {client.documentNumber}
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Footer Action */}
                            <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                                <button
                                    onClick={onNewClient}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
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
                    className="h-12 w-12 bg-cyan-500 hover:bg-cyan-600 rounded-xl"
                    title="Nuevo Cliente"
                    onClick={onNewClient}
                >
                    <UserPlus className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
