import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './styles/app.css';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { GlobalErrorBoundary } from '@/components/shared/GlobalErrorBoundary';
import { lazyRetry } from '@/utils/lazyRetry';

const DashboardLayout = lazy(() => lazyRetry(() => import('./components/layout/DashboardLayout')));
const POSLayout = lazy(() => lazyRetry(() => import('./components/layout/POSLayout')));
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

const PageLoader = () => (
  <div className="flex h-full min-h-[60vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
  </div>
);

const withLoader = (component: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{component}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: withLoader(<ProtectedRoute />),
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: '',
        element: withLoader(<DashboardLayout />),
        children: [
          { path: '/', element: withLoader(<DashboardPage />) },
          { path: 'categories', element: withLoader(<CategoriesPage />) },
          { path: 'categories/new', element: withLoader(<NewCategoryPage />) },
          { path: 'inventory', element: withLoader(<ProductsPage />) },
          { path: 'inventory/new', element: withLoader(<NewInventoryPage />) },
          { path: 'inventory/branches', element: withLoader(<BranchOfficesPage />) },
          { path: 'inventory/movements', element: withLoader(<InventoryMovementsPage />) },
          { path: 'inventory/kardex', element: withLoader(<KardexPage />) },
          { path: 'inventory/movements/new', element: withLoader(<CreateInventoryMovementPage />) },
          { path: 'inventory/movements/bulk', element: withLoader(<BulkTransferPage />) },
          { path: 'orders/pending', element: withLoader(<PendingOrdersPage />) },
          { path: 'orders/history', element: withLoader(<SalesHistoryPage />) },
          { path: 'sales/shifts', element: withLoader(<CashShiftHistoryPage />) },
          { path: 'sales/shifts/:shiftId', element: withLoader(<CashShiftDetailPage />) },
          { path: 'sales/clients', element: withLoader(<ClientsPage />) },
          { path: 'security', element: withLoader(<SecurityPage />) },
          { path: 'notifications', element: withLoader(<NotificationsPage />) },
          { path: 'profile', element: withLoader(<ProfilePage />) },
          { path: 'settings', element: withLoader(<GeneralSettingsPage />) },
          { path: 'downloads', element: withLoader(<DownloadsPage />) },
          { path: 'settings/files', element: withLoader(<FileManagerPage />) },
          { path: 'settings/users', element: withLoader(<UsersAndAccessPage />) },
          { path: 'settings/billing', element: withLoader(<BillingPage />) },
        ],
      },
      {
        path: 'pos',
        element: withLoader(<POSLayout />),
        children: [
          { path: '', element: withLoader(<POSPage />) },
          { path: 'search', element: withLoader(<AdvancedSearchPage />) },
          { path: 'cash-closing/:shiftId', element: withLoader(<CashClosingPage />) },
        ],
      },
      { path: 'onboarding/payment', element: withLoader(<PendingPaymentPage />) },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/auth/login" replace />,
    errorElement: <GlobalErrorBoundary />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
