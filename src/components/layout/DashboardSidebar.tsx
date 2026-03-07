import { useLocation, Link } from 'react-router-dom';
import { LayoutGrid, ClipboardList, Users, ShoppingCart, FileText, Settings, LogOut, Package, Tags, ChevronDown, ChevronRight, Building2, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

// Define navigation items
const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutGrid },
  {
    name: 'Inventario', icon: ClipboardList,
    children: [
      { name: 'Productos', href: '/inventory' },
      { name: 'Categorías', href: '/categories', icon: Tags },
      { name: 'Manejador de Archivos', href: '/settings/files' },
    ]
  },
  {
    name: 'Ventas',
    icon: ShoppingCart,
    children: [
      { name: 'Puntos de Venta', href: '/pos' },
      { name: 'Pedidos Pendientes', href: '/orders/pending' },
    ]
  },
  //{ name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Usuarios', href: '/settings/users', icon: Users },
  {
    name: 'Reportes', icon: FileText,
    children: [
      { name: 'Histórico de Ventas', href: '/orders/history' },
      { name: 'Historial de Reportes', href: '/downloads' }
    ]
  },
  {
    name: 'Suscripción', icon: CreditCard,
    children: [
      { name: 'Suscripción y Facturación', href: '/settings/billing', icon: CreditCard },
      { name: 'Perfil del Negocio', href: '/settings', icon: Building2 },
    ]
  },
  {
    name: 'Configuración',
    icon: Settings,
    children: [
      { name: 'Mi Perfil', href: '/profile' },
      { name: 'Seguridad y Acceso', href: '/security' },
      { name: 'Notificaciones', href: '/notifications' }
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
  const { data: permissionData } = usePermissions();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Pedidos']); // Default expand Pedidos and Configuración for now
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number }>({ top: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Auto-expand menu when navigating directly to a child route (e.g., after login redirect)
  useEffect(() => {
    const parentMenu = navItems.find((item) =>
      item.children?.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`))
    );

    if (parentMenu) {
      setExpandedMenus((prev) =>
        prev.includes(parentMenu.name) ? prev : [...prev, parentMenu.name]
      );
    }
  }, [pathname]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close popover on navigation
  useEffect(() => {
    setActivePopover(null);
  }, [pathname]);

  const isBlocked = subscription?.status === 'EXPIRED' || subscription?.status === 'INACTIVE';

  // Map navItem names to module keys from backend
  const moduleMap: Record<string, string> = {
    'Dashboard': 'DASHBOARD',
    'Inventario': 'INVENTARIO',
    'Ventas': 'VENTAS',
    'Usuarios': 'USUARIOS',
    'Reportes': 'REPORTES',
    'Suscripción': 'SUSCRIPCION',
    'Configuración': 'CONFIGURACION'
  };

  const getPermittedNavItems = () => {
    // If blocked, only show Configuration -> Subscription
    if (isBlocked) {
      return navItems
        .filter((item) => item.name === 'Configuración')
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => child.name === 'Suscripción y Facturación'),
        }));
    }

    // Normal filtering based on permissions
    const modules = permissionData?.modules;
    if (!modules) return navItems; // Fallback entirely if no permissions loaded yet (or consider hiding all)

    return navItems.filter(item => {
      const moduleKey = moduleMap[item.name];
      if (!moduleKey) return true; // Show by default if not mapped
      return modules[moduleKey] === true;
    });
  };

  const displayNavItems = getPermittedNavItems();

  const toggleMenu = (name: string, event?: React.MouseEvent) => {
    if (isCollapsed) {
      if (activePopover === name) {
        setActivePopover(null);
      } else {
        // Calculate position
        const rect = event?.currentTarget.getBoundingClientRect();
        if (rect) {
          setPopoverPosition({ top: rect.top });
        }
        setActivePopover(name);
      }
      return;
    };
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
          "fixed top-0 left-0 z-30 h-full bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-border/50 cursor-pointer overflow-hidden whitespace-nowrap transition-all duration-300",
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
              "font-bold text-foreground text-lg tracking-tight ml-3 transition-opacity duration-300",
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
                    onClick={(e) => toggleMenu(item.name, e)}
                    className={cn(
                      "w-full flex items-center justify-between py-3 rounded-lg text-sm font-medium transition-colors uppercase tracking-wide group relative",
                      isCollapsed ? "justify-center px-0" : "px-3",
                      // Single item style for active/open collapsed items
                      (isCollapsed && (isActive || activePopover === item.name))
                        ? "bg-sky-50/50 dark:bg-sky-500/10 text-sky-600"
                        : isActive
                          ? "text-sky-600"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        (isActive || (isCollapsed && activePopover === item.name)) ? "text-sky-600" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "transition-all duration-300 whitespace-nowrap",
                        isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
                      )}>
                        {item.name}
                      </span>
                    </div>
                    {!isCollapsed && (
                      <div className="text-muted-foreground">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    )}

                    {/* Floating Popover for Collapsed State */}
                    {isCollapsed && activePopover === item.name && (
                      <div
                        ref={popoverRef}
                        className="fixed left-[84px] z-[100] bg-card border border-border shadow-2xl rounded-xl py-2 min-w-[200px] animate-in fade-in slide-in-from-left-2 duration-200"
                        style={{
                          top: `${popoverPosition.top}px`,
                        }}
                      >
                        <div className="px-4 py-3 border-b border-border/50 mb-1 flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-sky-600" />
                          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider whitespace-nowrap">{item.name}</span>
                        </div>
                        <div className="px-2 space-y-0.5">
                          {item.children?.map((child) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                to={child.href}
                                className={cn(
                                  "flex items-center px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors rounded-lg",
                                  isChildActive
                                    ? "text-sky-600 bg-sky-50 dark:bg-sky-500/10 font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                              >
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
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
                                ? "text-sky-600 bg-sky-50/50 dark:bg-sky-500/10 pl-3"
                                : "text-muted-foreground hover:text-foreground hover:pl-2"
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
                    ? "bg-sky-50/50 dark:bg-sky-500/10 text-sky-600"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => window.innerWidth < 768 && onClose()} // Close on mobile click
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-sky-600" : "text-muted-foreground")} />
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
            "p-4 border-t border-border/50",
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
                <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                  {user.name || 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {role?.name || 'Sin rol'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section (Logout) */}
        <div className="p-4 border-t border-border/50">
          <button
            onClick={() => logout()}
            className={cn(
              "flex items-center gap-3 py-3 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors uppercase tracking-wide",
              isCollapsed ? "justify-center px-0" : "px-3"
            )}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
