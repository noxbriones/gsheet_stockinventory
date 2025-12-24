import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['gapi', 'gapi.auth2'],
  },
  define: {
    global: 'globalThis',
  },
  // Base path for deployment to subdirectories (e.g., /app/)
  // Set VITE_BASE_PATH environment variable if deploying to a subdirectory
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    // Generate source maps for production debugging (optional)
    sourcemap: false,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})

