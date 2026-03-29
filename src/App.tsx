import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';

// Layout & route guards (eAGERLY loaded — needed immediately for routing)
import ProtectedRoute from './components/layout/ProtectedRoute';
import PublicRoute from './components/layout/PublicRoute';

// App layouts — move to lazy because they contain sidebar, nav logic and icons
const DashboardLayout = lazy(() => lazyRetry(() => import('./components/layout/DashboardLayout')));
const POSLayout = lazy(() => lazyRetry(() => import('./components/layout/POSLayout')));

// Auth Layout & Pages — small, keep eager so login is instant
import AuthLayout from './features/auth/AuthLayout';
import LoginPage from './features/auth/LoginPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import { Toaster } from '@/components/ui/sonner';
import { SessionExpiredModal } from '@/components/shared/SessionExpiredModal';
import { useAuthStore } from '@/store/auth.store';

import { ThemeProvider } from '@/components/ThemeProvider';

// App pages — lazy loaded (only downloaded when the user visits them)
// Wrapped with lazyRetry to handle stale chunk errors after production deploys
import { lazyRetry } from '@/utils/lazyRetry';

const DashboardPage = lazy(() => lazyRetry(() => import('./features/dashboard/DashboardPage')));
const CategoriesPage = lazy(() => lazyRetry(() => import('./features/categories/CategoriesPage')));
const NewCategoryPage = lazy(() => lazyRetry(() => import('./features/categories/NewCategoryPage')));
const ProductsPage = lazy(() => lazyRetry(() => import('@/features/inventory/ProductsPage')));
const NewInventoryPage = lazy(() => lazyRetry(() => import('@/features/inventory/NewInventoryPage')));
const POSPage = lazy(() => lazyRetry(() => import('./features/pos/POSPage')));
const PendingOrdersPage = lazy(() => lazyRetry(() => import('./features/orders/PendingOrdersPage')));
const SalesHistoryPage = lazy(() => lazyRetry(() => import('./features/orders/SalesHistoryPage')));
const AdvancedSearchPage = lazy(() => lazyRetry(() => import('./features/search/AdvancedSearchPage')));
const SecurityPage = lazy(() => lazyRetry(() => import('./features/security/SecurityPage')));
const NotificationsPage = lazy(() => lazyRetry(() => import('./features/notifications/NotificationsPage')));
const ProfilePage = lazy(() => lazyRetry(() => import('./features/profile/ProfilePage')));
const GeneralSettingsPage = lazy(() => lazyRetry(() => import('./features/settings/GeneralSettingsPage')));
const DownloadsPage = lazy(() => lazyRetry(() => import('./features/settings/DownloadsPage')));
const FileManagerPage = lazy(() => lazyRetry(() => import('./features/settings/FileManagerPage')));
const UsersAndAccessPage = lazy(() => lazyRetry(() => import('./features/settings/UsersAndAccessPage')));
const BranchOfficesPage = lazy(() => lazyRetry(() => import('@/features/inventory/BranchOfficesPage')));
const InventoryMovementsPage = lazy(() => lazyRetry(() => import('@/features/inventory/InventoryMovementsPage')));
const CreateInventoryMovementPage = lazy(() => lazyRetry(() => import('@/features/inventory/CreateInventoryMovementPage')));
const BulkTransferPage = lazy(() => lazyRetry(() => import('@/features/inventory/BulkTransferPage')));
const BillingPage = lazy(() => lazyRetry(() => import('./features/settings/BillingPage')));
const CashClosingPage = lazy(() => lazyRetry(() => import('./features/sales/CashClosingPage')));
const CashShiftHistoryPage = lazy(() => lazyRetry(() => import('./features/sales/CashShiftHistoryPage')));
const CashShiftDetailPage = lazy(() => lazyRetry(() => import('./features/sales/CashShiftDetailPage')));
const ClientsPage = lazy(() => lazyRetry(() => import('./features/sales/clients/ClientsPage')));
const PendingPaymentPage = lazy(() => lazyRetry(() => import('./features/onboarding/PendingPaymentPage')));
const KardexPage = lazy(() => lazyRetry(() => import('@/features/inventory/KardexPage')));


import { GlobalErrorBoundary } from '@/components/shared/GlobalErrorBoundary';

