import { useEffect } from 'react';
import { Store, Banknote } from 'lucide-react';
// import { type BranchOffice } from '@/services/branch-office.service';
// import { currencyService, type Currency } from '@/services/currency.service';
import { useCartStore } from '@/store/cart.store';
import { useBranchStore } from '@/store/branch.store';
import { useCurrencies } from '@/hooks/useCurrencies';

export function POSTopBar() {
    const currencyId = useCartStore(state => state.currencyId);
    const setCurrencyId = useCartStore(state => state.setCurrencyId);
    const branches = useBranchStore(state => state.branches);
    const selectedBranch = useBranchStore(state => state.selectedBranch);
    const selectBranch = useBranchStore(state => state.selectBranch);

    // No local state for selectedCurrency, use store
    const selectedCurrency = currencyId;

    const { data: currencies = [] } = useCurrencies();

    useEffect(() => {
        // Set default currency if loaded and none selected
        if (currencies.length > 0 && selectedCurrency === '1') {
            const defaultCurrency = currencies.find(c => c.code === 'PEN') || currencies[0];
            if (defaultCurrency) setCurrencyId(defaultCurrency.id);
        }
    }, [currencies, selectedCurrency, setCurrencyId]);

    // Fallback/Mock if empty (to match design immediately)
    const displayBranches = branches.length > 0 ? branches : [{ id: '1', name: 'Sede Principal', code: 'MAIN', isActive: true }];
    const displayCurrencies = currencies.length > 0 ? currencies : [{ id: '1', name: 'PEN', symbol: 'S/' }];


    return (
        <div className="flex gap-3 mb-6 md:hidden">
            {/* Branch Selector */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                    <Store className="w-4 h-4" />
                </div>
                <select
                    className="appearance-none bg-background border border-input text-foreground text-sm font-medium rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer shadow-sm min-w-[160px]"
                    value={selectedBranch?.id || ''}
                    onChange={(e) => {
                        const branch = displayBranches.find(b => b.id === e.target.value);
                        if (branch) selectBranch(branch);
                    }}
                >
                    {displayBranches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>

            {/* Currency Selector */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                    <Banknote className="w-4 h-4" />
                </div>
                <select
                    className="appearance-none bg-background border border-input text-foreground text-sm font-medium rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer shadow-sm min-w-[100px]"
                    value={selectedCurrency}
                    onChange={(e) => setCurrencyId(e.target.value)}
                >
                    {displayCurrencies.map(currency => (
                        <option key={currency.id} value={currency.id}>{currency.name || (currency as any).code || 'PEN'}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    );
}
