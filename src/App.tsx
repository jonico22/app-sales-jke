import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';

import DashboardLayout from './components/layout/DashboardLayout';
import POSLayout from './components/layout/POSLayout';
import AuthLayout from './features/auth/AuthLayout';
import LoginPage from './features/auth/LoginPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PublicRoute from './components/layout/PublicRoute';
import { Toaster } from '@/components/ui';
import { SessionExpiredModal } from '@/components/shared/SessionExpiredModal';
import { useAuthStore } from '@/store/auth.store';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import DashboardPage from './features/dashboard/DashboardPage';
import CategoriesPage from './features/categories/CategoriesPage';
import NewCategoryPage from './features/categories/NewCategoryPage';
import ProductsPage from './features/inventory/ProductsPage';
import NewInventoryPage from './features/inventory/NewInventoryPage';
import POSPage from './features/pos/POSPage';
import PendingOrdersPage from './features/orders/PendingOrdersPage';
import SalesHistoryPage from './features/orders/SalesHistoryPage';
import { DatePickerStyles } from './components/shared/DatePickerInput';

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
            element: <DashboardPage />
          },
          {
            path: 'categories',
            element: <CategoriesPage />
          },
          {
            path: 'categories/new',
            element: <NewCategoryPage />
          },
          {
            path: 'inventory',
            element: <ProductsPage />
          },
          {
            path: 'inventory/new',
            element: <NewInventoryPage />
          },
          {
            path: 'orders/pending',
            element: <PendingOrdersPage />
          },
          {
            path: 'orders/history',
            element: <SalesHistoryPage />
          }
        ]
      },
      {
        path: 'pos',
        element: <POSLayout />,
        children: [
          {
            path: '',
            element: <POSPage />
          }
        ]
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



  const handleOnIdle = () => {
    if (isAuthenticated) {
      logout();
      setIsSessionExpired(true);
    }
  };

  useIdleTimer({
    timeout: 1000 * 60 * 20, // 20 minutes
    onIdle: handleOnIdle,
    debounce: 500,
  });

  const handleLoginRedirect = () => {
    setIsSessionExpired(false);
    window.location.href = '/auth/login';
  };

  return (
    <>
      <DatePickerStyles />
      <RouterProvider router={router} />
      <Toaster />
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onLogin={handleLoginRedirect}
      />
    </>
  );
}

export default App;
