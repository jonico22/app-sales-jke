import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export default function ProtectedRoute() {
    const { isAuthenticated, user } = useAuthStore();
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

    return <Outlet />;
}
