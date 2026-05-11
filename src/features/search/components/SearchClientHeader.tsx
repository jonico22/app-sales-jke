import { memo } from 'react';
import { User } from 'lucide-react';
import type { ClientSelectOption } from '@/services/client.service';

interface SearchClientHeaderProps {
    selectedClient: ClientSelectOption | null;
    onChangeClient: () => void;
}

export const SearchClientHeader = memo(function SearchClientHeader({ selectedClient, onChangeClient }: SearchClientHeaderProps) {
    return (
        <div className="px-4 md:px-6 py-1">
            <div className="flex items-center justify-between gap-2 bg-card/50 px-4 py-2 rounded-xl border border-border/50 transition-colors">
                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    <User className="w-[12px] h-[12px] text-muted-foreground shrink-0" />
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">CLIENTE:</span>
                        <span className="text-[12px] font-black text-foreground truncate uppercase min-w-0">
                            {selectedClient?.name || 'Público General'}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onChangeClient}
                    className="text-[10px] font-bold text-[#4096d8] dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all uppercase tracking-tight bg-card border border-[#4096d8]/30 px-2.5 py-1 rounded-[10px] shadow-sm whitespace-nowrap shrink-0"
                >
                    CAMBIAR
                </button>
            </div>
        </div>
    );
});
