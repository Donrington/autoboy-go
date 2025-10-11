import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true,
    // Proxy to local backend (use this for development)
    // Switch to production URL if you want to use the deployed backend
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // Local backend
        // target: 'https://autoboy-go.onrender.com',  // Production backend (403 Forbidden due to CORS)
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Log requests for debugging
            console.log('[Proxy]', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Log responses for debugging
            console.log('[Proxy Response]', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, req, res) => {
            console.error('[Proxy Error]', err.message);
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'gsap', 'framer-motion', 'aos'],
  },
});