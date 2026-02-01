import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, ClipboardList, Users, ShoppingCart, FileText, Settings, LogOut, Package, Tags } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

// Define navigation items
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { name: 'Inventario', href: '/inventory', icon: ClipboardList },
  { name: 'Categorías', href: '/categories', icon: Tags },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Ventas', href: '/sales', icon: ShoppingCart },
  { name: 'Reportes', href: '/reports', icon: FileText },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function DashboardSidebar({ isOpen, onClose, isCollapsed, toggleCollapse }: DashboardSidebarProps) {
  const { pathname } = useLocation();
  const logout = useAuthStore((state) => state.logout);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-30 h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div 
          className={cn(
            "h-16 flex items-center border-b border-slate-100 cursor-pointer overflow-hidden whitespace-nowrap transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "px-6"
          )}
          onClick={toggleCollapse}
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          <div className="bg-[#0ea5e9] p-1.5 rounded-md flex-shrink-0">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span 
            className={cn(
              "font-bold text-slate-700 text-lg tracking-tight ml-3 transition-opacity duration-300",
              isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
            )}
          >
            JKE SOLUTIONS
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 py-3 rounded-lg text-sm font-medium transition-colors uppercase tracking-wide",
                  isCollapsed ? "justify-center px-0" : "px-3",
                  isActive 
                    ? "bg-sky-50 text-sky-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={() => window.innerWidth < 768 && onClose()} // Close on mobile click
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-sky-600" : "text-slate-400")} />
                <span className={cn(
                  "transition-all duration-300 whitespace-nowrap",
                  isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section (Logout) */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => logout()}
            className={cn(
              "flex items-center gap-3 py-3 w-full rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors uppercase tracking-wide",
              isCollapsed ? "justify-center px-0" : "px-3"
            )}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <span className={cn(
              "transition-all duration-300 whitespace-nowrap",
              isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
            )}>
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
