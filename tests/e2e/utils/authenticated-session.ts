import type { Page, Route } from '@playwright/test';

const authStorage = {
  state: {
    token: 'e2e-token',
    user: {
      id: 'user-e2e-1',
      email: 'e2e@jke.test',
      name: 'E2E Tester',
      image: null,
      emailVerified: true,
      isActive: true,
      mustChangePassword: false,
      role: {
        id: 'role-admin',
        code: 'ADMIN',
        name: 'Administrador',
        isActive: true,
      },
    },
    role: {
      id: 'role-admin',
      code: 'ADMIN',
      name: 'Administrador',
      isActive: true,
    },
    subscription: {
      status: 'ACTIVE',
      planId: 'plan-pro',
      endDate: '2099-12-31T00:00:00.000Z',
    },
    modulePermissions: null,
    isAuthenticated: true,
  },
  version: 0,
};

const societyStorage = {
  state: {
    society: {
      id: 'soc-1',
      name: 'JKE Demo',
      code: 'JKE',
      isActive: true,
      legalEntityId: null,
      stockNotificationFrequency: 'DAILY',
      salesNotificationFrequency: 'DAILY',
      stockNotificationEnabled: true,
      salesNotificationEnabled: true,
      notificationFrequency: 'DAILY',
      backupFrequency: 'DAILY',
      dataRetentionDays: 30,
      uiConfig: null,
      mainCurrency: {
        id: 'currency-pen',
        name: 'Sol Peruano',
        code: 'PEN',
        symbol: 'S/',
      },
      taxes: [],
      logo: null,
      legalEntity: null,
      subscriptionId: 'sub-1',
      storageLimit: '1000',
      maxUsers: 10,
      maxProducts: 100,
      usedStorage: 10,
      totalProducts: 1,
      totalUsers: 1,
    },
  },
  version: 0,
};

const ok = (data: unknown, message = 'ok') => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({
    success: true,
    message,
    data,
  }),
});

