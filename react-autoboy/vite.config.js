import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  // Get backend proxy URL from environment variables
  const backendProxyUrl = env.VITE_BACKEND_PROXY_URL || 'http://localhost:8080';

  console.log('🚀 Vite Config - Mode:', mode);
  console.log('🔗 Backend Proxy URL:', backendProxyUrl);

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      host: true,
      // Proxy configuration - uses environment variables
      // Development (.env.development): http://localhost:8080
      // Production (.env.production): https://autoboy-go.onrender.com
      proxy: {
        '/api': {
          target: backendProxyUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Log requests for debugging
              console.log('[Proxy]', req.method, req.url, '→', backendProxyUrl);
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
  };
});