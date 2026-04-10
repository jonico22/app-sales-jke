# E2E Test Structure

## Dónde se guardan los flujos reutilizables

- `tests/e2e/pages`
  Guarda page objects con selectores y acciones de una pantalla concreta.
  Ejemplos: `LoginPage`, `POSPage`, `AdvancedSearchPage`.
  Los overlays compartidos como carrito, modal de pago y éxito también viven aquí, para reutilizarlos sin mezclar los botones propios de cada pantalla.

- `tests/e2e/flows`
  Guarda flujos de negocio o recorridos multi-página reutilizables.
  Ejemplos: `loginWithDefaultUser`, `openPosAndGoToAdvancedSearch`, `openCartWithProductFromPos`, `registerSaleFromSearch`.

- `tests/e2e/utils`
  Guarda utilidades de soporte para sesión, stubs y setup técnico.
  Ejemplos: `authenticated-session.ts`, helpers de auth compartidos.

- `tests/e2e/*.spec.ts`
  Guarda los escenarios finales que validan comportamiento.
  Idealmente solo orquestan flows/pages y contienen las aserciones del caso.

## Regla práctica

- Si cambia un selector de una vista, se ajusta en `pages`.
- Si cambia un recorrido reutilizable, se ajusta en `flows`.
- Si cambia un detalle de sesión o mocking técnico, se ajusta en `utils`.
- Si cambia el comportamiento esperado de negocio, se ajusta el `spec`.

## Estrategia actual

- La suite E2E se ejecuta contra un artefacto dedicado de `build:e2e` servido con `vite preview`, tanto en local como en CI.
  Ese build usa modo `test` para evitar bases/CDN de producción y al mismo tiempo validar un artefacto estático, no el servidor `dev`.

- `authenticated-smoke.spec.ts`
  Smoke estable para `main` usando sesión sembrada y stubs mínimos.

- `pos-sale-smoke.spec.ts`
  Smoke estable del flujo inicial de venta: seleccionar producto en POS y abrir carrito.

- `pos-order-smoke.spec.ts`
  Smoke estable para registrar un pedido desde el carrito POS.

- `pos-payment-smoke.spec.ts`
  Smoke estable para registrar una venta y confirmar el pago desde POS.

- `search-smoke.spec.ts`
  Smoke estable para agregar un producto desde búsqueda avanzada y mostrar el footer del carrito.

- `search-order-smoke.spec.ts`
  Smoke estable para registrar un pedido desde búsqueda avanzada.

- `search-payment-smoke.spec.ts`
  Smoke estable para registrar una venta y confirmar pago desde búsqueda avanzada.

- `auth.spec.ts`
  Flujos reales contra API, marcados con `@manual`.

## Cómo extender

Cuando quieras probar una mejora o corrección del flujo:

1. Reutiliza un page object existente desde `pages`.
2. Reutiliza o compón un flow desde `flows`.
3. Crea un nuevo `*.spec.ts` solo con el escenario y las expectativas.

Ejemplo:

```ts
import { test } from '@playwright/test';
import { loginWithDefaultUser } from './flows/auth.flow';
import { openPosAndGoToAdvancedSearch } from './flows/protected-shell.flow';

test('nuevo flujo', async ({ page }) => {
  await loginWithDefaultUser(page);
  await openPosAndGoToAdvancedSearch(page);
});
```
