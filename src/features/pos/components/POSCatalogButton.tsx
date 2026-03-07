import { LayoutGrid, ChevronRight } from 'lucide-react';

interface POSCatalogButtonProps {
    onClick?: () => void;
}

export function POSCatalogButton({ onClick }: POSCatalogButtonProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 bg-primary/10 hover:bg-primary/20 rounded-xl border border-primary/20 transition-colors group cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <div className="text-left">
                    <p className="text-sm font-bold text-primary uppercase tracking-wide">Ver Catálogo Completo</p>
                    <p className="text-xs text-primary/70">Ideal para pedidos grandes y navegación visual</p>
                </div>
            </div>
            <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
        </button>
    );
}
