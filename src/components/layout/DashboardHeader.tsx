import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, User, Settings, Moon, Sun, Monitor, Megaphone, HelpCircle, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import NotificationDropdown from './NotificationDropdown';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  hideMenu?: boolean;
}

export default function DashboardHeader({ onMenuClick, hideMenu = false }: DashboardHeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  // Fallback values if user isn't loaded yet or missing properties
  const userName = user?.name || user?.email?.split('@')[0] || 'Usuario';
  const userRole = role?.name || 'User';

  // Use a consistent avatar seed based on email or fallback
  const avatarSeed = user?.email || 'default';
  const avatarUrl = user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

  const getPageTitle = (path: string) => {
    if (path === '/' || path === '/dashboard') return 'DASHBOARD';

    // Inventario
    if (path.startsWith('/inventory')) return 'PRODUCTOS';
    if (path.startsWith('/categories')) return 'GESTIÓN DE CATEGORÍAS';

    // Ventas
    if (path.startsWith('/pos')) return 'PUNTO DE VENTA';
    if (path.startsWith('/orders/pending')) return 'PEDIDOS PENDIENTES';
    if (path.startsWith('/orders/history')) return 'HISTÓRICO DE VENTAS';
    if (path.startsWith('/sales')) return 'VENTAS';

    // Clientes & Usuarios
    if (path.startsWith('/clients')) return 'CLIENTES';

    // Reportes
    if (path.startsWith('/downloads')) return 'HISTORIAL DE REPORTES';
    if (path.startsWith('/reports')) return 'REPORTES';

    // Configuración (order matters: more specific first)
    if (path.startsWith('/settings/users')) return 'USUARIOS';
    if (path.startsWith('/settings/files')) return 'MANEJADOR DE ARCHIVOS';
    if (path.startsWith('/settings/billing')) return 'SUSCRIPCIÓN Y FACTURACIÓN';
    if (path.startsWith('/settings')) return 'PERFIL DEL NEGOCIO';
    if (path.startsWith('/profile')) return 'MI PERFIL';
    if (path.startsWith('/security')) return 'SEGURIDAD Y ACCESO';

    return 'JKE SOLUTIONS';
  };

  return (
    <header className="bg-card border-b border-border h-16 px-6 flex items-center justify-between sticky top-0 z-50 transition-colors">
      {/* Left: Title & Menu */}
      <div className="flex items-center gap-3">
        {!hideMenu && (
          <button
            type="button"
            className="md:hidden p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-foreground font-bold tracking-wider text-sm hidden sm:block">
          {getPageTitle(pathname)}
        </h1>
      </div>


      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <NotificationDropdown />

        {/* Divider */}
        <div className="h-8 w-px bg-border"></div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground leading-none">{userName}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">{userRole}</p>
            </div>

            <div className="relative">
              <img
                src={avatarUrl}
                alt={userName}
                className="h-9 w-9 rounded-full object-cover border-2 border-background shadow-sm ring-1 ring-border bg-muted"
              />
            </div>

            <ChevronDown className={`h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-popover rounded-xl shadow-lg border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-4 py-3 flex items-center gap-3 border-b border-border/60 mb-1">
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="h-10 w-10 rounded-full object-cover border border-border"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 transition-colors"
                >
                  <User className="h-4 w-4 text-muted-foreground" /> Mi Perfil
                </button>
                <button className="w-full px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 transition-colors">
                  <Settings className="h-4 w-4 text-muted-foreground" /> Configuración de Cuenta
                </button>
                <div className="w-full px-4 py-2.5 text-xs text-muted-foreground flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="h-4 w-4 text-muted-foreground/60" /> : <Sun className="h-4 w-4 text-muted-foreground/60" />}
                    Tema
                  </div>
                  <div className="bg-muted rounded-full p-0.5 flex items-center border border-border">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors ${theme === 'light' ? 'bg-background shadow-sm text-yellow-500' : ''}`}
                      title="Tema Claro"
                    >
                      <Sun className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors ${theme === 'system' ? 'bg-background shadow-sm text-primary' : ''}`}
                      title="Tema del Sistema"
                    >
                      <Monitor className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors ${theme === 'dark' ? 'bg-background shadow-sm text-indigo-500' : ''}`}
                      title="Tema Oscuro"
                    >
                      <Moon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border my-1"></div>

              {/* Footer */}
              <div className="py-1">
                <button className="w-full px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 transition-colors">
                  <Megaphone className="h-4 w-4 text-muted-foreground" /> Novedades
                </button>
                <button className="w-full px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 transition-colors">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" /> Centro de Ayuda
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-3 transition-colors mt-1 font-medium"
                >
                  <LogOut className="h-4 w-4" /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
