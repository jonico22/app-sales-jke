interface BillingHistoryTabsProps {
  activeTab: 'history' | 'billing';
  onTabChange: (tab: 'history' | 'billing') => void;
}

export function BillingHistoryTabs({
  activeTab,
  onTabChange
}: BillingHistoryTabsProps) {
  return (
    <div className="flex border-b border-border px-4 sm:px-6 pt-2 overflow-x-auto no-scrollbar scroll-smooth">
      <button
        onClick={() => onTabChange('history')}
        className={`px-4 py-3 text-[10px] sm:text-xs font-black inline-flex items-center gap-2 uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        Historial de Suscripciones
      </button>
      <button
        onClick={() => onTabChange('billing')}
        className={`px-4 py-3 text-[10px] sm:text-xs font-black inline-flex items-center gap-2 uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === 'billing' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        Historial de Facturación
      </button>
    </div>
  );
}
