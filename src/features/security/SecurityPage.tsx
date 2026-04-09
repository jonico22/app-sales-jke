import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import { TwoFactorPlaceholder } from './components/TwoFactorPlaceholder';

export default function SecurityPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            <PageHeader
                title="Seguridad y Acceso"
                subtitle="Gestione su contraseña y la configuración de autenticación de su cuenta para proteger su información."
            />

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
