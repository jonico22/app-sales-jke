import { Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Settings } from 'lucide-react';

export function POSMobileFooter() {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-8 py-3 flex justify-between items-center z-40 md:hidden">
            <Link to="/" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-[10px] font-medium">Inicio</span>
            </Link>
            <Link to="/pos/search" className="flex flex-col items-center gap-1 text-[#0ea5e9]">
                <ShoppingCart className="w-6 h-6" />
                <span className="text-[10px] font-medium">Ventas</span>
            </Link>
            <Link to="/inventory" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <Package className="w-6 h-6" />
                <span className="text-[10px] font-medium">Stock</span>
            </Link>
            <Link to="/settings" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <Settings className="w-6 h-6" />
                <span className="text-[10px] font-medium">Ajustes</span>
            </Link>
        </div>
    );
}
