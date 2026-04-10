import { lazy, Suspense, useState, type ComponentType } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import AuthLayout from './features/auth/AuthLayout';
import LoginPage from './features/auth/LoginPage';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store/auth.store';
import { ThemeProvider } from '@/components/ThemeProvider';
import { lazyRetry } from '@/utils/lazyRetry';
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap';
import { sessionRedirect } from '@/utils/session-redirect';

const AppRouter = lazy(() => lazyRetry(() => import('./AppRouter')));
const ForgotPasswordPage = lazy(() => lazyRetry(() => import('./features/auth/ForgotPasswordPage')));
const ResetPasswordPage = lazy(() => lazyRetry(() => import('./features/auth/ResetPasswordPage')));

type SessionExpiredModalProps = {
  isOpen: boolean;
  onLogin: () => void;
};

const SessionExpiredModal = lazy(() =>
  lazyRetry(() => import('@/components/shared/SessionExpiredModal')).then((mod) => ({
    default: mod.SessionExpiredModal as ComponentType<SessionExpiredModalProps>,
  })),
);

const PageLoader = () => (
  <div className="flex h-full min-h-[60vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
  </div>
);

function AuthApp() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pathname = window.location.pathname;

  if (isAuthenticated) {
    window.location.replace('/');
    return null;
  }

  if (pathname === '/auth/forgot-password') {
    return (
      <AuthLayout>
        <Suspense fallback={<PageLoader />}>
          <ForgotPasswordPage />
        </Suspense>
      </AuthLayout>
    );
  }

  if (pathname === '/auth/reset-password') {
    return (
      <AuthLayout>
        <Suspense fallback={<PageLoader />}>
          <ResetPasswordPage />
        </Suspense>
      </AuthLayout>
    );
  }

  if (pathname !== '/auth/login') {
    window.history.replaceState(null, '', '/auth/login');
  }

  return (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  );
}

function App() {
  const { isAuthenticated, isAuthResolved, logout } = useAuthStore();
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const isAuthRoute = window.location.pathname.startsWith('/auth');
  const { isBootstrapping } = useSessionBootstrap();

  const handleOnIdle = () => {
    if (isAuthenticated) {
      sessionRedirect.saveCurrentPath();
      logout();
      setIsSessionExpired(true);
    }
  };

  useIdleTimer({
    timeout: 1000 * 60 * 60,
    onIdle: handleOnIdle,
    debounce: 500,
  });

  const handleLoginRedirect = () => {
    setIsSessionExpired(false);
    window.location.href = '/auth/login';
  };

  if (!isAuthResolved || isBootstrapping) {
    return (
      <ThemeProvider>
        <PageLoader />
        <Toaster />
      </ThemeProvider>
    );
  }

  if (!isAuthenticated && !isAuthRoute) {
    window.history.replaceState(null, '', '/auth/login');
    return (
      <ThemeProvider>
        <AuthApp />
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {isAuthRoute ? (
        <AuthApp />
      ) : (
        <Suspense fallback={<PageLoader />}>
          <AppRouter />
        </Suspense>
      )}
      <Toaster />
      {isSessionExpired ? (
        <Suspense fallback={null}>
          <SessionExpiredModal
            isOpen={isSessionExpired}
            onLogin={handleLoginRedirect}
          />
        </Suspense>
      ) : null}
    </ThemeProvider>
  );
}

export default App;
