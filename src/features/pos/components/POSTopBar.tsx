import { useEffect } from 'react';
import { Store, Banknote } from 'lucide-react';
// import { type BranchOffice } from '@/services/branch-office.service';
// import { currencyService, type Currency } from '@/services/currency.service';
import { useCartStore } from '@/store/cart.store';
import { useBranches } from '@/hooks/useBranches';
import { useCurrencies } from '@/hooks/useCurrencies';

export function POSTopBar() {
    const { data: branches = [] } = useBranches();
    const { data: currencies = [] } = useCurrencies();

    const { branchId, setBranchId, currencyId, setCurrencyId } = useCartStore();

    // No local state for selectedBranch/Currency, use store
    const selectedBranch = branchId;
    const selectedCurrency = currencyId;

    useEffect(() => {
        // Set default branch if loaded and none selected
        if (branches.length > 0 && selectedBranch === '1') {
            setBranchId(branches[0].id);
        }
    }, [branches, selectedBranch, setBranchId]);

    useEffect(() => {
        // Set default currency if loaded and none selected
        if (currencies.length > 0 && selectedCurrency === '1') {
            const defaultCurrency = currencies.find(c => c.code === 'PEN') || currencies[0];
            if (defaultCurrency) setCurrencyId(defaultCurrency.id);
        }
    }, [currencies, selectedCurrency, setCurrencyId]);

    // Fallback/Mock if empty (to match design immediately)
    const displayBranches = branches.length > 0 ? (branches as any[]) : [{ id: '1', name: 'Sede Principal' }];
    const displayCurrencies = currencies.length > 0 ? currencies : [{ id: '1', name: 'PEN', symbol: 'S/' }];


    return (
        <div className="flex gap-3 mb-6 md:hidden">
            {/* Branch Selector */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none">
                    <Store className="w-4 h-4" />
                </div>
                <select
                    className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-sm min-w-[160px]"
                    value={selectedBranch}
                    onChange={(e) => setBranchId(e.target.value)}
                >
                    {displayBranches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>

            {/* Currency Selector */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none">
                    <Banknote className="w-4 h-4" />
                </div>
                <select
                    className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-sm min-w-[100px]"
                    value={selectedCurrency}
                    onChange={(e) => setCurrencyId(e.target.value)}
                >
                    {displayCurrencies.map(currency => (
                        <option key={currency.id} value={currency.id}>{currency.name || (currency as any).code || 'PEN'}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    );
}