// Simple loading fallback shown while a lazy chunk is being fetched
const PageLoader = () => (
  <div className="flex h-full min-h-[60vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <PublicRoute />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: '',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />
          },
          {
            path: 'forgot-password',
            element: <ForgotPasswordPage />
          },
          {
            path: 'reset-password',
            element: <ResetPasswordPage />
          }
        ]
      }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: '',
        element: <Suspense fallback={<PageLoader />}><DashboardLayout /></Suspense>,
        children: [
          {
            path: '/',
            element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
          },
          {
            path: 'categories',
            element: <Suspense fallback={<PageLoader />}><CategoriesPage /></Suspense>
          },
          {
            path: 'categories/new',
            element: <Suspense fallback={<PageLoader />}><NewCategoryPage /></Suspense>
          },
          {
            path: 'inventory',
            element: <Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>
          },
          {
            path: 'inventory/new',
            element: <Suspense fallback={<PageLoader />}><NewInventoryPage /></Suspense>
          },
          {
            path: 'inventory/branches',
            element: <Suspense fallback={<PageLoader />}><BranchOfficesPage /></Suspense>
          },
          {
            path: 'inventory/movements',
            element: <Suspense fallback={<PageLoader />}><InventoryMovementsPage /></Suspense>
          },
          {
            path: 'inventory/kardex',
            element: <Suspense fallback={<PageLoader />}><KardexPage /></Suspense>
          },
          {
            path: 'inventory/movements/new',
            element: <Suspense fallback={<PageLoader />}><CreateInventoryMovementPage /></Suspense>
          },
          {
            path: 'inventory/movements/bulk',
            element: <Suspense fallback={<PageLoader />}><BulkTransferPage /></Suspense>
          },
          {
            path: 'orders/pending',
            element: <Suspense fallback={<PageLoader />}><PendingOrdersPage /></Suspense>
          },
          {
            path: 'orders/history',
            element: <Suspense fallback={<PageLoader />}><SalesHistoryPage /></Suspense>
          },
          {
            path: 'sales/shifts',
            element: <Suspense fallback={<PageLoader />}><CashShiftHistoryPage /></Suspense>
          },
          {
            path: 'sales/shifts/:shiftId',
            element: <Suspense fallback={<PageLoader />}><CashShiftDetailPage /></Suspense>
          },
          {
            path: 'sales/clients',
            element: <Suspense fallback={<PageLoader />}><ClientsPage /></Suspense>
          },
          {
            path: 'security',
            element: <Suspense fallback={<PageLoader />}><SecurityPage /></Suspense>
          },
          {
            path: 'notifications',
            element: <Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>
          },
          {
            path: 'profile',
            element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>
          },
          {
            path: 'settings',
            element: <Suspense fallback={<PageLoader />}><GeneralSettingsPage /></Suspense>
          },
          {
            path: 'downloads',
            element: <Suspense fallback={<PageLoader />}><DownloadsPage /></Suspense>
          },
          {
            path: 'settings/files',
            element: <Suspense fallback={<PageLoader />}><FileManagerPage /></Suspense>
          },
          {
            path: 'settings/users',
            element: <Suspense fallback={<PageLoader />}><UsersAndAccessPage /></Suspense>
          },
          {
            path: 'settings/billing',
            element: <Suspense fallback={<PageLoader />}><BillingPage /></Suspense>
          },
        ]
      },
      {
        path: 'pos',
        element: <Suspense fallback={<PageLoader />}><POSLayout /></Suspense>,
        children: [
          {
            path: '',
            element: <Suspense fallback={<PageLoader />}><POSPage /></Suspense>
          },
          {
            path: 'search',
            element: <Suspense fallback={<PageLoader />}><AdvancedSearchPage /></Suspense>
          },
          {
            path: 'cash-closing/:shiftId',
            element: <Suspense fallback={<PageLoader />}><CashClosingPage /></Suspense>
          }
        ]
      },
      {
        path: 'onboarding/payment',
        element: <Suspense fallback={<PageLoader />}><PendingPaymentPage /></Suspense>
      }
    ]
  },
  // Catch-all
  {
    path: '*',
    element: <Navigate to="/auth/login" replace />,
    errorElement: <GlobalErrorBoundary />
  }
]);

function App() {
  const { isAuthenticated, logout } = useAuthStore();
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Note: Socket and Realtime hooks have been moved to ProtectedRoute 
  // to avoid bloating the initial bundle for public users.




  const handleOnIdle = () => {
    if (isAuthenticated) {
      // Save current URL to redirect back after login
      localStorage.setItem('redirectUrl', window.location.pathname + window.location.search);
      logout();
      setIsSessionExpired(true);
    }
  };

  useIdleTimer({
    timeout: 1000 * 60 * 60, // 60 minutes
    onIdle: handleOnIdle,
    debounce: 500,
  });

  const handleLoginRedirect = () => {
    setIsSessionExpired(false);
    window.location.href = '/auth/login';
  };

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster />
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onLogin={handleLoginRedirect}
      />
    </ThemeProvider>
  );
}

export default App;
