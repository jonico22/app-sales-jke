import { useState, useEffect } from 'react';
import { Banknote, ChevronDown, Check, RefreshCw, TrendingUp } from 'lucide-react';
import { type CurrencySelectOption } from '@/services/currency.service';
import { useCurrencies } from '@/hooks/useCurrencies';
import { useCartStore } from '@/store/cart.store';

export function CurrencySelector() {
    const { data: currencies = [] } = useCurrencies();
    const { currencyId, setCurrencyId } = useCartStore();
    const [isOpen, setIsOpen] = useState(false);

    // Derive selected currency from store ID
    const selectedCurrency = currencies.find(c => c.id === currencyId) || null;

    useEffect(() => {
        // Set default currency if loaded and none selected
        // Assuming '1' is the default mock ID or we want to pick the first one/PEN
        if (currencies.length > 0 && (!currencyId || currencyId === '1')) {
            const defaultCurrency = currencies.find(c => c.code === 'PEN') || currencies[0];
            if (defaultCurrency && defaultCurrency.id !== currencyId) {
                setCurrencyId(defaultCurrency.id);
            }
        }
    }, [currencies, currencyId, setCurrencyId]);

    const handleSelectCurrency = (currency: CurrencySelectOption) => {
        setCurrencyId(currency.id);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 border border-input rounded-xl hover:bg-muted transition-colors bg-background shadow-sm"
            >
                <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Banknote className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">MONEDA</p>
                    <p className="text-sm font-bold text-foreground leading-none">
                        {selectedCurrency ? `${selectedCurrency.name} (${selectedCurrency.code})` : 'Seleccionar...'}
                    </p>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-72 bg-card rounded-xl shadow-xl border border-border z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {/* Currencies List */}
                        <div className="p-2 space-y-1">
                            {currencies.map((currency) => (
                                <button
                                    key={currency.id}
                                    onClick={() => handleSelectCurrency(currency)}
                                    className={`w-full px-4 py-3 flex items-start gap-3 rounded-lg transition-colors group ${selectedCurrency?.id === currency.id ? 'bg-primary/10' : 'hover:bg-muted'
                                        }`}
                                >
                                    <div className={`mt-0.5 p-1.5 rounded-lg ${selectedCurrency?.id === currency.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:text-foreground'}`}>
                                        <Banknote className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm font-semibold ${selectedCurrency?.id === currency.id ? 'text-primary' : 'text-foreground'}`}>
                                                {currency.name} ({currency.code})
                                            </p>
                                            {selectedCurrency?.id === currency.id && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Exchange Rate Section */}
                        <div className="border-t border-border p-4 bg-muted/50">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">TIPO DE CAMBIO</p>
                                <button className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wide">
                                    ACTUALIZAR TC
                                    <RefreshCw className="h-3 w-3" />
                                </button>
                            </div>

                            <div className="bg-background border border-border rounded-lg p-3 flex items-center gap-3">
                                <div className="bg-muted p-1.5 rounded-md">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                    1 USD = S/ 3.75
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
