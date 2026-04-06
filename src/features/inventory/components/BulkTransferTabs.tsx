import { LayoutGrid, PackageSearch } from 'lucide-react';

interface BulkTransferTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function BulkTransferTabs({ activeTab, onTabChange }: BulkTransferTabsProps) {
    return (
        <div className="flex justify-center">
            <div className="bg-muted/40 p-1 rounded-2xl border border-border/60 flex gap-1">
                <button
                    onClick={() => onTabChange('total')}
                    className={`flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
                        activeTab === 'total'
                            ? 'bg-card shadow-md text-primary border border-border'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                >
                    <LayoutGrid className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="truncate">Completo</span>
                </button>
                <button
                    onClick={() => onTabChange('selection')}
                    className={`flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
                        activeTab === 'selection'
                            ? 'bg-card shadow-md text-primary border border-border'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                >
                    <PackageSearch className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="truncate">Selección</span>
                </button>
            </div>
        </div>
    );
}