async function fulfillApi(route: Route) {
  const url = new URL(route.request().url());
  const path = url.pathname;
  const method = route.request().method();

  if (path.endsWith('/auth/me')) {
    return route.fulfill(ok({
      user: authStorage.state.user,
      role: authStorage.state.role,
      token: authStorage.state.token,
      expiresAt: '2099-12-31T00:00:00.000Z',
      subscription: authStorage.state.subscription,
    }));
  }

  if (path.endsWith('/auth/me/permissions')) {
    return route.fulfill(ok({
      views: {},
      modules: {
        DASHBOARD: true,
        INVENTARIO: true,
        VENTAS: true,
        USUARIOS: true,
        REPORTES: true,
        SUSCRIPCION: true,
        CONFIGURACION: true,
      },
    }));
  }

  if (path.endsWith('/notifications/unread-count')) {
    return route.fulfill(ok({ count: 0 }));
  }

  if (path.endsWith('/notifications')) {
    return route.fulfill(ok({
      items: [],
      total: 0,
      page: 1,
      totalPages: 0,
    }));
  }

  if (path.endsWith('/sales/branch-offices/select')) {
    return route.fulfill(ok([
      {
        id: 'branch-1',
        name: 'Sucursal Centro',
        code: 'CENTRO',
        isActive: true,
      },
    ]));
  }

  if (path.endsWith('/sales/currencies/select')) {
    return route.fulfill(ok([
      {
        id: 'currency-pen',
        name: 'Sol Peruano',
        code: 'PEN',
        symbol: 'S/',
        exchangeRate: 1,
      },
    ]));
  }

  if (path.endsWith('/sales/cash-shifts/current')) {
    return route.fulfill(ok({
      id: 'shift-1',
      societyId: 'soc-1',
      branchId: 'branch-1',
      userId: 'user-e2e-1',
      status: 'OPEN',
      openedAt: '01/01/2099 08:00:00',
      closedAt: null,
      initialAmount: '100.00',
      finalReportedAmount: null,
      finalSystemAmount: null,
      difference: null,
      incomeCash: '0.00',
      incomeCard: '0.00',
      incomeYape: '0.00',
      incomePlin: '0.00',
      incomeTransfer: '0.00',
      expenseCash: '0.00',
      observations: null,
      reportedCashAmount: null,
      reportedCardAmount: null,
      reportedYapeAmount: null,
      reportedPlinAmount: null,
      reportedTransferAmount: null,
      createdAt: '01/01/2099 08:00:00',
      updatedAt: '01/01/2099 08:00:00',
      branch: { name: 'Sucursal Centro' },
      openingBalance: 100,
      closingBalance: null,
      currentBalance: 100,
    }));
  }

  if (path.endsWith('/sales/products/select')) {
    return route.fulfill(ok({
      data: [
        {
          id: 'product-1',
          name: 'Lapiz Azul',
          code: 'LAP-001',
          description: null,
          price: '5.00',
          priceCost: '2.50',
          stock: 20,
          minStock: 2,
          barcode: null,
          brand: 'Faber',
          color: 'Azul',
          colorCode: '#1d4ed8',
          societyId: 'soc-1',
          categoryId: 'cat-1',
          imageId: null,
          isActive: true,
          isDeleted: false,
          createdAt: '2099-01-01T00:00:00.000Z',
          updatedAt: '2099-01-01T00:00:00.000Z',
          createdBy: 'user-e2e-1',
          updatedBy: null,
          category: null,
          image: null,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }));
  }

  if (path.endsWith('/sales/products/colors')) {
    return route.fulfill(ok([
      { id: 'color-1', color: 'Azul', colorCode: '#1d4ed8' },
      { id: 'color-2', color: 'Rojo', colorCode: '#dc2626' },
    ]));
  }

  if (path.endsWith('/sales/products/brands')) {
    return route.fulfill(ok([
      { id: 'brand-1', brand: 'Faber' },
      { id: 'brand-2', brand: 'Pilot' },
    ]));
  }

  if (path.endsWith('/sales/products/best-sellers')) {
    return route.fulfill(ok([]));
  }

  if (path.endsWith('/sales/products')) {
    return route.fulfill(ok({
      data: [
        {
          id: 'product-1',
          name: 'Lapiz Azul',
          code: 'LAP-001',
          description: null,
          price: '5.00',
          priceCost: '2.50',
          stock: 20,
          minStock: 2,
          barcode: null,
          brand: 'Faber',
          color: 'Azul',
          colorCode: '#1d4ed8',
          societyId: 'soc-1',
          categoryId: 'cat-1',
          imageId: null,
          isActive: true,
          isDeleted: false,
          createdAt: '2099-01-01T00:00:00.000Z',
          updatedAt: '2099-01-01T00:00:00.000Z',
          createdBy: 'user-e2e-1',
          updatedBy: null,
          category: null,
          image: null,
        },
      ],
      pagination: {
        page: 1,
        limit: 12,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }));
  }

  if (path.endsWith('/sales/orders') && method === 'POST') {
    const body = route.request().postDataJSON() as { status?: string } | null;
    const isPendingPayment = body?.status === 'PENDING_PAYMENT';

    return route.fulfill(ok({
      id: isPendingPayment ? 'order-2' : 'order-1',
      orderCode: isPendingPayment ? 'VEN-001' : 'PED-001',
      orderDate: '2099-01-01T10:00:00.000Z',
      totalAmount: '5.00',
      status: isPendingPayment ? 'PENDING_PAYMENT' : 'PENDING',
      discount: '0.00',
      notes: null,
      paymentDate: null,
      comment: null,
      cancellationReason: null,
      subtotal: '4.24',
      taxAmount: '0.76',
      partnerId: '2',
      branchId: 'branch-1',
      societyId: 'soc-1',
      currencyId: 'currency-pen',
      exchangeRate: '1',
      isActive: true,
      isDeleted: false,
      createdAt: '2099-01-01T10:00:00.000Z',
      updatedAt: '2099-01-01T10:00:00.000Z',
      createdBy: 'user-e2e-1',
      updatedBy: null,
      orderItems: [
        {
          id: 'order-item-1',
          orderId: isPendingPayment ? 'order-2' : 'order-1',
          productId: 'product-1',
          quantity: 1,
          unitPrice: 5,
          discount: 0,
          total: 5,
          product: { name: 'Lapiz Azul' },
        },
      ],
      _count: { orderItems: 1 },
      partner: {
        id: '2',
        companyName: null,
        firstName: 'Publico',
        lastName: 'General',
        documentNumber: '00000000',
        documentType: 'DNI',
        email: null,
      },
      currency: {
        code: 'PEN',
        symbol: 'S/',
      },
      totalProducts: 1,
    }, 'Pedido creado exitosamente'));
  }

  if (path.endsWith('/sales/order-payments') && method === 'POST') {
    return route.fulfill(ok({
      id: 'payment-1',
      orderId: 'order-2',
      societyId: 'soc-1',
      amount: 5,
      currencyId: 'currency-pen',
      exchangeRate: 1,
      paymentMethod: 'YAPE',
      paymentDate: '2099-01-01T10:05:00.000Z',
      referenceCode: 'Y-123456',
      status: 'CONFIRMED',
      notes: null,
      imageId: null,
      isActive: true,
      isDeleted: false,
      createdAt: '2099-01-01T10:05:00.000Z',
      updatedAt: '2099-01-01T10:05:00.000Z',
      createdBy: 'user-e2e-1',
      updatedBy: null,
    }, 'Pago registrado exitosamente'));
  }

  if (/\/sales\/orders\/[^/]+$/.test(path) && method === 'PUT') {
    return route.fulfill(ok({
      id: 'order-2',
      orderCode: 'VEN-001',
      orderDate: '2099-01-01T10:00:00.000Z',
      totalAmount: '5.00',
      status: 'COMPLETED',
      discount: '0.00',
      notes: null,
      paymentDate: '2099-01-01T10:05:00.000Z',
      comment: null,
      cancellationReason: null,
      subtotal: '4.24',
      taxAmount: '0.76',
      partnerId: '2',
      branchId: 'branch-1',
      societyId: 'soc-1',
      currencyId: 'currency-pen',
      exchangeRate: '1',
      isActive: true,
      isDeleted: false,
      createdAt: '2099-01-01T10:00:00.000Z',
      updatedAt: '2099-01-01T10:05:00.000Z',
      createdBy: 'user-e2e-1',
      updatedBy: null,
      orderItems: [],
      _count: { orderItems: 1 },
      partner: {
        id: '2',
        companyName: null,
        firstName: 'Publico',
        lastName: 'General',
        documentNumber: '00000000',
        documentType: 'DNI',
        email: null,
      },
      currency: {
        code: 'PEN',
        symbol: 'S/',
      },
      totalProducts: 1,
    }, 'Pedido actualizado exitosamente'));
  }

  if (path.endsWith('/sales/clients/select')) {
    return route.fulfill(ok([
      { id: 'client-public', name: 'Público General', documentNumber: '00000000' },
    ]));
  }

  if (path.endsWith('/sales/favorites')) {
    return route.fulfill(ok([]));
  }

  return route.fulfill(ok([]));
}

export async function bootstrapAuthenticatedSession(page: Page) {
  await page.addInitScript(([societyValue]) => {
    window.localStorage.setItem('society-storage', JSON.stringify(societyValue));
  }, [societyStorage]);

  await page.route('**/api/**', fulfillApi);
}
