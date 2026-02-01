import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './features/auth/AuthLayout';
import LoginPage from './features/auth/LoginPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PublicRoute from './components/layout/PublicRoute';
import { Toaster } from '@/components/ui';
import DashboardPage from './features/dashboard/DashboardPage';
import CategoriesPage from './features/categories/CategoriesPage';
import NewCategoryPage from './features/categories/NewCategoryPage';
import NewInventoryPage from './features/inventory/NewInventoryPage';
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
            path: 'inventory/new',
            element: <NewInventoryPage />
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
  return (
    <>
      <DatePickerStyles />
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
