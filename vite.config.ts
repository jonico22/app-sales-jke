import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Si existe VITE_ASSET_URL, usamos esa base (ideal para Cloudflare Pages + R2)
  // Si además existe R2_FOLDER, lo incluimos en la base para que coincida con
  // la ruta donde upload-r2.mjs sube los archivos (ej: prod/assets/...)
  // De lo contrario, usamos '/' para desarrollo local o builds estándar
  const assetUrl = env.VITE_ASSET_URL;
  const r2Folder = env.R2_FOLDER;
  let basePath = '/';
  if (assetUrl) {
    // Asegurar que assetUrl termina con '/'
    const base = assetUrl.endsWith('/') ? assetUrl : `${assetUrl}/`;
    // Añadir el subfolder de R2 si existe (ej: 'prod')
    basePath = r2Folder ? `${base}${r2Folder}/` : base;
  }

  return {
    base: basePath,
    plugins: [
    react(), 
    tailwindcss(),
    visualizer({
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Raise warning threshold slightly — after lazy splitting 500 kB is very conservative
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Keep React out of feature chunks so lazy routes do not force router preloads.
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }

          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/@tanstack/react-query')) return 'query';
          if (id.includes('node_modules/socket.io-client')) return 'socket';
          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform/resolvers') ||
            id.includes('node_modules/zod')
          ) {
            return 'forms';
          }
          if (id.includes('node_modules/date-fns')) return 'dates';
          if (id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) return 'ui-utils';
        },
      },
    },
  },
    server: {
      port: 5173,
      strictPort: false,
      host: true,
    },
  };
})
