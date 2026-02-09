import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Package, BarChart3, Menu, Plus } from 'lucide-react';

interface NavItemProps {
  to?: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ to, icon, label, isActive, onClick }: NavItemProps) {
  const content = (
    <>
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
    </>
  );

  const className = `flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors cursor-pointer ${isActive ? 'text-[#0ea5e9]' : 'text-slate-400'
    }`;

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} onClick={onClick}>
      {content}
    </div>
  );
}

interface MobileNavFooterProps {
  onMenuClick?: () => void;
}

export function MobileNavFooter({ onMenuClick }: MobileNavFooterProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
      <div className="flex items-end justify-around px-2 pb-safe">
        {/* Left Items */}
        <NavItem
          to="/"
          icon={<LayoutGrid className="h-5 w-5" />}
          label="Inicio"
          isActive={currentPath === '/'}
        />
        <NavItem
          to="/inventory"
          icon={<Package className="h-5 w-5" />}
          label="Stock"
          isActive={currentPath.startsWith('/inventory')}
        />

        {/* Center Floating Button */}
        <div className="flex flex-col items-center -mt-6">
          <Link
            to="/pos"
            className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white p-4 rounded-full shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </Link>
          <span className="text-[10px] font-medium uppercase tracking-wide text-[#0ea5e9] mt-1">Venta</span>
        </div>

        {/* Right Items */}
        <NavItem
          to="/orders/history"
          icon={<BarChart3 className="h-5 w-5" />}
          label="Pedidos"
          isActive={currentPath.startsWith('/orders')}
        />
        <NavItem
          icon={<Menu className="h-5 w-5" />}
          label="Más"
          isActive={false}
          onClick={onMenuClick}
        />
      </div>
    </nav>
  );
}
