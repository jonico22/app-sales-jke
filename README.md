# 🚀 Sales App - JKE Solutions

[![Guía de Entornos](https://img.shields.io/badge/Documentaci%C3%B3n-Gu%C3%ADa%20de%20Entornos-blue?style=for-the-badge)](./GUIA_ENTORNOS.md)

Este proyecto es la plataforma de ventas de JKE Solutions, construida con React, TypeScript y Vite.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

---

## 🧪 Testing

### Playwright E2E

- `npm run test:e2e` ejecuta la suite E2E local.
- El workflow `Playwright Tests` de GitHub Actions corre automáticamente solo en pushes a `main`.
- La ejecución automática de CI excluye tests marcados con `@manual`, pensados para flujos que dependen de credenciales u otros prerequisitos menos estables.
- [authenticated-smoke.spec.ts](./tests/e2e/authenticated-smoke.spec.ts) cubre el smoke autenticado estable usando una sesión sembrada y stubs mínimos de API. Ese es el flujo pensado para `main`.
- [pos-sale-smoke.spec.ts](./tests/e2e/pos-sale-smoke.spec.ts) cubre un flujo inicial de venta estable en POS: seleccionar producto y abrir carrito.
- [pos-order-smoke.spec.ts](./tests/e2e/pos-order-smoke.spec.ts) cubre el registro de un pedido desde el carrito POS.
- [pos-payment-smoke.spec.ts](./tests/e2e/pos-payment-smoke.spec.ts) cubre el flujo estable de venta completa en POS hasta confirmar el pago.
- [search-smoke.spec.ts](./tests/e2e/search-smoke.spec.ts) cubre el agregado de productos desde búsqueda avanzada.
- [search-order-smoke.spec.ts](./tests/e2e/search-order-smoke.spec.ts) cubre el registro de pedido desde búsqueda avanzada.
- [search-payment-smoke.spec.ts](./tests/e2e/search-payment-smoke.spec.ts) cubre la venta completa desde búsqueda avanzada hasta confirmar pago.
- [auth.spec.ts](./tests/e2e/auth.spec.ts) cubre login real, navegación autenticada y logout contra la API. Está marcado como `@manual`.
- Los flujos reutilizables, page objects y utilidades de E2E están organizados dentro de [`tests/e2e`](./tests/e2e/README.md).
- POS y Search comparten page objects de overlays para carrito, pago y éxito, mientras que los botones propios de cada pantalla permanecen en su page object específico.
- Los tests reales autenticados usan `TEST_USER_EMAIL` y `TEST_USER_PASSWORD` del entorno, y esperan que la API acepte el header `x-turnstile-token: test-turnstile-bypass` para el bypass de Turnstile en testing.
- Para correr la suite completa en GitHub, ejecuta manualmente el workflow `Playwright Tests` y activa `full_suite=true`.

## 📖 Documentación Adicional

Para entender cómo funcionan los diferentes modos de la aplicación y el proceso de despliegue, consulta la **[Guía de Entornos](./GUIA_ENTORNOS.md)**.
