import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, ClipboardList, Users, ShoppingCart, FileText, Settings, LogOut, Package, Tags, ChevronDown, ChevronRight, Building2, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Define navigation items
const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutGrid },
  {
    name: 'Inventario', icon: ClipboardList,
    children: [
      { name: 'Inventario', href: '/inventory' },
      { name: 'Categorías', href: '/categories', icon: Tags },
      { name: 'Manejador de Archivos', href: '/settings/files' },
    ]
  },
  {
    name: 'Pedidos',
    icon: ShoppingCart,
    children: [
      { name: 'Puntos de Venta', href: '/pos' },
      { name: 'Pedidos Pendientes', href: '/orders/pending' },
    ]
  },
  { name: 'Clientes', href: '/clients', icon: Users },
  {
    name: 'Reportes', icon: FileText,
    children: [
      { name: 'Histórico de Ventas', href: '/orders/history' },
      { name: 'Historial de Reportes', href: '/downloads' }
    ]
  },
  {
    name: 'Configuración',
    icon: Settings,
    children: [
      { name: 'Mi Perfil', href: '/profile' },
      { name: 'Usuarios y Accesos', href: '/settings/users', icon: Users },
      { name: 'Seguridad y Acceso', href: '/security' },
      { name: 'Perfil del Negocio', href: '/settings', icon: Building2 },
      { name: 'Suscripción y Facturación', href: '/settings/billing', icon: CreditCard },
    ]
  },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  showUserInfo?: boolean;
}

export default function DashboardSidebar({ isOpen, onClose, isCollapsed, toggleCollapse, showUserInfo = false }: DashboardSidebarProps) {
  const { pathname } = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const subscription = useAuthStore((state) => state.subscription);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Pedidos']); // Default expand Pedidos and Configuración for now

  const isBlocked = subscription?.status === 'EXPIRED' || subscription?.status === 'INACTIVE';

  const displayNavItems = isBlocked
    ? navItems
      .filter((item) => item.name === 'Configuración')
      .map((item) => ({
        ...item,
        children: item.children?.filter((child) => child.name === 'Suscripción y Facturación'),
      }))
    : navItems;

  const toggleMenu = (name: string) => {
    if (isCollapsed) return;
    setExpandedMenus(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

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
          {displayNavItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.includes(item.name);
            const isActive = pathname === item.href || (hasChildren && item.children?.some(child => pathname === child.href));

            if (hasChildren) {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => isCollapsed ? null : toggleMenu(item.name)}
                    className={cn(
                      "w-full flex items-center justify-between py-3 rounded-lg text-sm font-medium transition-colors uppercase tracking-wide group",
                      isCollapsed ? "justify-center px-0" : "px-3",
                      isActive
                        ? "text-sky-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-sky-600" : "text-slate-400")} />
                      <span className={cn(
                        "transition-all duration-300 whitespace-nowrap",
                        isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
                      )}>
                        {item.name}
                      </span>
                    </div>
                    {!isCollapsed && (
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    )}
                  </button>

                  {/* Submenu */}
                  <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    !isCollapsed && isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="pl-11 pr-3 space-y-1 py-1">
                      {item.children?.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={cn(
                              "block py-2 text-sm font-medium transition-colors rounded-lg",
                              isChildActive
                                ? "text-sky-600 bg-sky-50 pl-3"
                                : "text-slate-500 hover:text-slate-900 hover:pl-2"
                            )}
                            onClick={() => window.innerWidth < 768 && onClose()}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.href || item.name}
                to={item.href || '#'}
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

        {/* User Info Section */}
        {showUserInfo && user && (
          <div className={cn(
            "p-4 border-t border-slate-100",
            isCollapsed ? "flex justify-center" : ""
          )}>
            <div className={cn(
              "flex items-center gap-3",
              isCollapsed ? "justify-center" : ""
            )}>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              {/* User Details */}
              <div className={cn(
                "transition-all duration-300 whitespace-nowrap overflow-hidden",
                isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
              )}>
                <p className="text-sm font-semibold text-slate-700 truncate max-w-[140px]">
                  {user.name || 'Usuario'}
                </p>
                <p className="text-xs text-slate-400 truncate max-w-[140px]">
                  {role?.name || 'Sin rol'}
                </p>
              </div>
            </div>
          </div>
        )}

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
