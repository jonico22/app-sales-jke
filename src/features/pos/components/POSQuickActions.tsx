import { History, Command, HelpCircle } from 'lucide-react';

interface POSQuickActionsProps {
    onHistoryClick?: () => void;
    onShortcutsClick?: () => void;
    onHelpClick?: () => void;
}

export function POSQuickActions({
    onHistoryClick,
    onShortcutsClick,
    onHelpClick
}: POSQuickActionsProps) {
    return (
        <div className="hidden md:flex items-center justify-center gap-8 pt-4">
            <button
                onClick={onHistoryClick}
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                    <History className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">Últimas Ventas</span>
            </button>
            <button
                onClick={onShortcutsClick}
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                    <Command className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">Atajos</span>
            </button>
            <button
                onClick={onHelpClick}
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-orange-500" />
                </div>
                <span className="text-xs font-medium">Ayuda</span>
            </button>
        </div>
    );
}
