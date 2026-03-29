import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Si existe VITE_ASSET_URL, usamos esa base (ideal para Cloudflare Pages + R2)
  // De lo contrario, usamos '/' para desarrollo local o builds estándar
  const basePath = env.VITE_ASSET_URL || '/';

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
        manualChunks: {
          // Core React runtime — tiny and always needed
          'react-vendor': ['react', 'react-dom'],
          // Routing
          'router': ['react-router-dom'],
          // Form validation
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Data fetching / caching
          'query': ['@tanstack/react-query'],
          // Date utilities (heavy)
          'dates': ['date-fns'],
          // Real-time
          'socket': ['socket.io-client'],
          // UI Helpers
          'ui-utils': ['clsx', 'tailwind-merge'],
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
