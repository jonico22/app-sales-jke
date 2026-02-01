import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, Settings, Moon, Sun, Megaphone, HelpCircle, LogOut, Menu, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Input } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
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

  return (
    <header className="bg-white border-b border-muted py-3 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left: Title & Menu */}
      <div className="flex items-center gap-3">
        <button 
          className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-foreground font-bold tracking-wider text-sm hidden sm:block">DASHBOARD</h1>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xl mx-8 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Buscar productos, ventas o clientes..." 
            className="pl-9 pr-12 w-full bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm placeholder:text-muted-foreground/70"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 border border-slate-200 rounded px-1.5 py-0.5 bg-white">
            <span className="text-[10px] font-medium text-slate-400">⌘K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="relative text-slate-500 hover:text-slate-700 transition-colors pt-1"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4"></span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
               {/* Header */}
               <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
                 <h3 className="font-bold text-slate-800 text-sm">Notificaciones</h3>
                 <button className="text-[10px] font-bold text-[#0ea5e9] hover:text-sky-700 uppercase tracking-wide">
                   Marcar todas como leídas
                 </button>
               </div>

               {/* List */}
               <div className="max-h-[300px] overflow-y-auto">
                 {/* Item 1: Low Stock */}
                 <div className="px-4 py-3 border-b border-slate-100/60 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-3">
                   <div className="bg-orange-50 p-2 rounded-full h-fit flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                     <AlertTriangle className="h-5 w-5 text-orange-500" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start mb-0.5">
                       <p className="text-sm font-semibold text-slate-800 truncate pr-2">Stock Bajo: Mouse Ergonómico</p>
                       <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5"></span>
                     </div>
                     <p className="text-xs text-slate-500 mb-1.5 line-clamp-2">Quedan solo 3 unidades en inventario.</p>
                     <p className="text-[10px] text-slate-400 font-medium">Hace 2 min</p>
                   </div>
                 </div>

                 {/* Item 2: Sale */}
                 <div className="px-4 py-3 border-b border-slate-100/60 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-3">
                   <div className="bg-green-50 p-2 rounded-full h-fit flex-shrink-0 group-hover:bg-green-100 transition-colors">
                     <CheckCircle2 className="h-5 w-5 text-green-500" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start mb-0.5">
                       <p className="text-sm font-semibold text-slate-800 truncate pr-2">Venta Realizada: Ticket #1025</p>
                     </div>
                     <p className="text-xs text-slate-500 mb-1.5 line-clamp-2">Venta confirmada por $1,250.00.</p>
                     <p className="text-[10px] text-slate-400 font-medium">Hace 15 min</p>
                   </div>
                 </div>

                 {/* Item 3: Info */}
                 <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-3">
                   <div className="bg-blue-50 p-2 rounded-full h-fit flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                     <Info className="h-5 w-5 text-blue-500" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start mb-0.5">
                       <p className="text-sm font-semibold text-slate-800 truncate pr-2">Reporte Mensual Listo</p>
                     </div>
                     <p className="text-xs text-slate-500 mb-1.5 line-clamp-2">Tu reporte de ventas está disponible.</p>
                     <p className="text-[10px] text-slate-400 font-medium">Hace 3 horas</p>
                   </div>
                 </div>
               </div>

               {/* Footer */}
               <div className="px-4 py-3 bg-slate-50/50 text-center border-t border-slate-100">
                 <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                   Ver todas las notificaciones
                 </button>
               </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200"></div>

        {/* Profile */}
        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-slate-700 leading-none">{userName}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{userRole}</p>
            </div>
            
            <div className="relative">
              <img 
                src={avatarUrl} 
                alt={userName} 
                className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-100 bg-slate-100"
              />
            </div>
            
            <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100/60 mb-1">
                <img 
                  src={avatarUrl} 
                  alt={userName} 
                  className="h-10 w-10 rounded-full object-cover border border-slate-200"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button className="w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3 transition-colors">
                  <User className="h-4 w-4 text-slate-400" /> Mi Perfil
                </button>
                <button className="w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3 transition-colors">
                  <Settings className="h-4 w-4 text-slate-400" /> Configuración de Cuenta
                </button>
                <div className="w-full px-4 py-2.5 text-sm text-slate-600 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Moon className="h-4 w-4 text-slate-400" /> Tema
                  </div>
                  <div className="bg-slate-100 rounded-full p-0.5 flex items-center border border-slate-200">
                    <button className="p-1 rounded-full bg-white shadow-sm text-yellow-500"><Sun className="h-3 w-3" /></button>
                    <button className="p-1 rounded-full text-slate-400 hover:text-slate-600"><Moon className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-1"></div>

              {/* Footer */}
              <div className="py-1">
                <button className="w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3 transition-colors">
                  <Megaphone className="h-4 w-4 text-slate-400" /> Novedades
                </button>
                <button className="w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3 transition-colors">
                  <HelpCircle className="h-4 w-4 text-slate-400" /> Centro de Ayuda
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors mt-1"
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
