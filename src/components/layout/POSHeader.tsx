import { useState, useEffect } from 'react';
import { Building2, Coins, Bell, ChevronDown } from 'lucide-react';
import { useSocietyStore } from '@/store/society.store';
import { useBranchStore } from '@/store/branch.store';
import { branchOfficeService, type BranchOfficeSelectOption } from '@/services/branch-office.service';

interface POSHeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function POSHeader({ title = 'Punto de Venta', onMenuClick }: POSHeaderProps) {
  const society = useSocietyStore((state) => state.society);
  const { branches, selectedBranch, setBranches, selectBranch } = useBranchStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchOfficeService.getForSelect();
        setBranches(response.data || []);
        // Auto-select first branch if none selected
        if (!selectedBranch && response.data?.length > 0) {
          selectBranch(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    if (branches.length === 0) {
      fetchBranches();
    }
  }, [branches.length, selectedBranch, setBranches, selectBranch]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSelectBranch = (branch: BranchOfficeSelectOption) => {
    selectBranch(branch);
    setIsDropdownOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6">
      {/* Left Section - Title */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
      </div>

      {/* Center Section - Branch & Currency */}
      <div className="hidden md:flex items-center gap-6">
        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Building2 className="h-4 w-4 text-slate-400" />
            <div className="text-left">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Sucursal</p>
              <p className="text-sm font-semibold text-slate-700">
                {selectedBranch?.name || 'Seleccionar...'}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-100 z-20 py-1">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => handleSelectBranch(branch)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                      selectedBranch?.id === branch.id ? 'bg-sky-50 text-sky-600' : 'text-slate-700'
                    }`}
                  >
                    {branch.name}
                  </button>
                ))}
                {branches.length === 0 && (
                  <p className="px-4 py-2 text-sm text-slate-400">Sin sucursales</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Currency Info */}
        {society?.mainCurrency && (
          <div className="flex items-center gap-2 px-3 py-2">
            <Coins className="h-4 w-4 text-slate-400" />
            <div className="text-left">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Moneda</p>
              <p className="text-sm font-semibold text-slate-700">
                {society.mainCurrency.name} ({society.mainCurrency.code})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Section - Date/Time & Notifications */}
      <div className="flex items-center gap-4">
        {/* Date & Time */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-700">{formatDate(currentTime)}</p>
          <p className="text-xs text-slate-400">{formatTime(currentTime)}</p>
        </div>

        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors relative">
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
