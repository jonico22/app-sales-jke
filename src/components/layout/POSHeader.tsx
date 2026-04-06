import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ChevronDown, Check } from 'lucide-react';
import { useBranchStore } from '@/store/branch.store';
import { type BranchOfficeSelectOption } from '@/services/branch-office.service';
import { useBranches } from '@/hooks/useBranches';
import { CurrencySelector } from './CurrencySelector';
import NotificationDropdown from '@/components/layout/NotificationDropdown';

interface POSHeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function POSHeader({ title = 'Punto de Venta', onMenuClick }: POSHeaderProps) {
  const navigate = useNavigate();
  const { data: branchesData = [] } = useBranches();
  const { branches, selectedBranch, setBranches, selectBranch } = useBranchStore();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Sync branches from query to store - ONLY if store is empty
  useEffect(() => {
    if (branchesData.length > 0 && (branches.length === 0 || branches.length !== branchesData.length)) {
      setBranches(branchesData);

      // Also set default branch if none selected
      if (!selectedBranch) {
        selectBranch(branchesData[0]);
      }
    }
  }, [branchesData, setBranches]); // Only re-run when source data changes

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
    setIsBranchDropdownOpen(false);
  };

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-2 md:px-6 relative z-50">
      {/* Left Section - Title */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground shrink-0"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-sm md:text-xl font-bold text-foreground shrink-0">
          <span className="hidden md:inline">{title}</span>
          <span className="md:hidden">POS</span>
        </h1>
      </div>

      {/* Center Section - Branch & Currency */}
      <div className="flex items-center gap-2 md:gap-4 justify-end flex-1 md:flex-none pr-1 md:pr-0 min-w-0">
        {/* Branch Selector */}
        <div className="relative shrink-0 max-w-[120px] sm:max-w-[140px] md:max-w-none">
          <button
            type="button"
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-1.5 md:py-2 border border-input rounded-lg md:rounded-xl hover:bg-muted transition-colors bg-background shadow-sm w-full h-[36px] md:h-auto"
          >
            <div className="bg-primary/10 p-1 md:p-1.5 rounded-md md:rounded-lg shrink-0">
              <Store className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
            </div>
            <div className="text-left min-w-0">
              <p className="hidden md:block text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">SUCURSAL</p>
              <p className="text-[11px] md:text-sm font-bold text-foreground leading-none truncate">
                {selectedBranch?.name || '---'}
              </p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0 transition-transform ${isBranchDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isBranchDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsBranchDropdownOpen(false)} />
              <div className="absolute top-full right-0 md:left-0 mt-2 w-64 md:w-72 bg-card rounded-xl shadow-xl border border-border z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2 space-y-1">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => handleSelectBranch(branch)}
                      className={`w-full px-3 md:px-4 py-2.5 md:py-3 flex items-start gap-3 rounded-lg transition-colors group ${selectedBranch?.id === branch.id ? 'bg-primary/10' : 'hover:bg-muted'
                        }`}
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg ${selectedBranch?.id === branch.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:text-foreground'}`}>
                        <Store className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-semibold ${selectedBranch?.id === branch.id ? 'text-primary' : 'text-foreground'}`}>
                            {branch.name}
                          </p>
                          {selectedBranch?.id === branch.id && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/inventory/branches');
                      setIsBranchDropdownOpen(false);
                    }}
                    className="w-full text-center text-xs font-bold text-primary py-3 uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-muted transition-colors rounded-lg"
                  >
                    Gestionar Sucursales
                    <ChevronDown className="h-3 w-3 -rotate-90" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Currency Selector */}
        <div className="shrink-0 max-w-[80px] md:max-w-none">
          <CurrencySelector />
        </div>
      </div>

      {/* Right Section - Date/Time & Notifications */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-bold text-foreground">{formatDate(currentTime)}</p>
          <p className="text-xs font-medium text-muted-foreground">{formatTime(currentTime)}</p>
        </div>

        <NotificationDropdown />
      </div>
    </header>
  );
}
