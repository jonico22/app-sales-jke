import { useState, useEffect } from 'react';
import { Banknote, ChevronDown, Check, RefreshCw, TrendingUp } from 'lucide-react';
import { currencyService, type CurrencySelectOption } from '@/services/currency.service';

export function CurrencySelector() {
    const [currencies, setCurrencies] = useState<CurrencySelectOption[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencySelectOption | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await currencyService.getForSelect();
                setCurrencies(response.data || []);
                if (response.data?.length > 0) {
                    // Try to find PEN or USD as default, otherwise first one
                    const defaultCurrency = response.data.find(c => c.code === 'PEN') || response.data[0];
                    setSelectedCurrency(defaultCurrency);
                }
            } catch (error) {
                console.error('Error fetching currencies:', error);
            }
        };

        fetchCurrencies();
    }, []);

    const handleSelectCurrency = (currency: CurrencySelectOption) => {
        setSelectedCurrency(currency);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors bg-white shadow-sm"
            >
                <div className="bg-sky-100 p-1.5 rounded-lg">
                    <Banknote className="h-4 w-4 text-sky-600" />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">MONEDA</p>
                    <p className="text-sm font-bold text-slate-700 leading-none">
                        {selectedCurrency ? `${selectedCurrency.name} (${selectedCurrency.code})` : 'Seleccionar...'}
                    </p>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {/* Currencies List */}
                        <div className="p-2 space-y-1">
                            {currencies.map((currency) => (
                                <button
                                    key={currency.id}
                                    onClick={() => handleSelectCurrency(currency)}
                                    className={`w-full px-4 py-3 flex items-start gap-3 rounded-lg transition-colors group ${selectedCurrency?.id === currency.id ? 'bg-sky-50' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`mt-0.5 p-1.5 rounded-lg ${selectedCurrency?.id === currency.id ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'}`}>
                                        <Banknote className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm font-semibold ${selectedCurrency?.id === currency.id ? 'text-sky-700' : 'text-slate-700'}`}>
                                                {currency.name} ({currency.code})
                                            </p>
                                            {selectedCurrency?.id === currency.id && (
                                                <Check className="h-4 w-4 text-sky-600" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Exchange Rate Section */}
                        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TIPO DE CAMBIO</p>
                                <button className="flex items-center gap-1.5 text-[10px] font-bold text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-wide">
                                    ACTUALIZAR TC
                                    <RefreshCw className="h-3 w-3" />
                                </button>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-lg p-3 flex items-center gap-3">
                                <div className="bg-slate-100 p-1.5 rounded-md">
                                    <TrendingUp className="h-4 w-4 text-slate-500" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">
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
