# 🌐 Guía de Entornos y Proceso de Despliegue

Esta guía explica cómo funciona la aplicación en sus tres ambientes principales: **Desarrollo**, **Pruebas** y **Producción**. Aquí encontrarás los comandos, configuraciones y el flujo de trabajo necesario para cada etapa.

---

## 🏗️ 1. Ambiente de Desarrollo (Development)

Es el entorno donde se realiza la codificación diaria. Está optimizado para la velocidad de desarrollo y la depuración.

### 📝 Configuración
- **Archivo de variables:** `.env`
- **API URL:** Por defecto apunta a `http://localhost:4000/api`.
- **Características:** 
  - Hot Module Replacement (HMR) para cambios instantáneos.
  - Código sin minificar para facilitar el debugging.
  - Source maps completos.

### 🚀 Comandos principales
```bash
# Iniciar servidor de desarrollo local
npm run dev

# Levantar con Docker (con volumen de datos para cambios en vivo)
npm run docker:dev
```

---

## 🧪 2. Ambiente de Pruebas (Testing)

Este ambiente garantiza la calidad y estabilidad del código antes de llegar a producción. Se divide en dos capas principales:

### A. Pruebas Unitarias y de Integración (Vitest)
Utilizamos **Vitest** para probar componentes y lógica de negocio de forma aislada.
- **Comando:** `npm run test` o `npm run test:ui` (interfaz gráfica).
- **Setup:** Configurado en `vitest.config.ts`.
- **Mocking:** Se utiliza `msw` para interceptar llamadas a la API y simular respuestas.

### B. Pruebas de Extremo a Extremo (E2E - Playwright)
Utilizamos **Playwright** para simular el comportamiento real del usuario en el navegador.
- **Comando:** `npm run test:e2e`
- **Reporte:** `npm run test:e2e:report`
- **Configuración:** `playwright.config.ts`.

---

## 🚀 3. Ambiente de Producción (Production)

El ambiente final donde residen los usuarios. Está optimizado para el rendimiento, seguridad y baja latencia.

### 📝 Configuración
- **Archivo de variables:** `.env.production`
- **Build argument:** Se pasa `VITE_API_URL` durante la construcción del contenedor Docker.
- **Características:**
  - Código minificado y ofuscado.
  - Tree-shaking para eliminar código no utilizado.
  - Compresión Gzip/Brotli activa.

### 📦 Proceso de Despliegue (Pipeline Manual)
Ejecutar `npm run build:prod` inicia el siguiente flujo automático:

1.  **Validación:** Se solicita confirmación manual (script `confirm-prod.mjs`) para evitar despliegues accidentales.
2.  **Construcción:** Se ejecuta `vite build --mode production`, generando la carpeta `dist/`.
3.  **Gestión de Assets (CDN):** El script `upload-r2.mjs` sube automáticamente los archivos estáticos (JS, CSS, imágenes) a **Cloudflare R2**.
    - Los archivos HTML se mantienen en el servidor principal.
    - Los assets en el CDN tienen políticas de cache agresivas (`immutable`).
4.  **Servidor:** En producción, la aplicación corre dentro de un contenedor con **Nginx**, configurado para manejar rutas de SPA (Single Page Application).

### 🚀 Comandos de Producción
```bash
# Construir versión de producción localmente
npm run build:prod

# Levantar el entorno de producción con Docker
npm run docker:prod:build
```

---

## 🐳 Resumen de Docker

| Ambiente | Archivo Compose | Dockerfile | Propósito |
| :--- | :--- | :--- | :--- |
| **Desarrollo** | `docker-compose.dev.yml` | `Dockerfile.dev` | Live coding, herramientas de desarrollo. |
| **Producción** | `docker-compose.yml` | `Dockerfile` | Rendimiento, Nginx, seguridad non-root. |

---

> [!TIP]
> **¿Por qué usamos Cloudflare R2?**
> Al subir los archivos `.js` y `.css` a un CDN (R2), la aplicación carga mucho más rápido para los usuarios finales, ya que los archivos se sirven desde el nodo más cercano a ellos y se reduce la carga en el servidor de Nginx.
