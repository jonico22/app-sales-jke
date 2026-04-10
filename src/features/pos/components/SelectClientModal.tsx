import { memo, useState, useRef, useEffect, useMemo, useDeferredValue } from 'react';
import { Modal } from '@/components/ui/Modal';
import { UserPlus, Check, Search, Loader2 } from 'lucide-react';
import { type ClientSelectOption } from '@/services/client.service';
import { useClients } from '@/hooks/useClients';

interface SelectClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedClient: ClientSelectOption | null;
    onSelectClient: (client: ClientSelectOption) => void;
    onNewClient: () => void;
}

export const SelectClientModal = memo(function SelectClientModal({
    isOpen,
    onClose,
    selectedClient,
    onSelectClient,
    onNewClient
}: SelectClientModalProps) {
    const { data: clients = [], isLoading } = useClients();
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const deferredSearchTerm = useDeferredValue(searchTerm);

    // Focus search input when modal opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    const normalizedSearchTerm = useMemo(
        () => deferredSearchTerm.trim().toLowerCase(),
        [deferredSearchTerm]
    );

    const filteredClients = useMemo(() => {
        if (!normalizedSearchTerm) {
            return clients;
        }

        return clients.filter(client =>
            (client.name || '').toLowerCase().includes(normalizedSearchTerm) ||
            (client.documentNumber || '').includes(normalizedSearchTerm)
        );
    }, [clients, normalizedSearchTerm]);

    const handleSelect = (client: ClientSelectOption) => {
        onSelectClient(client);
        setSearchTerm('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Cliente" size="md">
            <div className="flex flex-col h-[min(500px,70vh)] sm:h-[500px]">
                {/* Search Input */}
                <div className="p-3 sm:p-4 border-b border-border bg-background shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="w-full pl-10 pr-4 py-3 text-sm bg-muted/30 border border-input rounded-xl focus:outline-none focus:border-[#4096d8] focus:ring-1 focus:ring-[#4096d8] placeholder:text-muted-foreground"
                            placeholder="Buscar cliente por nombre o documento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Options List */}
                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-[#4096d8]" />
                            <span className="text-sm font-medium">Cargando clientes...</span>
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-center text-sm text-muted-foreground">
                            {searchTerm ? 'No se encontraron resultados' : 'No hay clientes disponibles'}
                        </div>
                    ) : (
                        filteredClients.map((client) => (
                            <button
                                key={client.id}
                                onClick={() => handleSelect(client)}
                                className={`w-full px-4 py-3 flex items-start gap-3 rounded-xl text-left transition-colors group mb-1
                                    ${selectedClient?.id === client.id ? 'bg-[#4096d8]/10 ring-1 ring-[#4096d8]' : 'hover:bg-muted border border-transparent'}
                                `}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={`text-[15px] font-semibold truncate ${selectedClient?.id === client.id ? 'text-[#4096d8]' : 'text-foreground'}`}>
                                            {client.name}
                                        </span>
                                        {selectedClient?.id === client.id && (
                                            <Check className="h-5 w-5 text-[#4096d8] flex-shrink-0" />
                                        )}
                                    </div>
                                    <span className="text-xs uppercase font-medium tracking-[0.12em] text-muted-foreground group-hover:text-foreground">
                                        DOCUMENTO - {client.documentNumber}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-3 sm:p-4 border-t border-border bg-background shrink-0">
                    <button
                        onClick={() => {
                            onClose();
                            onNewClient();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white bg-[#4096d8] hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-[#4096d8]/20 active:scale-95"
                    >
                        <UserPlus className="h-5 w-5" />
                        Agregar Nuevo Cliente
                    </button>
                </div>
            </div>
        </Modal>
    );
});
