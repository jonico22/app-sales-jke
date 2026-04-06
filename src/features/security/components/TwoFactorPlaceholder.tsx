import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function TwoFactorPlaceholder() {
    return (
        <Card className="p-6 md:p-8 opacity-60 border-dashed border-border bg-muted/20 shadow-none">
            <div className="flex items-center gap-4">
                <div className="bg-muted p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Autenticación de Dos Factores (2FA)</h3>
                    <p className="text-xs text-muted-foreground">
                        Próximamente: Añade una capa extra de seguridad a tu cuenta mediante códigos temporales.
                    </p>
                </div>
            </div>
        </Card>
    );
}
