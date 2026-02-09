import { LayoutGrid, ChevronRight } from 'lucide-react';

interface POSCatalogButtonProps {
    onClick?: () => void;
}

export function POSCatalogButton({ onClick }: POSCatalogButtonProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 bg-cyan-50 hover:bg-cyan-100 rounded-xl border border-cyan-100 transition-colors group cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <LayoutGrid className="h-5 w-5 text-cyan-600" />
                <div className="text-left">
                    <p className="text-sm font-bold text-cyan-700 uppercase tracking-wide">Ver Catálogo Completo</p>
                    <p className="text-xs text-cyan-600/70">Ideal para pedidos grandes y navegación visual</p>
                </div>
            </div>
            <ChevronRight className="h-5 w-5 text-cyan-600 group-hover:translate-x-1 transition-transform" />
        </button>
    );
}
