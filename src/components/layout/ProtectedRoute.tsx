import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export default function ProtectedRoute() {
    // Initializing real-time features only if the route is active (authenticated)
    useSocketConnection();
    useRealtimeUpdates();
    
    const { isAuthenticated, user, subscription } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    // If email is not verified, we shouldn't let them in (adjust this if a verification page is added)
    if (user && !user.emailVerified) {
        return <Navigate to="/auth/login" replace />;
    }

    if (user?.mustChangePassword && location.pathname !== '/security') {
        return <Navigate to="/security" replace />;
    }

    // --- Subscription Enforcement Logic ---
    const status = subscription?.status;

    // If pending first payment -> go to onboarding payment page
    if (status === 'PENDING' && location.pathname !== '/onboarding/payment') {
        return <Navigate to="/onboarding/payment" replace />;
    }

    // If expired or inactive -> force to billing page to renew/reactivate
    if ((status === 'EXPIRED' || status === 'INACTIVE') && location.pathname !== '/settings/billing') {
        return <Navigate to="/settings/billing" replace />;
    }

    return <Outlet />;
}
