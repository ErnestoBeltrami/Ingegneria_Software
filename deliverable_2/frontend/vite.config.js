import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  optimizeDeps: {
    include: ['recharts', 'recharts/es6/index'],
  },

  server: {
    port: 5173,

    proxy: {
      '/operatore': {
        target: BACKEND_URL,
        changeOrigin: true,
        bypass(req) {
          if (req.url === '/operatore/profilo') return req.url;
        },
      },

      '/auth': {
        target: BACKEND_URL,
        changeOrigin: true,
        bypass(req) {
          if (req.url.startsWith('/auth/callback')) return req.url;
        },
      },

      '/votazioni': {
        target: BACKEND_URL,
        changeOrigin: true,
      },

      '/sondaggio': {
        target: BACKEND_URL,
        changeOrigin: true,
      },

      '/categorie': {
        target: BACKEND_URL,
        changeOrigin: true,
      },

      '/iniziative': {
        target: BACKEND_URL,
        changeOrigin: true,
      },

      '/notifiche': {
        target: BACKEND_URL,
        changeOrigin: true,
      },

      '/cittadino': {
        target: BACKEND_URL,
        changeOrigin: true,
        bypass(req) {
          const frontendRoutes = [
            '/cittadino/dashboard',
            '/cittadino/bacheca',
            '/cittadino/votazione',
            '/cittadino/sondaggio',
            '/cittadino/iniziativa',
            '/cittadino/profilo',
            '/cittadino/archivio',
          ];

          if (frontendRoutes.some(p => req.url.startsWith(p))) {
            return req.url;
          }
        },
      },
    },
  },
});