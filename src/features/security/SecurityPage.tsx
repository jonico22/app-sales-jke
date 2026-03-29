import { Card } from '@/components/ui/card';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import { TwoFactorPlaceholder } from './components/TwoFactorPlaceholder';

export default function SecurityPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Page Header */}
            <div className="space-y-1 px-1">
                <h1 className="text-lg font-bold text-foreground tracking-tight uppercase">Seguridad y Acceso</h1>
                <p className="text-muted-foreground text-xs">
                    Gestione su contraseña y la configuración de autenticación de su cuenta para proteger su información.
                </p>
            </div>

            <div className="space-y-6">
                {/* Change Password Section */}
                <Card className="border-border overflow-hidden shadow-sm">
                    <ChangePasswordForm />
                </Card>

                {/* 2FA Section */}
                <TwoFactorPlaceholder />
            </div>
        </div>
    );
}
