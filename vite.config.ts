import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
})
