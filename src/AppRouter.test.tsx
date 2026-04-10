import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const { createBrowserRouterMock, routerProviderMock } = vi.hoisted(() => ({
  createBrowserRouterMock: vi.fn((routes) => ({ routes })),
  routerProviderMock: vi.fn(({ router }: { router: { routes: unknown[] } }) => (
    <div>routes:{router.routes.length}</div>
  )),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    createBrowserRouter: createBrowserRouterMock,
    RouterProvider: (props: { router: { routes: unknown[] } }) => routerProviderMock(props),
    Navigate: ({ to }: { to: string }) => <div>navigate:{to}</div>,
  };
});

vi.mock('./components/layout/ProtectedRoute', () => ({ default: () => <div>protected</div> }));
vi.mock('./components/layout/DashboardLayout', () => ({ default: () => <div>dashboard layout</div> }));
vi.mock('./components/layout/POSLayout', () => ({ default: () => <div>pos layout</div> }));
vi.mock('./components/shared/GlobalErrorBoundary', () => ({ GlobalErrorBoundary: () => <div>boundary</div> }));
vi.mock('./features/dashboard/DashboardPage', () => ({ default: () => <div>dashboard page</div> }));
vi.mock('./features/categories/CategoriesPage', () => ({ default: () => <div>categories page</div> }));
vi.mock('./features/categories/NewCategoryPage', () => ({ default: () => <div>new category page</div> }));
vi.mock('@/features/inventory/ProductsPage', () => ({ default: () => <div>products page</div> }));
vi.mock('@/features/inventory/NewInventoryPage', () => ({ default: () => <div>new inventory page</div> }));
vi.mock('./features/pos/POSPage', () => ({ default: () => <div>pos page</div> }));
vi.mock('./features/orders/PendingOrdersPage', () => ({ default: () => <div>pending orders</div> }));
vi.mock('./features/orders/SalesHistoryPage', () => ({ default: () => <div>sales history</div> }));
vi.mock('./features/search/AdvancedSearchPage', () => ({ default: () => <div>advanced search</div> }));
vi.mock('./features/security/SecurityPage', () => ({ default: () => <div>security page</div> }));
vi.mock('./features/notifications/NotificationsPage', () => ({ default: () => <div>notifications page</div> }));
vi.mock('./features/profile/ProfilePage', () => ({ default: () => <div>profile page</div> }));
vi.mock('./features/settings/GeneralSettingsPage', () => ({ default: () => <div>settings page</div> }));
vi.mock('./features/settings/DownloadsPage', () => ({ default: () => <div>downloads page</div> }));
vi.mock('./features/settings/FileManagerPage', () => ({ default: () => <div>file manager page</div> }));
vi.mock('./features/settings/UsersAndAccessPage', () => ({ default: () => <div>users page</div> }));
vi.mock('@/features/inventory/BranchOfficesPage', () => ({ default: () => <div>branches page</div> }));
vi.mock('@/features/inventory/InventoryMovementsPage', () => ({ default: () => <div>movements page</div> }));
vi.mock('@/features/inventory/CreateInventoryMovementPage', () => ({ default: () => <div>new movement page</div> }));
vi.mock('@/features/inventory/BulkTransferPage', () => ({ default: () => <div>bulk transfer page</div> }));
vi.mock('./features/settings/BillingPage', () => ({ default: () => <div>billing page</div> }));
vi.mock('./features/sales/CashClosingPage', () => ({ default: () => <div>cash closing page</div> }));
vi.mock('./features/sales/CashShiftHistoryPage', () => ({ default: () => <div>cash shift history page</div> }));
vi.mock('./features/sales/CashShiftDetailPage', () => ({ default: () => <div>cash shift detail page</div> }));
vi.mock('./features/sales/clients/ClientsPage', () => ({ default: () => <div>clients page</div> }));
vi.mock('./features/onboarding/PendingPaymentPage', () => ({ default: () => <div>pending payment page</div> }));
vi.mock('@/features/inventory/KardexPage', () => ({ default: () => <div>kardex page</div> }));

describe('AppRouter', () => {
  beforeEach(() => {
    createBrowserRouterMock.mockClear();
    routerProviderMock.mockClear();
  });

  it('builds the application route tree and renders RouterProvider', async () => {
    const { default: AppRouter } = await import('./AppRouter');
    render(<AppRouter />);

    expect(createBrowserRouterMock).toHaveBeenCalledTimes(1);
    const routes = createBrowserRouterMock.mock.calls[0][0];
    expect(routes).toHaveLength(2);
    expect(routes[0].path).toBe('/');
    expect(routes[1].path).toBe('*');
    expect(routes[0].children[0].children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'categories' }),
        expect.objectContaining({ path: 'orders/history' }),
        expect.objectContaining({ path: 'settings/billing' }),
      ])
    );
    expect(routes[0].children[1].path).toBe('pos');
    expect(routes[0].children[1].children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '' }),
        expect.objectContaining({ path: 'search' }),
      ])
    );
    expect(routerProviderMock).toHaveBeenCalledTimes(1);
  });
});
