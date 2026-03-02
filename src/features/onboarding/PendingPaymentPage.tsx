import { Store, LogOut, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function PendingPaymentPage() {
    const { user, logout } = useAuthStore();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-sky-600 rounded-b-[4rem] md:rounded-b-[8rem] -z-10" />
            <div className="absolute top-10 left-10 text-white/10 hidden md:block">
                <Store className="h-64 w-64" />
            </div>

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden mt-8 md:mt-16">
                <div className="bg-white p-8 md:p-12 text-center relative">
                    <div className="mx-auto h-20 w-20 bg-sky-50 rounded-full flex items-center justify-center mb-6 relative">
                        <Clock className="h-10 w-10 text-sky-500" strokeWidth={2} />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                        ¡Bienvenido, {user?.name || 'Usuario'}!
                    </h2>

                    <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                        Tu cuenta comercial ha sido creada con éxito. Sin embargo, estamos esperando la confirmación de tu pago de Onboarding para habilitar el acceso al panel principal.
                    </p>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-left mb-8">
                        <h4 className="font-semibold text-amber-800 text-sm mb-2">
                            Validación en progreso
                        </h4>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Si ya realizaste y enviaste el comprobante de tu primer pago, nuestro equipo comercial está validando la información. Esto toma típicamente menos de 24 horas hábiles. Revisa tu correo electrónico para futuras notificaciones.
                        </p>
                    </div>

                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <p className="text-slate-400 text-xs mt-8">
                &copy; {new Date().getFullYear()} JKE Solutions. Todos los derechos reservados.
            </p>
        </div>
    );
}
