import { LayoutDashboard, ShoppingCart, Package, Settings } from 'lucide-react';

export function POSMobileFooter() {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-40 md:hidden">
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-sky-600 transition-colors">
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-[10px] font-medium">Dashboard</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-sky-600">
                <ShoppingCart className="w-6 h-6" />
                <span className="text-[10px] font-medium">Ventas</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-sky-600 transition-colors">
                <Package className="w-6 h-6" />
                <span className="text-[10px] font-medium">Inventario</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-sky-600 transition-colors">
                <Settings className="w-6 h-6" />
                <span className="text-[10px] font-medium">Ajustes</span>
            </button>
        </div>
    );
}
