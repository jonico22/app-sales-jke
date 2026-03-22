import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';

// Layout & route guards (eagerly loaded — always needed)
import DashboardLayout from './components/layout/DashboardLayout';
import POSLayout from './components/layout/POSLayout';
import AuthLayout from './features/auth/AuthLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PublicRoute from './components/layout/PublicRoute';
import { Toaster } from '@/components/ui';
import { SessionExpiredModal } from '@/components/shared/SessionExpiredModal';
import { useAuthStore } from '@/store/auth.store';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { DatePickerStyles } from './components/shared/DatePickerInput';
import { ThemeProvider } from '@/components/ThemeProvider';

// Auth pages — small, keep eager so login is instant
import LoginPage from './features/auth/LoginPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';

// App pages — lazy loaded (only downloaded when the user visits them)
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const CategoriesPage = lazy(() => import('./features/categories/CategoriesPage'));
const NewCategoryPage = lazy(() => import('./features/categories/NewCategoryPage'));
const ProductsPage = lazy(() => import('@/features/inventory/ProductsPage'));
const NewInventoryPage = lazy(() => import('@/features/inventory/NewInventoryPage'));
const POSPage = lazy(() => import('./features/pos/POSPage'));
const PendingOrdersPage = lazy(() => import('./features/orders/PendingOrdersPage'));
const SalesHistoryPage = lazy(() => import('./features/orders/SalesHistoryPage'));
const AdvancedSearchPage = lazy(() => import('./features/search/AdvancedSearchPage'));
const SecurityPage = lazy(() => import('./features/security/SecurityPage'));
const NotificationsPage = lazy(() => import('./features/notifications/NotificationsPage'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));
const GeneralSettingsPage = lazy(() => import('./features/settings/GeneralSettingsPage'));
const DownloadsPage = lazy(() => import('./features/settings/DownloadsPage'));
const FileManagerPage = lazy(() => import('./features/settings/FileManagerPage'));
const UsersAndAccessPage = lazy(() => import('./features/settings/UsersAndAccessPage'));
const BranchOfficesPage = lazy(() => import('@/features/inventory/BranchOfficesPage'));
const InventoryMovementsPage = lazy(() => import('@/features/inventory/InventoryMovementsPage'));
const CreateInventoryMovementPage = lazy(() => import('@/features/inventory/CreateInventoryMovementPage'));
const BulkTransferPage = lazy(() => import('@/features/inventory/BulkTransferPage'));
const BillingPage = lazy(() => import('./features/settings/BillingPage'));
const CashClosingPage = lazy(() => import('./features/sales/CashClosingPage'));
const CashShiftHistoryPage = lazy(() => import('./features/sales/CashShiftHistoryPage'));
const CashShiftDetailPage = lazy(() => import('./features/sales/CashShiftDetailPage'));
const ClientsPage = lazy(() => import('./features/sales/clients/ClientsPage'));
const PendingPaymentPage = lazy(() => import('./features/onboarding/PendingPaymentPage'));

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
    children: [
      {
        path: '',
        element: <DashboardLayout />,
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
        element: <POSLayout />,
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
    element: <Navigate to="/auth/login" replace />
  }
]);

function App() {
  const { isAuthenticated, logout } = useAuthStore();
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Initialize socket connection manager
  useSocketConnection();

  // Handle real-time updates
  useRealtimeUpdates();



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
      <DatePickerStyles />
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
