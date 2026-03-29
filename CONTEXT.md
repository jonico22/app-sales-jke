# Project Context: JKE Sales App

Este documento sirve como la **Fuente de Verdad (Master Context)** para el proyecto **JKE Sales App**. Está diseñado para que desarrolladores y asistentes de IA entiendan rápidamente la arquitectura, el stack y los flujos sin necesidad de exploración manual extensa.

---

## 🚀 Resumen del Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) |
| **Estilos** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Enrutado** | [React Router 7](https://reactrouter.com/) |
| **Estado Global / Auth** | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| **Data Fetching / Cache** | [TanStack Query 5 (React Query)](https://tanstack.com/query/latest) |
| **Formularios / Validación** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Comunicación API** | [Axios](https://axios-http.com/) + [Socket.io Client](https://socket.io/) |
| **Seguridad** | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) |
| **Infraestructura** | [Docker](https://www.docker.com/) + [Nginx](https://www.nginx.com/) |
| **Testing** | [Vitest](https://vitest.dev/) (Unit/Comp) + [Playwright](https://playwright.dev/) (E2E) |

---

## 🏗️ Arquitectura General

El proyecto sigue una arquitectura **basada en características (Feature-based)** y una separación clara entre la UI y la lógica de acceso a datos.

1.  **Capa de Características (`src/features`)**: Cada módulo del negocio (Ventas, Inventario, POS) tiene su propia carpeta con sus componentes, hooks, y páginas específicas. Esto facilita la escalabilidad y el aislamiento de errores.
2.  **Capa de Servicios (`src/services`)**: Abstracción total de las llamadas a la API. Ningún componente llama a `axios` directamente; en su lugar, utilizan los servicios definidos aquí.
3.  **Gestión de Estado**:
    *   **Zustand**: Se usa para estado que debe persistir o ser accedido globalmente de forma síncrona (ej: Tokens de Auth, Preferencias de Usuario).
    *   **React Query**: Maneja todo el estado "del servidor". Se encarga del caching, reintentos y estados de carga (`isLoading`, `isError`).
4.  **Flujo Real-time**: Implementado con WebSockets (`socket.io`) para notificaciones en tiempo real y actualizaciones de stock automáticas en el POS.

---

## 🗺️ Mapa del Proyecto (Estructura de Directorios)

```text
app-sales-jke/
├── .github/                # Workflows de CI/CD (GitHub Actions)
├── .husky/                  # Hooks de Git (Pre-commit linting/testing)
├── public/                 # Assets estáticos (Imágenes, Favicons)
├── src/
│   ├── assets/             # Recursos locales (CSS global, imágenes cargadas)
│   ├── components/         # Componentes UI compartidos (Botones, Modales, Inputs)
│   ├── features/           # Lógica de negocio segmentada (CORE)
│   │   ├── auth/           # Login, Registro, Recuperación
│   │   ├── pos/            # Punto de Venta (Terminal interactivo)
│   │   ├── inventory/      # Gestión de productos y stock
│   │   └── ...            # (Categories, Sales, Orders, Dashboard, etc.)
│   ├── hooks/              # Hooks personalizados globales (useMediaQuery, etc.)
│   ├── layouts/            # Estructuras de página (SidebarLayout, AuthLayout)
│   ├── lib/                # Configuraciones de librerías (queryClient, axiosInstance)
│   ├── services/           # Capa de comunicación con la API (Peticiones REST)
│   ├── store/              # Stores de Zustand (Global Store)
│   ├── utils/              # Funciones helper (Formatters, Validadores)
│   ├── App.tsx             # Enrutador principal y configuración de Providers
│   └── main.tsx            # Punto de entrada de la aplicación
├── tests/                  # Pruebas End-to-End con Playwright
├── Dockerfile              # Configuración de contenedor para producción
├── docker-compose.yml      # Orquestación local/dev
├── nginx.conf              # Configuración del servidor para el build de producción
└── vite.config.ts          # Configuración del empaquetador Vite
```

---

## 🛠️ Convenciones y Flujos Importantes

### 1. Manejo de APIs
*   **Interceptores**: El archivo `src/services/api.client.ts` contiene interceptores para inyectar el Token JWT y manejar automáticamente la **renovación de sesión (Refresh Token)** cuando el backend devuelve un 401.
*   **Servicios**: Cada entidad tiene su archivo `.service.ts`. Ejemplo: `product.service.ts` exporta funciones como `getProducts()`.

### 2. Notificaciones y Toasts
*   Se utiliza **Sonner** para notificaciones rápidas y **SweetAlert2** para confirmaciones críticas o errores fatales.
*   Las notificaciones push/interactivas se gestionan a través del `notification.service.ts` conectado al WebSocket.

### 3. Seguridad con Cloudflare Turnstile
*   Los formularios de Auth están protegidos por Turnstile. El widget se carga condicionalmente para evitar bots.

### 4. Flujo de Desarrollo (Docker)
*   `npm run dev`: Inicia el servidor de desarrollo local.
*   `npm run docker:dev`: Levanta el entorno completo (incluyendo dependencias si las hubiera) en contenedores.
*   **Producción**: El build se sirve mediante Nginx dentro de un contenedor Docker minimalista.

---

> [!IMPORTANT]
> **Antes de realizar cambios en la lógica de negocio**, verifica si la funcionalidad pertenece a una característica existente en `src/features` o si debe ser una nueva. Evita duplicar lógica de servicios; siempre revisa `src/services` antes de crear nuevas peticiones API.
